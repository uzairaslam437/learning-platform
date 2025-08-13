// src/components/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { AppPage } from '../types/Auth';
import { paymentAPI } from '../services/payment';

interface PaymentSuccessProps {
  onNavigate: (page: AppPage, params?: any) => void;
  params?: { sessionId: string; courseId: string };
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onNavigate, params }) => {
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (params?.sessionId) {
      verifyPayment();
    }
  }, [params?.sessionId]);

  const verifyPayment = async () => {
    try {
      const result = await paymentAPI.getPaymentStatus(params!.sessionId);
      setPaymentVerified(result.status === 'completed');
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentVerified(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {paymentVerified ? 'Payment Successful!' : 'Processing Payment...'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {paymentVerified 
              ? 'Congratulations! You now have access to the course.'
              : 'Please wait while we verify your payment.'
            }
          </p>
        </div>

        {paymentVerified && (
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('course-detail', { courseId: params?.courseId })}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Access Course
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
