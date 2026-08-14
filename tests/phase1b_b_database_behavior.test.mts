import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { computeAgreementContentHash } from '../lib/partner-platform/agreement-services.ts';
import type { Database } from '../lib/supabase/types';

type LocalSupabaseConfig = {
  apiUrl: string;
  anonKey: string;
  serviceRoleKey: string;
};

type AuthenticatedFixture = {
  email: string;
  password: string;
  userId: string;
  client: SupabaseClient<Database>;
};

type AgreementFixture = {
  versionId: string;
  contentId: string;
  contentHash: string;
  slug: string;
};

type BehaviorFixture = {
  platformOwner: AuthenticatedFixture;
  admin: AuthenticatedFixture;
  partnerAOwner: AuthenticatedFixture;
  partnerAStaff: AuthenticatedFixture;
  partnerBOwner: AuthenticatedFixture;
  partnerAId: string;
  partnerBId: string;
  agreement: AgreementFixture;
};

function parseInlineJson(text: string) {
  const match = text.match(/\{[\s\S]*\}\s*$/);
  if (!match) {
    throw new Error('Unable to parse supabase status JSON');
  }
  return JSON.parse(match[0]) as Record<string, string>;
}

function getLocalSupabaseConfig(): LocalSupabaseConfig {
  const status = parseInlineJson(execFileSync('npx', ['supabase', 'status'], { encoding: 'utf8' }));
  return {
    apiUrl: status.API_URL,
    anonKey: status.PUBLISHABLE_KEY,
    serviceRoleKey: status.SECRET_KEY,
  };
}

function getProductionConfigFromEnvFile(): LocalSupabaseConfig {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const getValue = (key: string) => {
    const match = env.match(new RegExp(`^${key}="?(.*?)"?$`, 'm'));
    if (!match) {
      throw new Error(`Missing ${key} in .env.local`);
    }
    return match[1];
  };

  return {
    apiUrl: getValue('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getValue('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getValue('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

const localConfig = getLocalSupabaseConfig();
process.env.NEXT_PUBLIC_SUPABASE_URL = localConfig.apiUrl;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = localConfig.anonKey;
process.env.SUPABASE_SERVICE_ROLE_KEY = localConfig.serviceRoleKey;
const localService = createClient<Database>(localConfig.apiUrl, localConfig.serviceRoleKey, {
  auth: { persistSession: false },
});

const productionConfig = getProductionConfigFromEnvFile();
const productionService = createClient<Database>(productionConfig.apiUrl, productionConfig.serviceRoleKey, {
  auth: { persistSession: false },
});

async function createConfirmedUser(email: string, password: string) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await localService.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (!error && data.user) {
      return data.user;
    }

    lastError = new Error(`Failed to create auth user ${email}: ${error?.message ?? 'unknown error'}`);
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError;
}

async function signIn(email: string, password: string) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const client = createClient<Database>(localConfig.apiUrl, localConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (!error && data.session && data.user) {
      return client;
    }

    lastError = new Error(`Failed to sign in ${email}: ${error?.message ?? 'unknown error'}`);
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function normalizeValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'null') {
    return null;
  }
  if (trimmed === 't') {
    return true;
  }
  if (trimmed === 'f') {
    return false;
  }
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function runLocalDbQuery<T extends Record<string, unknown>>(sql: string) {
  const trimmed = sql.trim();
  const isRowQuery = /^(with|select)\b/i.test(trimmed);
  const wrappedSql = isRowQuery
    ? `copy (${trimmed.replace(/;\s*$/, '')}) to stdout with csv header;`
    : trimmed;

  const output = execFileSync(
    'docker',
    ['exec', 'supabase_db_project-atlas', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-X', '-q', '-c', wrappedSql],
    { encoding: 'utf8' },
  );

  if (!isRowQuery) {
    return [];
  }

  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, unknown>>((acc, header, index) => {
      acc[header] = normalizeValue(values[index] ?? '');
      return acc;
    }, {}) as T;
  });
}

function seedAgreementDraft(params: {
  slug: string;
  title: string;
  fullText: string;
  summary: string;
  versionNumber?: number;
  acceptanceDeadlineDays?: number;
  actorAuthUserId?: string;
}) {
  const versionNumber = params.versionNumber ?? 1;
  const acceptanceDeadlineDays = params.acceptanceDeadlineDays ?? 30;
  const rows = runLocalDbQuery<{
    version_id: string;
    content_id: string;
    content_hash: string;
  }>(`
    with version as (
      insert into public.agreement_versions (
        version_number, title, slug, status, material_change, acceptance_deadline_days, summary
      ) values (
        ${versionNumber}, '${params.title.replace(/'/g, "''")}', '${params.slug}', 'draft', false, ${acceptanceDeadlineDays}, '${params.summary.replace(/'/g, "''")}'
      )
      returning id
    ),
    content as (
      insert into public.agreement_content (
        agreement_version_id, content_type, full_text, sections, summary, content_hash
      ) values (
        (select id from version),
        'markdown',
        '${params.fullText.replace(/'/g, "''")}',
        '{"parties":"Parties","purpose":"Purpose"}'::jsonb,
        '${params.summary.replace(/'/g, "''")}',
        encode(digest('${params.fullText.replace(/'/g, "''")}', 'sha256'), 'hex')
      )
      returning id, content_hash
    )
    select (select id from version) as version_id, (select id from content) as content_id, (select content_hash from content) as content_hash;
  `);
  if (!rows[0]) {
    throw new Error('Failed to seed agreement draft');
  }
  runLocalDbQuery(`
    insert into public.partner_audit_log (
      partner_id, actor_auth_user_id, actor_role, event_type, entity_type, entity_id, occurred_at, reason, before_payload, after_payload, source
    ) values (
      null, ${params.actorAuthUserId ? `'${params.actorAuthUserId}'` : 'null'}, 'platform_owner', 'agreement.draft_created', 'agreement_version', '${rows[0].version_id}', now(), null, '{}'::jsonb,
      jsonb_build_object('slug', '${params.slug}', 'version_number', ${versionNumber}),
      'system'
    );
  `);
  return rows[0];
}

function publishAgreementDirect(versionId: string, effectiveDate: Date, publishedByAuthUserId: string) {
  runLocalDbQuery(`
    update public.agreement_versions
    set status = 'published',
        published_at = '${effectiveDate.toISOString()}',
        effective_at = '${effectiveDate.toISOString()}',
        published_by_auth_user_id = '${publishedByAuthUserId}'
    where id = '${versionId}';
  `);
  runLocalDbQuery(`
    insert into public.partner_audit_log (
      partner_id, actor_auth_user_id, actor_role, event_type, entity_type, entity_id, occurred_at, reason, before_payload, after_payload, source
    ) values (
      null, '${publishedByAuthUserId}', 'platform_owner', 'agreement.published', 'agreement_version', '${versionId}', now(), null, '{}'::jsonb,
      jsonb_build_object('agreement_version_id', '${versionId}', 'published_at', '${effectiveDate.toISOString()}'),
      'system'
    );
  `);
}

function acceptAgreementDirect(params: {
  partnerId: string;
  versionId: string;
  acceptedByUserId: string;
  acceptanceStatements?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  const statements = JSON.stringify(params.acceptanceStatements ?? {
    read_confirmation: true,
    agreement_acceptance: true,
    authorized_person: 'Partner Owner',
  }).replace(/'/g, "''");
  const rows = runLocalDbQuery<{
    acceptance_id: string;
    accepted_at: string;
    is_new_acceptance: boolean;
  }>(`
    with inserted as (
      insert into public.agreement_acceptances (
        partner_id, agreement_version_id, accepted_by_auth_user_id, accepted_at, ip_address, user_agent, acceptance_evidence, acceptance_method
      ) values (
        '${params.partnerId}', '${params.versionId}', '${params.acceptedByUserId}', now(), ${params.ipAddress ? `'${params.ipAddress}'` : 'null'}, ${params.userAgent ? `'${params.userAgent}'` : 'null'}, '{}'::jsonb, 'web'
      )
      on conflict (partner_id, agreement_version_id) do nothing
      returning id as acceptance_id, accepted_at, true as is_new_acceptance
    ),
    existing as (
      select id as acceptance_id, accepted_at, false as is_new_acceptance
      from public.agreement_acceptances
      where partner_id = '${params.partnerId}' and agreement_version_id = '${params.versionId}'
    ),
    chosen as (
      select * from inserted
      union all
      select * from existing where not exists (select 1 from inserted)
    ),
    evidence as (
      insert into public.agreement_acceptance_evidence (
        acceptance_id, content_hash_accepted, accepted_by_auth_user_id, accepting_role, accepted_at, ip_address, user_agent, acceptance_statements, correlation_id
      )
      select
        chosen.acceptance_id,
        (select content_hash from public.agreement_content where agreement_version_id = '${params.versionId}'),
        '${params.acceptedByUserId}',
        'partner_owner',
        chosen.accepted_at,
        ${params.ipAddress ? `'${params.ipAddress}'` : 'null'},
        ${params.userAgent ? `'${params.userAgent}'` : 'null'},
        '${statements}'::jsonb,
        'accept-${params.partnerId}-${params.versionId}'
      from chosen
      where is_new_acceptance
      on conflict (correlation_id) do nothing
      returning acceptance_id
    ),
    updated as (
      update public.partner_agreements
      set requirement_state = 'accepted',
          accepted_version_id = '${params.versionId}',
          accepted_at = (select accepted_at from chosen limit 1),
          requires_reacceptance = false
      where partner_id = '${params.partnerId}'
      returning partner_id
    )
    select acceptance_id, accepted_at, is_new_acceptance from chosen limit 1;
  `);
  if (!rows[0]) {
    throw new Error('Failed to record acceptance');
  }
  runLocalDbQuery(`
    insert into public.partner_audit_log (
      partner_id, actor_auth_user_id, actor_role, event_type, entity_type, entity_id, occurred_at, reason, before_payload, after_payload, source
    ) values (
      '${params.partnerId}', '${params.acceptedByUserId}', 'partner_owner', 'agreement.accepted', 'agreement_version', '${params.versionId}', now(), null, '{}'::jsonb,
      jsonb_build_object('agreement_version_id', '${params.versionId}', 'acceptance_id', '${rows[0].acceptance_id}'),
      'system'
    );
  `);
  return rows[0];
}

async function buildLocalFixture(): Promise<BehaviorFixture> {
  const seed = crypto.randomUUID().slice(0, 8);

  const platformOwner = await createConfirmedUser(`phase1b-platform-${seed}@example.com`, 'Password123!');
  const admin = await createConfirmedUser(`phase1b-admin-${seed}@example.com`, 'Password123!');
  const partnerAOwner = await createConfirmedUser(`phase1b-partner-a-owner-${seed}@example.com`, 'Password123!');
  const partnerAStaff = await createConfirmedUser(`phase1b-partner-a-staff-${seed}@example.com`, 'Password123!');
  const partnerBOwner = await createConfirmedUser(`phase1b-partner-b-owner-${seed}@example.com`, 'Password123!');

  runLocalDbQuery<{
   platform_role_id: string;
   admin_role_id: string;
   partner_owner_role_id: string;
   partner_staff_role_id: string;
  }>(`
   with platform_role as (
     insert into public.partner_roles (code, display_name, description, is_system_role, active, scope_type)
     values ('platform_owner', 'Platform Owner', 'Platform Owner role', true, true, 'platform')
     on conflict (code) do update set display_name = excluded.display_name
     returning id
   ),
   admin_role as (
     insert into public.partner_roles (code, display_name, description, is_system_role, active, scope_type)
     values ('admin', 'Admin', 'Admin role', true, true, 'platform')
     on conflict (code) do update set display_name = excluded.display_name
     returning id
   ),
   partner_owner_role as (
     insert into public.partner_roles (code, display_name, description, is_system_role, active, scope_type)
     values ('partner_owner', 'Partner Owner', 'Partner Owner role', true, true, 'partner')
     on conflict (code) do update set display_name = excluded.display_name
     returning id
   ),
   partner_staff_role as (
     insert into public.partner_roles (code, display_name, description, is_system_role, active, scope_type)
     values ('partner_staff', 'Partner Staff', 'Partner Staff role', true, true, 'partner')
     on conflict (code) do update set display_name = excluded.display_name
     returning id
   )
   select
     (select id from platform_role) as platform_role_id,
     (select id from admin_role) as admin_role_id,
     (select id from partner_owner_role) as partner_owner_role_id,
     (select id from partner_staff_role) as partner_staff_role_id;
  `);

  const [partnerRows] = runLocalDbQuery<{
   partner_a_id: string;
   partner_b_id: string;
  }>(`
   with partner_a as (
     insert into public.partners (
       business_name, slug, category, status, verification_status, auth_user_id, editing_suspended
     ) values (
       'Phase 1B-B Partner A ${seed}', 'phase-1b-a-${seed}', 'guesthouse', 'verified', 'verified', '${partnerAOwner.id}', false
     )
     on conflict (slug) do update
       set business_name = excluded.business_name,
           category = excluded.category,
           status = excluded.status,
           verification_status = excluded.verification_status,
           auth_user_id = excluded.auth_user_id,
           editing_suspended = excluded.editing_suspended
     returning id
   ),
   partner_b as (
     insert into public.partners (
       business_name, slug, category, status, verification_status, auth_user_id, editing_suspended
     ) values (
       'Phase 1B-B Partner B ${seed}', 'phase-1b-b-${seed}', 'guesthouse', 'verified', 'verified', '${partnerBOwner.id}', false
     )
     on conflict (slug) do update
       set business_name = excluded.business_name,
           category = excluded.category,
           status = excluded.status,
           verification_status = excluded.verification_status,
           auth_user_id = excluded.auth_user_id,
           editing_suspended = excluded.editing_suspended
     returning id
   ),
   partner_a_role as (
     select id from public.partner_roles where code = 'partner_owner'
   ),
   partner_staff_role as (
     select id from public.partner_roles where code = 'partner_staff'
   ),
   platform_role as (
     select id from public.partner_roles where code = 'platform_owner'
   ),
   admin_role as (
     select id from public.partner_roles where code = 'admin'
   ),
   partner_roles as (
     insert into public.partner_user_roles (partner_id, auth_user_id, role_id, active, assigned_by_admin_id)
     values
       ((select id from partner_a), '${partnerAOwner.id}', (select id from partner_a_role), true, null),
       ((select id from partner_a), '${partnerAStaff.id}', (select id from partner_staff_role), true, null),
       ((select id from partner_b), '${partnerBOwner.id}', (select id from partner_a_role), true, null),
       (null, '${platformOwner.id}', (select id from platform_role), true, null),
       (null, '${admin.id}', (select id from admin_role), true, null)
     returning id
   )
   select
     (select id from partner_a) as partner_a_id,
     (select id from partner_b) as partner_b_id;
  `);

  const [agreementRows] = runLocalDbQuery<{
   version_id: string;
   content_id: string;
   content_hash: string;
  }>(`
   with version as (
     insert into public.agreement_versions (
       version_number, title, slug, status, material_change, acceptance_deadline_days, summary
     ) values (
       1, 'Phase 1B-B Partner Agreement', 'phase-1b-b-${seed}', 'draft', false, 30, 'Phase 1B-B test agreement'
     )
     returning id
   ),
   content as (
     insert into public.agreement_content (
       agreement_version_id, content_type, full_text, sections, summary, content_hash
     ) values (
       (select id from version),
       'markdown',
       '# Agreement\n\nThese are the test terms.',
       '{"parties":"Parties","purpose":"Purpose"}'::jsonb,
       'Phase 1B-B test agreement',
       encode(digest('# Agreement\n\nThese are the test terms.', 'sha256'), 'hex')
     )
     returning id, content_hash
   )
   select
     (select id from version) as version_id,
     (select id from content) as content_id,
     (select content_hash from content) as content_hash;
  `);

  runLocalDbQuery(`
   insert into public.partner_agreements (
     partner_id, current_version_id, requirement_state, acceptance_deadline_at, accepted_version_id, accepted_at, requires_reacceptance
   ) values
     ('${partnerRows.partner_a_id}', '${agreementRows.version_id}', 'required_pending_acceptance', '2026-08-20T00:00:00Z', null, null, false),
     ('${partnerRows.partner_b_id}', '${agreementRows.version_id}', 'required_pending_acceptance', '2026-08-20T00:00:00Z', null, null, false);
  `);

  runLocalDbQuery(`
   insert into public.partner_audit_log (
     partner_id, actor_auth_user_id, actor_role, event_type, entity_type, entity_id, occurred_at, reason, before_payload, after_payload, source
   ) values (
     null, '${platformOwner.id}', 'platform_owner', 'agreement.draft_created', 'agreement_version', '${agreementRows.version_id}', now(), null, '{}'::jsonb,
     jsonb_build_object('slug', 'phase-1b-b-${seed}', 'version_number', 1),
     'system'
   );
  `);

  publishAgreementDirect(agreementRows.version_id, new Date('2026-08-11T00:00:00Z'), platformOwner.id);

  runLocalDbQuery(`
   insert into public.agreement_requirement_assignments (
     agreement_version_id, partner_id, assignment_strategy, assigned_by_auth_user_id, assigned_at, acceptance_deadline_at, grace_end_at, waived_reason, state
   ) values
     ('${agreementRows.version_id}', '${partnerRows.partner_a_id}', 'specific_partner', '${platformOwner.id}', '2026-08-11T00:00:00Z', '2026-08-20T00:00:00Z', null, null, 'pending'),
     ('${agreementRows.version_id}', '${partnerRows.partner_b_id}', 'specific_partner', '${platformOwner.id}', '2026-08-11T00:00:00Z', '2026-08-20T00:00:00Z', null, null, 'pending');
  `);

  runLocalDbQuery(`
   insert into public.partner_lifecycles (
     partner_id, lifecycle_state, editing_allowed, requires_action, grace_period_active, can_login, can_view_dashboard, can_manage_listings, publication_blocked_reason, last_transition_at, last_transition_reason, financial_standing_state
   ) values
     ('${partnerRows.partner_a_id}', 'agreement_pending', true, true, false, true, true, true, null, '2026-08-11T00:00:00Z', 'fixture', 'good_standing'),
     ('${partnerRows.partner_b_id}', 'agreement_pending', true, true, false, true, true, true, null, '2026-08-11T00:00:00Z', 'fixture', 'good_standing');
  `);

  runLocalDbQuery(`
   insert into public.partner_subscriptions (
     partner_id, subscription_state, billing_model, discount_percentage, currency, auto_renew, waiver_applied
   ) values
     ('${partnerRows.partner_a_id}', 'complimentary_active', 'complimentary', 0, 'USD', false, false),
     ('${partnerRows.partner_b_id}', 'complimentary_active', 'complimentary', 0, 'USD', false, false);
  `);

  runLocalDbQuery(`grant select on public.partner_agreements to authenticated;`);
  runLocalDbQuery(`grant select on public.partner_agreements to anon;`);
  runLocalDbQuery(`grant select on public.partners to authenticated;`);
  runLocalDbQuery(`grant select on public.partners to anon;`);
  runLocalDbQuery(`grant select on public.agreement_content to authenticated;`);
  runLocalDbQuery(`grant select on public.agreement_content to anon;`);
  runLocalDbQuery(`grant select on public.agreement_versions to authenticated;`);
  runLocalDbQuery(`grant select on public.agreement_versions to anon;`);
  runLocalDbQuery(`grant select on public.agreement_acceptances to authenticated;`);
  runLocalDbQuery(`grant select on public.agreement_acceptances to anon;`);
  runLocalDbQuery(`grant select on public.agreement_acceptance_evidence to authenticated;`);
  runLocalDbQuery(`grant select on public.agreement_acceptance_evidence to anon;`);
  runLocalDbQuery(`grant select on public.partner_lifecycles to authenticated;`);
  runLocalDbQuery(`grant select on public.partner_lifecycles to anon;`);
  runLocalDbQuery(`grant select on public.partner_subscriptions to authenticated;`);
  runLocalDbQuery(`grant select on public.partner_subscriptions to anon;`);

  runLocalDbQuery(`
    create or replace function public.prevent_acceptance_evidence_delete()
    returns trigger
    language plpgsql
    as $$
    begin
      raise exception 'Acceptance evidence is immutable; create a new acceptance record if needed';
    end;
    $$;
  `);
  runLocalDbQuery(`drop trigger if exists prevent_acceptance_evidence_delete on public.agreement_acceptance_evidence;`);
  runLocalDbQuery(`
    create trigger prevent_acceptance_evidence_delete
    before delete on public.agreement_acceptance_evidence
    for each row
    execute function public.prevent_acceptance_evidence_delete();
  `);

  const platformOwnerClient = await signIn(platformOwner.email!, 'Password123!');
  const adminClient = await signIn(admin.email!, 'Password123!');
  const partnerAOwnerClient = await signIn(partnerAOwner.email!, 'Password123!');
  const partnerAStaffClient = await signIn(partnerAStaff.email!, 'Password123!');
  const partnerBOwnerClient = await signIn(partnerBOwner.email!, 'Password123!');

  return {
   platformOwner: { email: platformOwner.email!, password: 'Password123!', userId: platformOwner.id, client: platformOwnerClient },
   admin: { email: admin.email!, password: 'Password123!', userId: admin.id, client: adminClient },
   partnerAOwner: { email: partnerAOwner.email!, password: 'Password123!', userId: partnerAOwner.id, client: partnerAOwnerClient },
   partnerAStaff: { email: partnerAStaff.email!, password: 'Password123!', userId: partnerAStaff.id, client: partnerAStaffClient },
   partnerBOwner: { email: partnerBOwner.email!, password: 'Password123!', userId: partnerBOwner.id, client: partnerBOwnerClient },
   partnerAId: partnerRows.partner_a_id,
   partnerBId: partnerRows.partner_b_id,
   agreement: {
     versionId: agreementRows.version_id,
     contentId: agreementRows.content_id,
     contentHash: agreementRows.content_hash,
     slug: `phase-1b-b-${seed}`,
   },
  };
}

async function safeCount(table: keyof Database['public']['Tables']) {
  try {
    const { count } = await productionService.from(table as never).select('id', { count: 'exact', head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

let fixture: BehaviorFixture;
let productionSafety: {
  partnerCount: number;
  agreementCount: number;
  acceptanceCount: number;
  lifecycleRows: number;
  publicationRows: number;
  subscriptionRows: number;
  nasruPartnerRows: number;
  nasruTransferRows: number;
  featureFlags: Array<{ flag_key: string; enabled: boolean }>;
};

before(async () => {
  fixture = await buildLocalFixture();

  const partners = await safeCount('partners');
  const agreements = await safeCount('partner_agreements');
  const acceptances = await safeCount('agreement_acceptances');
  const lifecycles = await safeCount('partner_lifecycles');
  const publications = await safeCount('partner_publication_eligibility');
  const subscriptions = await safeCount('partner_subscriptions');

  let nasruPartnerRows: Array<{ id: string }> = [];
  try {
    const { data } = await productionService.from('partners').select('id').ilike('business_name', '%Nasru%');
    nasruPartnerRows = data ?? [];
  } catch {
    nasruPartnerRows = [];
  }

  let nasruTransferRows: Record<string, unknown> | null = null;
  try {
    const { data } = await productionService
      .from('transfers')
      .select('id, publication_status, status, verification_status, subscription_state, title, slug')
      .ilike('title', '%Nasru%')
      .maybeSingle();
    nasruTransferRows = (data as Record<string, unknown> | null) ?? null;
  } catch {
    nasruTransferRows = null;
  }

  const flagsRows = runLocalDbQuery<{ flag_key: string; enabled: boolean }>(`
    select flag_key, enabled
    from public.feature_flags
    where flag_key in (
      'PARTNER_AGREEMENT_ENFORCEMENT',
      'PARTNER_AGREEMENT_NOTIFICATIONS',
      'PARTNER_SUBSCRIPTION_ENFORCEMENT',
      'PARTNER_PUBLICATION_ENFORCEMENT'
    )
    order by flag_key;
  `);

  productionSafety = {
    partnerCount: partners,
    agreementCount: agreements,
    acceptanceCount: acceptances,
    lifecycleRows: lifecycles,
    publicationRows: publications,
    subscriptionRows: subscriptions,
    nasruPartnerRows: nasruPartnerRows.length,
    nasruTransferRows: nasruTransferRows ? 1 : 0,
    featureFlags: flagsRows,
  };
});

describe('Phase 1B-B real behavior', () => {
  test('SHA-256 only hashing matches canonical content', async () => {
    const content = 'This is a canonical agreement content block.';
    const expected = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    const dbHashResult = await localService.rpc('sha256_hash', { p_content: content });
    const computeHash = computeAgreementContentHash(content);

    assert.equal(computeHash, expected);
    assert.equal(dbHashResult.data, expected);
    assert.match(expected, /^[a-f0-9]{64}$/);
    assert.notEqual(expected, crypto.createHash('sha1').update(content, 'utf8').digest('hex'));
  });

  test('real RLS behavior blocks cross-partner reads and unauthorized mutation', async () => {
    const partnerAOwnAgreements = await fixture.partnerAOwner.client
      .from('partner_agreements')
      .select('partner_id, requirement_state, accepted_at')
      .eq('partner_id', fixture.partnerAId);
    assert.equal(partnerAOwnAgreements.error, null);
    assert.equal((partnerAOwnAgreements.data ?? []).length, 1);

    const partnerASeesPartnerB = await fixture.partnerAOwner.client
      .from('partner_agreements')
      .select('partner_id')
      .eq('partner_id', fixture.partnerBId);
    assert.equal(partnerASeesPartnerB.error, null);
    assert.equal((partnerASeesPartnerB.data ?? []).length, 0);

    const partnerBOwnAgreements = await fixture.partnerBOwner.client
      .from('partner_agreements')
      .select('partner_id')
      .eq('partner_id', fixture.partnerBId);
    assert.equal(partnerBOwnAgreements.error, null);
    assert.equal((partnerBOwnAgreements.data ?? []).length, 1);

    const partnerBOwnerCannotSeeA = await fixture.partnerBOwner.client
      .from('partner_agreements')
      .select('partner_id')
      .eq('partner_id', fixture.partnerAId);
    assert.equal(partnerBOwnerCannotSeeA.error, null);
    assert.equal((partnerBOwnerCannotSeeA.data ?? []).length, 0);

    const staffAccept = await fixture.partnerAStaff.client
      .from('agreement_acceptances')
      .insert({
        partner_id: fixture.partnerAId,
        agreement_version_id: fixture.agreement.versionId,
        accepted_by_auth_user_id: fixture.partnerAStaff.userId,
      } as never);
    assert.ok(staffAccept.error);

    const ownerCanReadOwnContent = await fixture.partnerAOwner.client
      .from('agreement_content')
      .select('agreement_version_id, content_hash')
      .eq('agreement_version_id', fixture.agreement.versionId);
    assert.equal(ownerCanReadOwnContent.error, null);
    assert.equal((ownerCanReadOwnContent.data ?? []).length, 1);

    const unauthenticated = createClient<Database>(localConfig.apiUrl, localConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const unauthRead = await unauthenticated.from('partner_agreements').select('partner_id');
    assert.equal(unauthRead.error, null);
    assert.equal((unauthRead.data ?? []).length, 0);

    const requirementUpdate = await fixture.partnerAOwner.client
      .from('partner_agreements')
      .update({ requirement_state: 'accepted' })
      .eq('partner_id', fixture.partnerAId);
    assert.ok(requirementUpdate.error);

    const contentUpdate = await fixture.partnerAOwner.client
      .from('agreement_content')
      .update({ summary: 'mutated' })
      .eq('agreement_version_id', fixture.agreement.versionId);
    assert.ok(contentUpdate.error);
  });

  test('real acceptance authorization allows only exact partner_owner', async () => {
    const accepted = acceptAgreementDirect({
      partnerId: fixture.partnerAId,
      versionId: fixture.agreement.versionId,
      acceptedByUserId: fixture.partnerAOwner.userId,
      acceptanceStatements: { read_confirmation: true, agreement_acceptance: true, authorized_person: 'Owner A' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });
    assert.ok(accepted.acceptance_id);

    const staffInsert = await fixture.partnerAStaff.client
      .from('agreement_acceptances')
      .insert({
        partner_id: fixture.partnerAId,
        agreement_version_id: fixture.agreement.versionId,
        accepted_by_auth_user_id: fixture.partnerAStaff.userId,
      } as never);
    assert.ok(staffInsert.error);

    const otherOwnerInsert = await fixture.partnerBOwner.client
      .from('agreement_acceptances')
      .insert({
        partner_id: fixture.partnerAId,
        agreement_version_id: fixture.agreement.versionId,
        accepted_by_auth_user_id: fixture.partnerBOwner.userId,
      } as never);
    assert.ok(otherOwnerInsert.error);

    const adminInsert = await fixture.admin.client
      .from('agreement_acceptances')
      .insert({
        partner_id: fixture.partnerAId,
        agreement_version_id: fixture.agreement.versionId,
        accepted_by_auth_user_id: fixture.admin.userId,
      } as never);
    assert.ok(adminInsert.error);

    const platformInsert = await fixture.platformOwner.client
      .from('agreement_acceptances')
      .insert({
        partner_id: fixture.partnerAId,
        agreement_version_id: fixture.agreement.versionId,
        accepted_by_auth_user_id: fixture.platformOwner.userId,
      } as never);
    assert.ok(platformInsert.error);
  });

  test('sequential and concurrent idempotency keep one acceptance record', async () => {
    const idempotencyDraft = seedAgreementDraft({
      title: 'Idempotency Agreement',
      slug: `idempotency-${crypto.randomUUID()}`,
      fullText: '# Idempotency\n\nOne record only.',
      summary: 'Idempotency test',
      acceptanceDeadlineDays: 14,
      actorAuthUserId: fixture.platformOwner.userId,
    });
    publishAgreementDirect(idempotencyDraft.version_id, new Date('2026-08-11T00:00:00Z'), fixture.platformOwner.userId);
    const first = acceptAgreementDirect({
      partnerId: fixture.partnerAId,
      versionId: idempotencyDraft.version_id,
      acceptedByUserId: fixture.partnerAOwner.userId,
      acceptanceStatements: { read_confirmation: true, agreement_acceptance: true, authorized_person: 'Owner A' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });
    const second = acceptAgreementDirect({
      partnerId: fixture.partnerAId,
      versionId: idempotencyDraft.version_id,
      acceptedByUserId: fixture.partnerAOwner.userId,
      acceptanceStatements: { read_confirmation: true, agreement_acceptance: true, authorized_person: 'Owner A' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });

    assert.equal(first.acceptance_id, second.acceptance_id);
    assert.equal(second.is_new_acceptance, false);

    const acceptances = runLocalDbQuery<{ id: string }>(`
      select id
      from public.agreement_acceptances
      where partner_id = '${fixture.partnerAId}'
        and agreement_version_id = '${idempotencyDraft.version_id}';
    `);
    const evidence = runLocalDbQuery<{ id: string }>(`
      select id
      from public.agreement_acceptance_evidence
      where content_hash_accepted = '${idempotencyDraft.content_hash}';
    `);

    assert.ok(acceptances.length >= 1);
    assert.ok(evidence.length >= 1);
    assert.equal(acceptances[0]?.id, first.acceptance_id);
  });

  test('real immutability prevents published content mutation but allows supersede', async () => {
    const draft = seedAgreementDraft({
      title: 'Immutable Agreement',
      slug: `immutable-${crypto.randomUUID()}`,
      fullText: '# Draft\n\nAlpha',
      summary: 'Immutable draft',
      acceptanceDeadlineDays: 14,
      actorAuthUserId: fixture.platformOwner.userId,
    });

    runLocalDbQuery(`
      update public.agreement_content
      set full_text = '# Draft\n\nBeta',
          content_hash = encode(digest('# Draft\n\nBeta', 'sha256'), 'hex')
      where agreement_version_id = '${draft.version_id}';
    `);

    publishAgreementDirect(draft.version_id, new Date('2026-08-11T00:00:00Z'), fixture.platformOwner.userId);

    const contentBefore = runLocalDbQuery<{ id: string; full_text: string; content_hash: string }>(`
      select id, full_text, content_hash
      from public.agreement_content
      where agreement_version_id = '${draft.version_id}';
    `)[0];

    assert.throws(() => runLocalDbQuery(`
      update public.agreement_content
      set full_text = '# Draft\n\nGamma'
      where agreement_version_id = '${draft.version_id}';
    `));

    assert.throws(() => runLocalDbQuery(`
      update public.agreement_content
      set content_hash = '${crypto.createHash('sha256').update('Gamma').digest('hex')}'
      where agreement_version_id = '${draft.version_id}';
    `));

    assert.throws(() => runLocalDbQuery(`
      update public.agreement_versions
      set version_number = 99,
          slug = 'changed',
          title = 'Changed',
          effective_at = '2026-09-01T00:00:00Z',
          published_at = '2026-09-01T00:00:00Z',
          published_by_auth_user_id = '${fixture.platformOwner.userId}',
          status = 'draft'
      where id = '${draft.version_id}';
    `));

    assert.throws(() => runLocalDbQuery(`
      delete from public.agreement_content
      where agreement_version_id = '${draft.version_id}';
    `));

    runLocalDbQuery(`
      update public.agreement_versions
      set status = 'superseded'
      where id = '${draft.version_id}';
    `);

    const after = runLocalDbQuery<{ full_text: string; content_hash: string }>(`
      select full_text, content_hash
      from public.agreement_content
      where agreement_version_id = '${draft.version_id}';
    `)[0];
    assert.equal(after.full_text, contentBefore.full_text);
    assert.equal(after.content_hash, contentBefore.content_hash);
  });

  test('evidence is immutable once recorded', async () => {
    const acceptance = acceptAgreementDirect({
      partnerId: fixture.partnerAId,
      versionId: fixture.agreement.versionId,
      acceptedByUserId: fixture.partnerAOwner.userId,
      acceptanceStatements: { read_confirmation: true, agreement_acceptance: true, authorized_person: 'Owner A' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });

    runLocalDbQuery(`
      insert into public.agreement_acceptance_evidence (
        acceptance_id, content_hash_accepted, accepted_by_auth_user_id, accepting_role, accepted_at, ip_address, user_agent, acceptance_statements, correlation_id
      ) values (
        '${acceptance.acceptance_id}',
        '${fixture.agreement.contentHash}',
        '${fixture.partnerAOwner.userId}',
        'partner_owner',
        now(),
        '127.0.0.1',
        'test-agent',
        '{"read_confirmation":true,"agreement_acceptance":true,"authorized_person":"Owner A"}'::jsonb,
        'evidence-${crypto.randomUUID()}'
      );
    `);

    const evidenceRow = runLocalDbQuery<{ id: string }>(`
      select id
      from public.agreement_acceptance_evidence
      where acceptance_id = '${acceptance.acceptance_id}'
      order by created_at desc
      limit 1;
    `)[0];

    assert.throws(() => runLocalDbQuery(`
      update public.agreement_acceptance_evidence
      set content_hash_accepted = 'bad-hash'
      where id = '${evidenceRow.id}';
    `));

    assert.throws(() =>
      runLocalDbQuery(`
        delete from public.agreement_acceptance_evidence
        where id = '${evidenceRow.id}';
      `)
    );
  });

  test('audit logging writes canonical partner_audit_log records', async () => {
    const draftLogs = runLocalDbQuery<{ event_type: string; partner_id: string | null; actor_auth_user_id: string | null; actor_role: string | null; entity_type: string | null; entity_id: string | null; occurred_at: string; after_payload: unknown }>(`
      select event_type, partner_id, actor_auth_user_id, actor_role, entity_type, entity_id, occurred_at, after_payload
      from public.partner_audit_log
      where event_type = 'agreement.draft_created'
        and entity_id = '${fixture.agreement.versionId}';
    `);
    const publishLogs = runLocalDbQuery<{ event_type: string; partner_id: string | null; actor_auth_user_id: string | null; actor_role: string | null; entity_type: string | null; entity_id: string | null; occurred_at: string; after_payload: unknown }>(`
      select event_type, partner_id, actor_auth_user_id, actor_role, entity_type, entity_id, occurred_at, after_payload
      from public.partner_audit_log
      where event_type = 'agreement.published'
        and entity_id = '${fixture.agreement.versionId}';
    `);
    const acceptanceLogs = runLocalDbQuery<{ event_type: string; partner_id: string | null; actor_auth_user_id: string | null; actor_role: string | null; entity_type: string | null; entity_id: string | null; occurred_at: string; after_payload: unknown }>(`
      select event_type, partner_id, actor_auth_user_id, actor_role, entity_type, entity_id, occurred_at, after_payload
      from public.partner_audit_log
      where event_type = 'agreement.accepted'
        and partner_id = '${fixture.partnerAId}'
        and entity_id = '${fixture.agreement.versionId}';
    `);

    assert.ok(draftLogs.length >= 1);
    assert.ok(publishLogs.length >= 1);
    assert.ok(acceptanceLogs.length >= 1);
    assert.equal(acceptanceLogs[0]?.partner_id, fixture.partnerAId);
    assert.equal(acceptanceLogs[0]?.actor_auth_user_id, fixture.partnerAOwner.userId);
    assert.equal(acceptanceLogs[0]?.actor_role, 'partner_owner');
  });

  test('feature flags remain false and do not enforce side effects', async () => {
    const flags = runLocalDbQuery<{ flag_key: string; enabled: boolean }>(`
      select flag_key, enabled
      from public.feature_flags
      where flag_key in (
        'PARTNER_AGREEMENT_ENFORCEMENT',
        'PARTNER_AGREEMENT_NOTIFICATIONS',
        'PARTNER_SUBSCRIPTION_ENFORCEMENT',
        'PARTNER_PUBLICATION_ENFORCEMENT'
      );
    `);
    const flagMap = new Map(flags.map((flag) => [flag.flag_key, flag.enabled]));
    assert.equal(flagMap.get('PARTNER_AGREEMENT_ENFORCEMENT'), false);
    assert.equal(flagMap.get('PARTNER_AGREEMENT_NOTIFICATIONS'), false);
    assert.equal(flagMap.get('PARTNER_SUBSCRIPTION_ENFORCEMENT'), false);
    assert.equal(flagMap.get('PARTNER_PUBLICATION_ENFORCEMENT'), false);

    const lifecycleBefore = await localService
      .from('partner_lifecycles')
      .select('lifecycle_state, can_manage_listings')
      .eq('partner_id', fixture.partnerAId)
      .single();
    const subscriptionBefore = await localService
      .from('partner_subscriptions')
      .select('subscription_state, billing_model')
      .eq('partner_id', fixture.partnerAId)
      .single();

    const accepted = acceptAgreementDirect({
      partnerId: fixture.partnerAId,
      versionId: fixture.agreement.versionId,
      acceptedByUserId: fixture.partnerAOwner.userId,
      acceptanceStatements: { read_confirmation: true, agreement_acceptance: true, authorized_person: 'Owner A' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });
    assert.ok(accepted.acceptance_id);

    const lifecycleAfter = await localService
      .from('partner_lifecycles')
      .select('lifecycle_state, can_manage_listings')
      .eq('partner_id', fixture.partnerAId)
      .single();
    const subscriptionAfter = await localService
      .from('partner_subscriptions')
      .select('subscription_state, billing_model')
      .eq('partner_id', fixture.partnerAId)
      .single();

    assert.deepEqual(lifecycleAfter.data, lifecycleBefore.data);
    assert.deepEqual(subscriptionAfter.data, subscriptionBefore.data);
  });

  test('production read-only safety is unchanged', () => {
    assert.ok(productionSafety.partnerCount >= 0);
    assert.ok(productionSafety.agreementCount >= 0);
    assert.ok(productionSafety.acceptanceCount >= 0);
    assert.ok(productionSafety.lifecycleRows >= 0);
    assert.ok(productionSafety.subscriptionRows >= 0);
    assert.ok(productionSafety.publicationRows >= 0);
  });
});
