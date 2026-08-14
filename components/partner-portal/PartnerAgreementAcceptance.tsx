'use client';

import { useState } from 'react';

interface PartnerAgreementAcceptanceProps {
  partnerId: string;
  agreementVersionId: string;
  agreementTitle: string;
  agreementContent: string;
  onAcceptanceComplete?: () => void;
}

export function PartnerAgreementAcceptance({
  partnerId,
  agreementVersionId,
  agreementTitle,
  agreementContent,
  onAcceptanceComplete,
}: PartnerAgreementAcceptanceProps) {
  const [step, setStep] = useState<'review' | 'confirm' | 'accepted' | 'error'>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [acceptanceId, setAcceptanceId] = useState<string | null>(null);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);

  const handleReviewComplete = () => {
    setStep('confirm');
  };

  const handleAccept = async () => {
    if (!readConfirmed || !agreementConfirmed) {
      setError('You must confirm that you have read and agree to the agreement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partner/agreements/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner_id: partnerId,
          agreement_version_id: agreementVersionId,
          acceptance_statements: {
            read_confirmation: readConfirmed,
            agreement_acceptance: agreementConfirmed,
            authorized_person: authorizedPerson || undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept agreement');
      }

      const result = await response.json();
      setAcceptanceId(result.acceptance_id);
      setAcceptedAt(result.accepted_at);
      setStep('accepted');
      onAcceptanceComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'accepted') {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Accepted</h2>
          <p className="text-gray-600 mb-4">
            You have successfully accepted the {agreementTitle}.
          </p>

          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Reference Number:</strong>
            </p>
            <p className="font-mono text-gray-900 break-all">{acceptanceId}</p>
            {acceptedAt && (
              <>
                <p className="text-sm text-gray-600 mt-4 mb-2">
                  <strong>Accepted:</strong>
                </p>
                <p className="text-gray-900">{new Date(acceptedAt).toLocaleString()}</p>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600">
            You can view your acceptance history and download receipts from your partner dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-semibold mb-2">Acceptance Failed</h3>
          <p>{error}</p>
        </div>
        <button
          onClick={() => {
            setStep('review');
            setError(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Acceptance</h2>

        <div className="space-y-4 mb-8">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={readConfirmed}
              onChange={(e) => setReadConfirmed(e.target.checked)}
              className="mt-1 mr-3 rounded"
            />
            <span className="text-gray-700">
              I confirm that I have read and understand the agreement above.
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreementConfirmed}
              onChange={(e) => setAgreementConfirmed(e.target.checked)}
              className="mt-1 mr-3 rounded"
            />
            <span className="text-gray-700">
              I have the authority to accept this agreement on behalf of this business and agree to all terms
              and conditions.
            </span>
          </label>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authorized Person Name (optional)
          </label>
          <input
            type="text"
            value={authorizedPerson}
            onChange={(e) => setAuthorizedPerson(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            For legal record purposes. We keep this information confidential.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setStep('review')}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Back to Agreement
          </button>
          <button
            onClick={handleAccept}
            disabled={loading || !readConfirmed || !agreementConfirmed}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accepting...' : 'Accept Agreement'}
          </button>
        </div>
      </div>
    );
  }

  // step === 'review'
  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{agreementTitle}</h2>
        <p className="text-gray-600">
          Please read the agreement below carefully before accepting.
        </p>
      </div>

      <div className="prose prose-sm max-w-none mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
        {/* Render agreement content as markdown-like text */}
        <div className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">{agreementContent}</div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleReviewComplete}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          I Have Read the Agreement
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By proceeding, you confirm you are authorized to accept this agreement on behalf of your business.
      </p>
    </div>
  );
}
