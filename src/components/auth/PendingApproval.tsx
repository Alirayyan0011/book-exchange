'use client';

import React from 'react';
import { Clock, AlertCircle, Mail } from 'lucide-react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="mb-6">
          <div className="bg-amber-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-slate-600">
            Your signup request is still pending admin approval.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                What happens next?
              </h3>
              <p className="text-sm text-amber-700">
                An administrator will review your account and approve access to the book exchange platform.
                You'll be able to log in once your account is approved.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
            <Mail className="h-4 w-4" />
            <span>You'll receive an email notification once approved</span>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-4">
              If you have any questions, please contact our support team.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-slate-800 text-white py-2 px-4 rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}