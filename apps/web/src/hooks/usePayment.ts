// hooks/usePayment.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentService } from '../services/payment.service';
import { PaymentInvoice, PaymentStatus } from '../types/payment';

interface UsePaymentPollingOptions {
  orderId: string | null;
  enabled?: boolean;
  intervalMs?: number;
  onSuccess?: (payment: PaymentInvoice) => void;
  onFailed?: (payment: PaymentInvoice) => void;
  onExpired?: (payment: PaymentInvoice) => void;
}

export function usePaymentPolling({
  orderId,
  enabled = true,
  intervalMs = 3500,
  onSuccess,
  onFailed,
  onExpired,
}: UsePaymentPollingOptions) {
  const [payment, setPayment] = useState<PaymentInvoice | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const callbacksRef = useRef({ onSuccess, onFailed, onExpired });
  callbacksRef.current = { onSuccess, onFailed, onExpired };

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const data = await paymentService.getPaymentStatus(orderId);
      if (!isMountedRef.current) return;

      setPayment(data);
      const curStatus = (data.status || 'PENDING').toUpperCase() as PaymentStatus;
      setStatus(curStatus);
      setError(null);

      if (curStatus === 'PAID') {
        callbacksRef.current.onSuccess?.(data);
      } else if (curStatus === 'FAILED' || curStatus === 'CANCELLED') {
        callbacksRef.current.onFailed?.(data);
      } else if (curStatus === 'EXPIRED') {
        callbacksRef.current.onExpired?.(data);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.response?.data?.message || err?.message || 'Gagal memeriksa status pembayaran');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!orderId || !enabled) return;

    // Initial check
    checkStatus();

    // Polling timer
    const interval = setInterval(() => {
      // Stop polling on terminal states
      if (status === 'PAID' || status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELLED') {
        clearInterval(interval);
        return;
      }
      checkStatus();
    }, intervalMs);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [orderId, enabled, intervalMs, status, checkStatus]);

  return {
    payment,
    status,
    isLoading,
    error,
    refetch: checkStatus,
  };
}
