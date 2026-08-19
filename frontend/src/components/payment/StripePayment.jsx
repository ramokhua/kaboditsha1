import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ applicationId, amount = 50, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/payments/create-payment-intent', {
        applicationId,
        amount
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await api.post('/payments/confirm-payment', {
          applicationId,
          paymentIntentId: paymentIntent.id
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#2C1810] text-white px-6 py-3 rounded-lg hover:bg-[#3A241C] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay P${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ applicationId, amount = 50, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm applicationId={applicationId} amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePayment;