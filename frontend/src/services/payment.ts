import type {
  CreateCheckoutPayload,
  PaymentSession,
  PaymentStatus,
  VerifyAccessResponse
} from '../types/payment';
import { getAuthHeaders, handleResponse } from './api';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000';

export const paymentAPI = {
  // Create Stripe checkout session
  createCheckoutSession: async (payload: CreateCheckoutPayload): Promise<PaymentSession> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response); // Now returns { success, sessionId, checkoutUrl, sessionDetails }
  },

  // Get payment status
  getPaymentStatus: async (sessionId: string): Promise<PaymentStatus> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/payment-status/${sessionId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Verify course access
  verifyCourseAccess: async (courseId: string): Promise<VerifyAccessResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/verify-access/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
