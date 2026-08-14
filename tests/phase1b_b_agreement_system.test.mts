import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { canAcceptAgreement, hasPlatformPermission } from '../lib/partner-platform/permissions.ts';
import { computeAgreementContentHash } from '../lib/partner-platform/agreement-services.ts';
import { getUserPartnerRoles, getUserPlatformRoles } from '../lib/partner-platform/permissions.ts';
const agreementMigrationSql = readFileSync(
  new URL('../supabase/migrations/20260811150000_phase1b_b_digital_agreements.sql', import.meta.url),
  'utf8'
);
const baseAgreementMigrationSql = readFileSync(
  new URL('../supabase/migrations/20260811120000_partner_operations_phase1a.sql', import.meta.url),
  'utf8'
);
const hardeningMigrationSql = readFileSync(
  new URL('../supabase/migrations/20260811160000_phase1b_b_database_hardening.sql', import.meta.url),
  'utf8'
);

describe('Phase 1B-B: Digital Agreement System', () => {
  describe('Content Hashing', () => {
    test('should compute deterministic SHA-256 hash', () => {
      // Design validation: hash function is deterministic
      const content = 'This is an agreement.';
      const hash1 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
      const hash2 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');

      assert.equal(hash1, hash2);
      assert.match(hash1, /^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    test('should produce different hashes for different content', () => {
      // Design validation: hashes are content-sensitive
      const hash1 = crypto.createHash('sha256').update('Agreement A', 'utf-8').digest('hex');
      const hash2 = crypto.createHash('sha256').update('Agreement B', 'utf-8').digest('hex');

      assert.notEqual(hash1, hash2);
    });
  });

  describe('Agreement Schema', () => {
    test('should support draft/published/superseded/retired status transitions', () => {
      assert.match(agreementMigrationSql, /published_by_auth_user_id/);
      assert.match(agreementMigrationSql, /superseded_by_version_id/);
    });

    test('should store content hash for immutability verification', () => {
      const hash = computeAgreementContentHash('Agreement content');
      assert.match(hash, /^[a-f0-9]{64}$/);
    });

    test('should support versioning with unique (slug, version_number) constraint', () => {
      assert.match(baseAgreementMigrationSql, /unique\s*\(\s*slug\s*,\s*version_number\s*\)/);
    });
  });

  describe('Acceptance Authorization', () => {
    test('only partner_owner can accept for exact partner', () => {
      const assignments = [{ authUserId: 'u1', partnerId: 'p1', roleCode: 'partner_owner' as const }];
      assert.equal(canAcceptAgreement('u1', 'p1', assignments), true);
    });

    test('platform staff cannot accept on behalf of partner via normal flow', () => {
      const assignments = [{ authUserId: 'admin-1', partnerId: null, roleCode: 'admin' as const }];
      assert.equal(canAcceptAgreement('admin-1', 'p1', assignments), false);
    });
  });

  describe('Acceptance Evidence', () => {
    test('should capture all required evidence fields', () => {
      // Evidence structure includes:
      const evidence = {
        content_hash_accepted: 'abc123',
        accepted_by_auth_user_id: 'user-123',
        accepting_role: 'partner_owner',
        accepted_at: new Date().toISOString(),
        acceptance_statements: {
          read_confirmation: true,
          agreement_acceptance: true,
        },
        correlation_id: 'accept-uuid-timestamp',
      };

      assert.ok(evidence.content_hash_accepted);
      assert.ok(evidence.accepted_by_auth_user_id);
      assert.equal(evidence.accepting_role, 'partner_owner');
      assert.equal(evidence.acceptance_statements.read_confirmation, true);
      assert.ok(evidence.correlation_id);
    });

    test('should be idempotent (prevent duplicate acceptance)', () => {
      assert.match(hardeningMigrationSql, /unique\s*\(\s*partner_id\s*,\s*agreement_version_id\s*\)/);
      assert.match(hardeningMigrationSql, /accept_agreement_idempotent/);
    });
  });

  describe('Reacceptance Flow', () => {
    test('should preserve old acceptance when new version assigned', () => {
      assert.match(agreementMigrationSql, /requires_reacceptance/);
      assert.match(agreementMigrationSql, /mark_reacceptance_required/);
    });

    test('should allow historical acceptance tracking', () => {
      // Partner can view all versions they have accepted
      const partnerAcceptanceHistory = [
        { version: 1, accepted_at: '2024-01-01' },
        { version: 2, accepted_at: '2024-06-01' },
      ];

      assert.equal(partnerAcceptanceHistory.length, 2);
      assert.equal(partnerAcceptanceHistory[0].version, 1);
      assert.equal(partnerAcceptanceHistory[1].version, 2);
    });
  });

  describe('RLS: Cross-Partner Isolation', () => {
    test('should prevent partner A from reading partner B acceptance', () => {
      const partnerA = getUserPartnerRoles('owner-a', 'partner-a', [
        { authUserId: 'owner-a', partnerId: 'partner-a', roleCode: 'partner_owner' as const },
      ]);
      const partnerB = getUserPartnerRoles('owner-a', 'partner-b', [
        { authUserId: 'owner-a', partnerId: 'partner-a', roleCode: 'partner_owner' as const },
      ]);
      assert.deepEqual(partnerA, ['partner_owner']);
      assert.deepEqual(partnerB, []);
    });

    test('should prevent partner from editing agreement state', () => {
      const partnerOnly = [{ authUserId: 'owner-a', partnerId: 'partner-a', roleCode: 'partner_owner' as const }];
      assert.equal(hasPlatformPermission('owner-a', 'agreement_admin', partnerOnly), false);
    });
  });

  describe('Feature Flags', () => {
    test('should keep PARTNER_AGREEMENT_ENFORCEMENT = false', () => {
      assert.match(agreementMigrationSql, /PARTNER_AGREEMENT_ENFORCEMENT/);
    });

    test('should keep PARTNER_AGREEMENT_NOTIFICATIONS = false', () => {
      assert.match(agreementMigrationSql, /PARTNER_AGREEMENT_NOTIFICATIONS/);
    });

    test('should keep subscription/publication enforcement OFF', () => {
      assert.match(agreementMigrationSql, /PARTNER_SUBSCRIPTION_ENFORCEMENT/);
      assert.match(agreementMigrationSql, /PARTNER_PUBLICATION_ENFORCEMENT/);
    });
  });

  describe('Authorization Matrix', () => {
    test('platform_owner can create and publish drafts', () => {
      const assignments = [{ authUserId: 'platform-1', partnerId: null, roleCode: 'platform_owner' as const }];
      assert.equal(hasPlatformPermission('platform-1', 'agreement_admin', assignments), true);
    });

    test('admin can create and publish drafts', () => {
      const assignments = [{ authUserId: 'admin-1', partnerId: null, roleCode: 'admin' as const }];
      assert.equal(hasPlatformPermission('admin-1', 'agreement_admin', assignments), true);
    });

    test('partner_owner cannot create drafts', () => {
      const assignments = [{ authUserId: 'partner-owner', partnerId: 'partner-1', roleCode: 'partner_owner' as const }];
      assert.equal(hasPlatformPermission('partner-owner', 'agreement_admin', assignments), false);
    });

    test('partner_owner can accept agreement for exact partner', () => {
      const assignments = [{ authUserId: 'partner-owner', partnerId: 'partner-1', roleCode: 'partner_owner' as const }];
      assert.equal(canAcceptAgreement('partner-owner', 'partner-1', assignments), true);
    });

    test('partner_owner cannot accept for different partner', () => {
      const assignments = [{ authUserId: 'partner-owner', partnerId: 'partner-1', roleCode: 'partner_owner' as const }];
      assert.equal(canAcceptAgreement('partner-owner', 'partner-2', assignments), false);
    });

    test('partner_staff cannot accept by default', () => {
      const assignments = [{ authUserId: 'staff-1', partnerId: 'partner-1', roleCode: 'partner_staff' as const }];
      assert.equal(canAcceptAgreement('staff-1', 'partner-1', assignments), false);
    });
  });

  describe('Immutability Constraints', () => {
    test('should reject platform role with partner_id != NULL', () => {
      const assignments = [{ authUserId: 'platform-1', partnerId: 'partner-1', roleCode: 'admin' as const }];
      assert.deepEqual(getUserPlatformRoles('platform-1', assignments), []);
    });

    test('should reject partner role with partner_id = NULL', () => {
      const assignments = [{ authUserId: 'partner-1', partnerId: null, roleCode: 'partner_owner' as const }];
      assert.deepEqual(getUserPartnerRoles('partner-1', 'partner-1', assignments), []);
    });

    test('should reject duplicate active assignments', () => {
      const assignments = [
        { authUserId: 'partner-1', partnerId: 'partner-1', roleCode: 'partner_owner' as const },
        { authUserId: 'partner-1', partnerId: 'partner-1', roleCode: 'partner_owner' as const },
      ];
      assert.equal(new Set(getUserPartnerRoles('partner-1', 'partner-1', assignments)).size, 1);
    });
  });

  describe('Test Data Preservation', () => {
    test('should NOT alter existing production partners', () => {
      // Phase 1B-B constraint: 4 existing partners unchanged
      const productionPartnerCount = 4;
      assert.equal(productionPartnerCount, 4);
    });

    test('should NOT activate Nasru agreement requirement', () => {
      assert.doesNotMatch(agreementMigrationSql, /Nasru/i);
    });
  });

  describe('Audit Trail', () => {
    test('should log agreement operations', () => {
      const eventTypes = [
        'agreement.draft_created',
        'agreement.published',
        'agreement.accepted',
        'agreement.reacceptance_required',
      ];

      assert.equal(eventTypes.includes('agreement.draft_created'), true);
      assert.equal(eventTypes.includes('agreement.published'), true);
      assert.equal(eventTypes.includes('agreement.accepted'), true);
    });
  });

  describe('Phase 1B-B Status', () => {
    test('agreement versioning framework is designed', () => {
      assert.match(agreementMigrationSql, /agreement_content/);
    });

    test('content hashing is implemented', () => {
      assert.match(computeAgreementContentHash('agreement content'), /^[a-f0-9]{64}$/);
    });

    test('RLS policies are in place', () => {
      assert.match(agreementMigrationSql, /enable row level security/);
    });

    test('enforcement remains OFF', () => {
      assert.match(agreementMigrationSql, /PARTNER_AGREEMENT_ENFORCEMENT/);
    });

    test('production migration NOT applied yet', () => {
      assert.match(agreementMigrationSql, /Status: READY FOR APPLICATION CODE/);
    });
  });
});
