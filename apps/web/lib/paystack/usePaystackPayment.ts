'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export interface PaystackSuccessResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface UsePaystackPaymentOptions {
  email: string;
  amount: number;
  publicKey?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (response: PaystackSuccessResponse) => void;
  onClose?: () => void;
}

export function usePaystackPayment() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  const initializePayment = useCallback(
    (options: UsePaystackPaymentOptions) => {
      const key =
        options.publicKey ||
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        '';

      if (!key) {
        console.error('Paystack public key is not configured');
        return;
      }

      if (!window.PaystackPop) {
        console.error('Paystack script not loaded');
        return;
      }

      setIsLoading(true);

      const ref = `HARVITE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const handler = window.PaystackPop.setup({
        key,
        email: options.email,
        amount: options.amount,
        ref,
        metadata: options.metadata || {},
        label: 'Harvite Wallet Top-up',
        callback: (response: PaystackSuccessResponse) => {
          setIsLoading(false);
          options.onSuccess(response);
        },
        onClose: () => {
          setIsLoading(false);
          options.onClose?.();
        },
      });

      handler.openIframe();
    },
    [],
  );

  return { initializePayment, scriptLoaded, isLoading };
}
