declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    currency?: string;
    key: string;
    amount: number;
    name?: string;
    order_id?: string;
    customer_notify?: number;
    timeout?: number;
    expire_by?: number;
    receipt?: string;
    prefill?: {
      contact?: string;
      name?: string;
      email?: string;
    };
    notes?: Record<string, string>;
    notifyUrl?: string;
    theme?: {
      color?: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}
