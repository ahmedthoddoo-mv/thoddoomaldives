import { createSupabaseServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { Json } from '@/lib/supabase/types';
import crypto from 'crypto';
import { AgreementAcceptanceStatements } from './types';

type AgreementAuthUser = {
  id: string;
};

export type AgreementServiceClient = {
  auth: {
    getUser: () => Promise<{ data: { user: AgreementAuthUser | null }; error: Error | null }>;
  };
  from: SupabaseClient<Database>['from'];
  rpc: SupabaseClient<Database>['rpc'];
};

/**
 * Computes deterministic SHA-256 hash of agreement content
 * Used to verify agreement immutability after publication
 */
export function computeAgreementContentHash(fullText: string): string {
  return crypto.createHash('sha256').update(fullText, 'utf-8').digest('hex');
}

/**
 * Create a draft agreement version
 * Only platform_owner/admin can create drafts
 */
export async function createAgreementDraft(
  title: string,
  slug: string,
  contentType: 'markdown' | 'html' | 'json_sections',
  fullText: string,
  sections: Record<string, string>,
  summary: string,
  acceptanceDeadlineDays?: number,
  clientOverride?: AgreementServiceClient
) {
  const authClient = clientOverride ?? createSupabaseServerClient();
  const writeClient = createSupabaseServiceRoleClient() ?? authClient;
  if (!authClient || !writeClient) throw new Error("Supabase client not configured");
  const { data: user, error: userError } = await authClient.auth.getUser();

  if (userError || !user?.user?.id) {
    throw new Error('Authentication required');
  }

  // Check authorization: must be platform_owner or admin
  const { data: platformRoles, error: roleError } = await writeClient
    .from('partner_user_roles')
    .select(
      `
      id,
      partner_roles!inner(
        code,
        scope_type
      )
    `
    )
    .eq('auth_user_id', user.user.id)
    .in('partner_roles.code', ['platform_owner', 'admin'])
    .eq('partner_roles.scope_type', 'platform');

  if (roleError || (platformRoles && platformRoles.length === 0)) {
    throw new Error('Only platform staff can create agreement drafts');
  }
  const actorRole = (platformRoles as Array<{ partner_roles?: { code?: string } }>)[0]?.partner_roles?.code ?? null;

  // Find next version number
  const { data: latestVersion } = await writeClient
    .from('agreement_versions')
    .select('version_number')
    .eq('slug', slug)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersionNumber = latestVersion && latestVersion.length > 0 ? latestVersion[0].version_number + 1 : 1;

  // Create draft version
  const { data: versionData, error: versionError } = await writeClient
    .from('agreement_versions')
    .insert({
      version_number: nextVersionNumber,
      title,
      slug,
      status: 'draft',
      material_change: false,
      acceptance_deadline_days: acceptanceDeadlineDays || null,
      summary,
    })
    .select()
    .single();

  if (versionError) {
    throw new Error(`Failed to create agreement draft: ${versionError.message}`);
  }

  // Compute content hash
  const contentHash = computeAgreementContentHash(fullText);

  // Create content record
  const { error: contentError } = await writeClient.from('agreement_content').insert({
    agreement_version_id: versionData.id,
    content_type: contentType,
    full_text: fullText,
    sections,
    summary,
    content_hash: contentHash,
  });

  if (contentError) {
    throw new Error(`Failed to create agreement content: ${contentError.message}`);
  }

  // Audit log
  await logAgreementOperation(user.user.id, versionData.id, 'agreement.draft_created', {
    title,
    slug,
    version_number: nextVersionNumber,
  }, null, actorRole);

  return versionData;
}

/**
 * Update a draft agreement
 * Only editable if status === 'draft'
 */
export async function updateAgreementDraft(
  versionId: string,
  updates: {
    title?: string;
    fullText?: string;
    sections?: Record<string, string>;
    summary?: string;
  },
  clientOverride?: AgreementServiceClient
) {
  const authClient = clientOverride ?? createSupabaseServerClient();
  const writeClient = createSupabaseServiceRoleClient() ?? authClient;
  if (!authClient || !writeClient) throw new Error("Supabase client not configured");
  const { data: user, error: userError } = await authClient.auth.getUser();

  if (userError || !user?.user?.id) {
    throw new Error('Authentication required');
  }

  const { data: platformRoles, error: roleError } = await writeClient
    .from('partner_user_roles')
    .select(
      `
      id,
      partner_roles!inner(
        code,
        scope_type
      )
    `
    )
    .eq('auth_user_id', user.user.id)
    .in('partner_roles.code', ['platform_owner', 'admin'])
    .eq('partner_roles.scope_type', 'platform');

  if (roleError || (platformRoles && platformRoles.length === 0)) {
    throw new Error('Only platform staff can edit agreement drafts');
  }

  // Verify draft status
  const { data: version, error: versionError } = await authClient
    .from('agreement_versions')
    .select('status')
    .eq('id', versionId)
    .single();

  if (versionError) {
    throw new Error('Agreement not found');
  }

  if (version.status !== 'draft') {
    throw new Error('Only draft agreements can be edited');
  }

  // Update version fields if provided
  if (updates.title || updates.summary !== undefined) {
    const { error: updateError } = await writeClient
      .from('agreement_versions')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.summary !== undefined && { summary: updates.summary }),
      })
      .eq('id', versionId);

    if (updateError) {
      throw new Error(`Failed to update agreement: ${updateError.message}`);
    }
  }

  // Update content if provided
  if (updates.fullText || updates.sections || updates.summary) {
    const contentHash = updates.fullText ? computeAgreementContentHash(updates.fullText) : undefined;

    const { error: contentError } = await writeClient
      .from('agreement_content')
      .update({
        ...(updates.fullText && { full_text: updates.fullText, content_hash: contentHash }),
        ...(updates.sections && { sections: updates.sections }),
        ...(updates.summary !== undefined && { summary: updates.summary }),
      })
      .eq('agreement_version_id', versionId);

    if (contentError) {
      throw new Error(`Failed to update agreement content: ${contentError.message}`);
    }
  }

  // Audit log
  await logAgreementOperation(user.user.id, versionId, 'agreement.draft_edited', {
    updated_fields: Object.keys(updates),
  });
}

/**
 * Publish a draft agreement version
 * Creates content hash, marks as published, records publisher
 * Published versions are IMMUTABLE
 */
export async function publishAgreement(
  versionId: string,
  effectiveDate: Date,
  clientOverride?: AgreementServiceClient
) {
  const authClient = clientOverride ?? createSupabaseServerClient();
  const writeClient = createSupabaseServiceRoleClient() ?? authClient;
  if (!authClient || !writeClient) throw new Error("Supabase client not configured");
  const { data: user, error: userError } = await authClient.auth.getUser();

  if (userError || !user?.user?.id) {
    throw new Error('Authentication required');
  }

  // Check authorization
  const { data: platformRoles, error: roleError } = await writeClient
    .from('partner_user_roles')
    .select(
      `
      id,
      partner_roles!inner(
        code,
        scope_type
      )
    `
    )
    .eq('auth_user_id', user.user.id)
    .in('partner_roles.code', ['platform_owner', 'admin'])
    .eq('partner_roles.scope_type', 'platform');

  if (roleError || (platformRoles && platformRoles.length === 0)) {
    throw new Error('Only platform staff can publish agreements');
  }
  const actorRole = (platformRoles as Array<{ partner_roles?: { code?: string } }>)[0]?.partner_roles?.code ?? null;

  // Verify draft status
  const { data: version, error: versionError } = await writeClient
    .from('agreement_versions')
    .select('status, slug')
    .eq('id', versionId)
    .single();

  if (versionError) {
    throw new Error('Agreement not found');
  }

  if (version.status !== 'draft') {
    throw new Error('Only draft agreements can be published');
  }

  // Get content to verify hash
  const { data: content, error: contentError } = await writeClient
    .from('agreement_content')
    .select('content_hash, full_text')
    .eq('agreement_version_id', versionId)
    .single();

  if (contentError || !content) {
    throw new Error('Agreement content not found');
  }

  // Verify content hash
  const computedHash = computeAgreementContentHash(content.full_text);
  if (computedHash !== content.content_hash) {
    throw new Error('Content hash mismatch: content may have been tampered with');
  }

  // Mark as published
  const { error: publishError } = await writeClient
    .from('agreement_versions')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      published_by_auth_user_id: user.user.id,
      effective_at: effectiveDate.toISOString(),
    })
    .eq('id', versionId);

  if (publishError) {
    throw new Error(`Failed to publish agreement: ${publishError.message}`);
  }

  // Audit log
  await logAgreementOperation(user.user.id, versionId, 'agreement.published', {
    effective_date: effectiveDate.toISOString(),
    content_hash: content.content_hash,
  }, null, actorRole);

  return { versionId, publishedAt: new Date(), contentHash: content.content_hash };
}

/**
 * Record acceptance of an agreement by a partner representative
 * Server-side controlled: resolves all auth/role/hash server-side
 * Returns idempotently if already accepted to prevent duplicate records
 */
export async function acceptAgreement(
  partnerId: string,
  agreementVersionId: string,
  acceptanceStatements: AgreementAcceptanceStatements,
  clientIp?: string,
  userAgent?: string,
  clientOverride?: AgreementServiceClient
) {
  const authClient = clientOverride ?? createSupabaseServerClient();
  const writeClient = createSupabaseServiceRoleClient() ?? authClient;
  if (!authClient || !writeClient) throw new Error("Supabase client not configured");
  const { data: user, error: userError } = await authClient.auth.getUser();

  if (userError || !user?.user?.id) {
    throw new Error('Authentication required');
  }

  // Authorization: Only partner_owner for this exact partner can accept
  const { data: partnerRoles, error: roleError } = await writeClient
    .from('partner_user_roles')
    .select(
      `
      id,
      partner_roles!inner(
        code
      )
    `
    )
    .eq('auth_user_id', user.user.id)
    .eq('partner_id', partnerId)
    .eq('partner_roles.code', 'partner_owner');

  if (roleError || (partnerRoles && partnerRoles.length === 0)) {
    throw new Error('Only partner_owner can accept agreements for this partner');
  }

  // Get agreement version and content
  const { data: version, error: versionError } = await writeClient
    .from('agreement_versions')
    .select('id, status, published_at')
    .eq('id', agreementVersionId)
    .single();

  if (versionError || !version) {
    throw new Error('Agreement version not found');
  }

  if (version.status !== 'published') {
    throw new Error('Only published agreements can be accepted');
  }

  // Get content and hash
  const { data: content, error: contentError } = await writeClient
    .from('agreement_content')
    .select('content_hash, full_text')
    .eq('agreement_version_id', agreementVersionId)
    .single();

  if (contentError || !content) {
    throw new Error('Agreement content not found');
  }

  // Verify content hash hasn't changed since publication
  const currentHash = computeAgreementContentHash(content.full_text);
  if (currentHash !== content.content_hash) {
    throw new Error('Agreement content has changed since publication; cannot accept');
  }

  // Create acceptance record using database-level idempotent function
  // This ensures concurrency safety with database-level UNIQUE constraint + ON CONFLICT handling
  const acceptanceEvidence = {
    read_confirmation: true,
    agreement_acceptance: true,
    authorized_person: 'Partner Owner',
    client_info: {
      ip_address: clientIp,
      user_agent: userAgent,
    },
  };

  const { data: acceptanceResult, error: acceptanceError } = await writeClient.rpc(
    'accept_agreement_idempotent',
    {
      p_partner_id: partnerId,
      p_agreement_version_id: agreementVersionId,
      p_accepting_user_id: user.user.id,
      p_acceptance_evidence: acceptanceEvidence,
      p_acceptance_method: 'web',
      p_ip_address: clientIp || undefined,
      p_user_agent: userAgent || undefined,
    }
  );

  if (acceptanceError) {
    throw new Error(`Failed to record acceptance: ${acceptanceError.message}`);
  }

  if (!acceptanceResult || !Array.isArray(acceptanceResult) || acceptanceResult.length === 0) {
    throw new Error('Acceptance function returned unexpected result');
  }

  const acceptance = acceptanceResult[0];
  const { acceptance_id, accepted_at, is_new_acceptance } = acceptance;

  // Create evidence record only if this is a new acceptance
  if (is_new_acceptance) {
    const correlationId = `accept-${partnerId}-${agreementVersionId}-${Date.now()}`;
    const { error: evidenceError } = await writeClient.from('agreement_acceptance_evidence').insert({
      acceptance_id: acceptance_id,
      content_hash_accepted: content.content_hash,
      accepted_by_auth_user_id: user.user.id,
      accepting_role: 'partner_owner',
      accepted_at: accepted_at,
      ip_address: clientIp || null,
      user_agent: userAgent || null,
      acceptance_statements: {
        read_confirmation: true,
        agreement_acceptance: true,
        authorized_person: 'Partner Owner',
      } as unknown as Json,
      correlation_id: correlationId,
    });

    if (evidenceError) {
      console.warn(`Failed to record acceptance evidence: ${evidenceError.message}`);
      // Don't fail the acceptance if evidence recording fails; acceptance is already recorded
    }

    // Update partner_agreement
    const { error: updateError } = await writeClient
      .from('partner_agreements')
      .update({
        requirement_state: 'accepted',
        accepted_version_id: agreementVersionId,
        accepted_at: accepted_at,
        requires_reacceptance: false,
      })
      .eq('partner_id', partnerId);

    if (updateError) {
      console.warn(`Failed to update partner agreement: ${updateError.message}`);
      // Don't fail; acceptance is already recorded
    }

    // Audit log
    await logAgreementOperation(user.user.id, agreementVersionId, 'agreement.accepted', {
      partner_id: partnerId,
      acceptance_id: acceptance_id,
      new_acceptance: true,
    }, partnerId, 'partner_owner');
  }

  return {
    acceptance_id,
    already_accepted: !is_new_acceptance,
    accepted_at,
  };
}

/**
 * Helper: Log agreement operations to audit trail
 */
async function logAgreementOperation(
  authUserId: string,
  versionId: string,
  eventType: string,
  metadata: Record<string, unknown>,
  partnerId: string | null = null,
  actorRole: string | null = null
) {
  const client = createSupabaseServiceRoleClient();
  if (!client) {
    console.warn('Service role client not configured; skipping audit log');
    return;
  }

  await client.from('partner_audit_log').insert({
    partner_id: partnerId,
    actor_auth_user_id: authUserId,
    actor_role: actorRole,
    event_type: eventType,
    entity_type: 'agreement_version',
    entity_id: versionId,
    before_payload: {} as Json,
    after_payload: { ...metadata, agreement_version_id: versionId } as unknown as Json,
    source: 'system',
  });
}

/**
 * Retrieve a published agreement with content for partner viewing
 */
export async function getPublishedAgreement(versionId: string) {
  const client = createSupabaseServerClient()
  if (!client) throw new Error("Supabase client not configured")
  const supabase = client;

  const { data: version, error: versionError } = await supabase
    .from('agreement_versions')
    .select('*')
    .eq('id', versionId)
    .eq('status', 'published')
    .single();

  if (versionError) {
    throw new Error('Agreement not found or not published');
  }

  const { data: content, error: contentError } = await supabase
    .from('agreement_content')
    .select('*')
    .eq('agreement_version_id', versionId)
    .single();

  if (contentError) {
    throw new Error('Agreement content not found');
  }

  return {
    version,
    content,
  };
}
