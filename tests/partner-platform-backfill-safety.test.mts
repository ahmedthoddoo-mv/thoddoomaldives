import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  isValidDateRange,
  isValidDiscountPercentage,
  resolveLegacyPartnerBackfillState,
  resolveMembershipPlanId,
  resolveBackfillReferenceTimestamp,
} from '../lib/partner-platform/backfill.ts';

test('unknown legacy status stays conservative and records an audit reason', () => {
  const state = resolveLegacyPartnerBackfillState('mystery-status');

  assert.equal(state.lifecycleState, 'verification_pending');
  assert.equal(state.verificationState, 'pending');
  assert.equal(state.subscriptionState, 'draft');
  assert.equal(state.editingAllowed, false);
  assert.equal(state.requiresAction, true);
  assert.equal(state.canLogin, false);
  assert.equal(state.canViewDashboard, false);
  assert.equal(state.canManageListings, false);
  assert.equal(state.publicationBlockedReason, 'legacy-status-unmapped');
  assert.equal(state.auditReason, 'legacy-status-unmapped-during-backfill');
});

test('suspended legacy status keeps operational flags aligned and does not activate the partner', () => {
  const state = resolveLegacyPartnerBackfillState('suspended');

  assert.equal(state.lifecycleState, 'suspended');
  assert.equal(state.verificationState, 'suspended');
  assert.equal(state.subscriptionState, 'suspended');
  assert.equal(state.editingAllowed, false);
  assert.equal(state.canManageListings, false);
  assert.equal(state.requiresAction, true);
  assert.equal(state.canLogin, true);
  assert.equal(state.canViewDashboard, true);
  assert.equal(state.publicationBlockedReason, 'suspended-legacy');
});

test('invalid membership plan ids fall back to null without aborting the backfill', () => {
  const validPlanIds = new Set(['11111111-1111-1111-1111-111111111111']);

  assert.equal(resolveMembershipPlanId('00000000-0000-0000-0000-000000000000', validPlanIds), null);
  assert.equal(resolveMembershipPlanId(null, validPlanIds), null);
  assert.equal(resolveMembershipPlanId('11111111-1111-1111-1111-111111111111', validPlanIds), '11111111-1111-1111-1111-111111111111');
});

test('discount and date constraints reject invalid values', () => {
  assert.equal(isValidDiscountPercentage(-1), false);
  assert.equal(isValidDiscountPercentage(101), false);
  assert.equal(isValidDiscountPercentage(0), true);
  assert.equal(isValidDiscountPercentage(100), true);
  assert.equal(isValidDateRange(new Date('2025-01-01T00:00:00Z'), new Date('2025-01-02T00:00:00Z')), true);
  assert.equal(isValidDateRange(new Date('2025-01-02T00:00:00Z'), new Date('2025-01-01T00:00:00Z')), false);
});

test('the migration does not auto-run the backfill and keeps idempotent insert guards', async () => {
  const migrationPath = path.resolve(import.meta.dirname, '../supabase/migrations/20260811120000_partner_operations_phase1a.sql');
  const migrationSql = await readFile(migrationPath, 'utf8');

  assert.equal(migrationSql.includes('select public.backfill_partner_operations_phase1a();'), false);
  assert.equal(migrationSql.includes('on conflict (partner_id) do nothing;'), true);
  assert.equal(migrationSql.includes("if not exists (select 1 from public.partner_subscriptions ps where ps.partner_id = partner_row.id) then"), true);
});

test('backfill reference timestamps are stable and deterministic within a single backfill run', () => {
  assert.equal(resolveBackfillReferenceTimestamp('2025-01-10T00:00:00Z', '2025-01-01T00:00:00Z', '2025-01-05T00:00:00Z'), '2025-01-10T00:00:00Z');
  assert.equal(resolveBackfillReferenceTimestamp(null, '2025-01-01T00:00:00Z', '2025-01-05T00:00:00Z'), '2025-01-01T00:00:00Z');
  assert.equal(resolveBackfillReferenceTimestamp(null, null, '2025-01-05T00:00:00Z'), '2025-01-05T00:00:00Z');
});
