import React from 'react';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import type { AppPage } from '../types/Auth';

interface PaymentCancelProps {
  onNavigate: (page: AppPage, params?: any) => void;
  params?: { courseId: string };
}

export const PaymentCancel: React.FC<PaymentCancelProps> = ({ onNavigate, params }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Cancelled
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your payment was cancelled. Don't worry, you can try again anytime.
          </p>
        </div>

        <div className="space-y-4">
          {params?.courseId && (
            <button
              onClick={() => onNavigate('course-detail', { courseId: params.courseId })}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};