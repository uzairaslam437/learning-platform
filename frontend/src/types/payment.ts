// types/payment.ts

export interface PaymentSession {
  success: boolean;
  sessionId: string;
  checkoutUrl: string;
  sessionDetails: {
    courseId: string;
    courseName: string;
    amount: number;
    currency: string;
    expiresAt: string;
  };
}

export interface PaymentStatus {
  success: boolean;
  payment: {
    id: string;
    courseId: string;
    courseTitle: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
  };
  stripeSession: {
    id: string;
    paymentStatus: string;
    customerEmail: string;
  };
}

export interface VerifyAccessResponse {
  success: boolean;
  hasAccess: boolean;
  accessType: string;
  enrollmentDetails: {
    status: string;
    enrollmentDate: string;
    paymentStatus: string;
    paymentDate?: string;
  };
}

export interface CreateCheckoutPayload {
  courseId: string;
  successUrl?: string;
  cancelUrl?: string;
}
