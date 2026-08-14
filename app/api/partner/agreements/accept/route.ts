import { createSupabaseServerClient } from '@/lib/supabase/server';
import { acceptAgreement } from '@/lib/partner-platform/agreement-services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    }

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { partner_id, agreement_version_id, acceptance_statements } = body;

    if (!partner_id || !agreement_version_id) {
      return NextResponse.json(
        { message: 'partner_id and agreement_version_id required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Call service function (handles all authorization)
    const result = await acceptAgreement(partner_id, agreement_version_id, acceptance_statements, clientIp || undefined, userAgent || undefined);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept agreement';
    console.error('Agreement acceptance error:', error);
    return NextResponse.json({ message }, { status: 400 });
  }
}
