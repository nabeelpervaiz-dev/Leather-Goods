import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, Copy, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { pakistanCities } from '../data/storeSettings.js';
import { formatPrice } from '../utils/formatPrice.js';
import { getFriendlyFirebaseError } from '../services/errorHandler.js';
import {
  buildWhatsAppOrderUrl,
  generateOrderMessage,
} from '../utils/generateOrderMessage.js';
import SafeImage from '../components/common/SafeImage.jsx';
import Button from '../components/common/Button.jsx';

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { storeSettings, placeOrder, refreshStoreData } = useStore();
  const { showToast } = useToast();

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState('Not opened');
  const [copiedMessage, setCopiedMessage] = useState(false);

  const idempotencyKey = useMemo(() => {
    const fingerprint = items
      .map((i) => `${i.productId}:${i.size || ''}:${i.color || ''}:${i.quantity}`)
      .join('|');
    return `clg-${Date.now()}-${Math.abs(
      fingerprint.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
    )}`;
  }, [items]);

  const currency = storeSettings.currency || 'PKR';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      whatsapp: '',
      city: 'Lahore',
      area: '',
      address: '',
      notes: '',
    },
  });

  const phoneValue = watch('phone');

  const onSubmit = async (data) => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const customerPayload = {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        whatsapp: sameAsPhone ? data.phone.trim() : data.whatsapp.trim(),
        city: data.city.trim(),
        area: data.area.trim(),
        address: data.address.trim(),
        notes: data.notes.trim(),
      };

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const createdOrder = await placeOrder({
        customer: customerPayload,
        items: orderItems,
        idempotencyKey,
      });

      clearCart();
      setSubmittedOrder(createdOrder);
      refreshStoreData();

      const whatsappUrl = buildWhatsAppOrderUrl(
        storeSettings.whatsappNumber,
        createdOrder,
        currency
      );

      // Trigger Click-to-Chat link safely via temporary anchor without window.open/alert
      try {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setWhatsappStatus('Opened');
      } catch {
        setWhatsappStatus('Open manually below');
      }

      showToast('Order recorded as Pending. Please send the message in WhatsApp.');
    } catch (error) {
      const message = getFriendlyFirebaseError(
        error,
        'Could not submit your order. Please try again.'
      );
      setSubmitError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedOrder) {
    const orderDisplayId = submittedOrder.orderNumber || submittedOrder.id;
    const whatsappUrl = buildWhatsAppOrderUrl(
      storeSettings.whatsappNumber,
      submittedOrder,
      currency
    );
    const formattedMessage = generateOrderMessage(submittedOrder, currency);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(formattedMessage);
        setCopiedMessage(true);
        showToast('Order message copied to clipboard.');
        setTimeout(() => setCopiedMessage(false), 2500);
      } catch {
        showToast('Unable to copy automatically. Please copy the text manually.', 'error');
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="border border-[#E6E2DC] bg-white p-6 md:p-10 space-y-6">
          <div className="border-b border-[#E6E2DC] pb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#8C5A36] mb-2">
              Order Recorded · Status: {submittedOrder.status || 'Pending'} · WhatsApp: {whatsappStatus}
            </p>
            <h1 className="text-[28px] md:text-[36px] font-bold text-[#17130F] mb-2">
              Send your order on WhatsApp
            </h1>
            <p className="text-base text-[#625D57] leading-relaxed">
              Order <strong className="text-[#17130F] tabular-nums">{orderDisplayId}</strong> has been securely saved with status <strong>Pending</strong>. WhatsApp opens with your prefilled order summary—please press <strong>Send</strong> in WhatsApp so our team can verify and confirm your Cash on Delivery dispatch. Opening WhatsApp alone does not confirm an order.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWhatsappStatus('Opened')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#241811] text-white text-base font-medium hover:bg-[#3A281E] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open WhatsApp & Send Order</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#17130F] bg-white text-[#17130F] text-base font-medium hover:bg-[#F3F1ED] transition-colors cursor-pointer"
            >
              {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Copied' : 'Copy Order Message'}</span>
            </button>
          </div>

          <div className="bg-[#F3F1ED] border border-[#E6E2DC] p-5">
            <p className="text-sm font-semibold text-[#17130F] mb-2">
              Prefilled WhatsApp Message Preview
            </p>
            <pre className="text-sm text-[#17130F] whitespace-pre-wrap font-sans leading-relaxed">
              {formattedMessage}
            </pre>
          </div>

          <div className="pt-2">
            <Link
              to="/shop"
              className="text-base font-medium text-[#17130F] underline hover:text-[#8C5A36]"
            >
              Continue browsing Creating Leather Goods
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#17130F] mb-3">
          Your bag is empty
        </h1>
        <p className="text-base text-[#625D57] mb-6">
          Add leather goods to your bag before proceeding to Cash on Delivery checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block px-7 py-3 bg-[#241811] text-white text-base font-medium"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="border-b border-[#E6E2DC] pb-5 mb-8">
        <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-[#17130F]">
          Cash on Delivery Checkout
        </h1>
        <p className="text-base text-[#625D57] mt-1">
          Enter your delivery details in Pakistan. You will review and send the final order via WhatsApp.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        {/* Left: Customer Delivery Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#E6E2DC] bg-white p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-[#17130F] border-b border-[#E6E2DC] pb-3">
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Hamza Tariq"
                  {...register('fullName', {
                    required: 'Full name is required.',
                    minLength: { value: 3, message: 'Enter at least 3 characters.' },
                  })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                />
                {errors.fullName && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0300 1234567"
                  {...register('phone', {
                    required: 'Phone number is required.',
                    minLength: { value: 10, message: 'Enter a valid Pakistani phone number.' },
                    onChange: (e) => {
                      if (sameAsPhone) {
                        setValue('whatsapp', e.target.value);
                      }
                    },
                  })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                />
                {errors.phone && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="whatsapp" className="text-sm font-medium text-[#17130F]">
                    WhatsApp Number *
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-sm text-[#625D57] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPhone(checked);
                        if (checked) {
                          setValue('whatsapp', phoneValue);
                        }
                      }}
                      className="accent-[#241811]"
                    />
                    <span>Same</span>
                  </label>
                </div>
                <input
                  id="whatsapp"
                  type="tel"
                  disabled={sameAsPhone}
                  placeholder="0300 1234567"
                  {...register('whatsapp', {
                    validate: (val) => {
                      const target = sameAsPhone ? phoneValue : val;
                      if (!target || target.trim().length < 10) {
                        return 'Enter a valid WhatsApp number.';
                      }
                      return true;
                    },
                  })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] disabled:opacity-60 focus:outline-none focus:border-[#17130F]"
                />
                {errors.whatsapp && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  City *
                </label>
                <select
                  id="city"
                  {...register('city', { required: 'City is required.' })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                >
                  {pakistanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="Other">Other City in Pakistan</option>
                </select>
                {errors.city && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  Area / Sector *
                </label>
                <input
                  id="area"
                  type="text"
                  placeholder="e.g. Gulberg III / DHA Phase 6"
                  {...register('area', { required: 'Area or sector is required.' })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                />
                {errors.area && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.area.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  Complete Delivery Address *
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="House / Apartment number, street, landmark..."
                  {...register('address', {
                    required: 'Complete street address is required.',
                    minLength: { value: 10, message: 'Please enter a full delivery address.' },
                  })}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                />
                {errors.address && (
                  <p className="text-sm text-[#B42318] mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-[#17130F] mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Preferred delivery window, sizing note, etc."
                  {...register('notes')}
                  className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-[#E6E2DC] bg-[#F3F1ED] p-6">
            <h2 className="text-lg font-semibold text-[#17130F] mb-2">
              Payment Method
            </h2>
            <div className="flex items-start gap-3 bg-white border border-[#17130F] p-4">
              <input
                type="radio"
                checked
                readOnly
                id="cod-method"
                className="mt-1 accent-[#241811]"
              />
              <label htmlFor="cod-method" className="text-base text-[#17130F]">
                <span className="font-semibold block">Cash on Delivery (COD)</span>
                <span className="text-sm text-[#625D57]">
                  Pay in {currency} cash upon parcel delivery anywhere in Pakistan.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5 bg-[#F3F1ED] border border-[#E6E2DC] p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-[#17130F] border-b border-[#E6E2DC] pb-3">
            Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3 items-start">
                <div className="w-16 h-16 bg-white border border-[#E6E2DC] shrink-0 overflow-hidden">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fallbackTitle={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#17130F] line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-sm text-[#625D57]">
                    {[
                      item.color,
                      item.size ? `Size ${item.size}` : null,
                      `Qty ${item.quantity}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#17130F] tabular-nums shrink-0">
                  {formatPrice(item.unitPrice * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E6E2DC] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#625D57]">
              <span>Subtotal</span>
              <span className="tabular-nums text-[#17130F]">
                {formatPrice(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-[#625D57]">
              <span>Delivery Fee</span>
              <span className="tabular-nums text-[#17130F]">
                {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee, currency)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E6E2DC] text-lg font-semibold text-[#17130F]">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total, currency)}</span>
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="border border-[#B42318] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B42318]"
            >
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5"
          >
            {submitting ? 'Submitting Order...' : 'Place Order via WhatsApp'}
          </Button>

          <div className="flex items-start gap-2.5 text-sm text-[#625D57] leading-snug">
            <ShieldCheck className="w-4 h-4 text-[#8C5A36] shrink-0 mt-0.5" />
            <span>
              Submitting saves your order as Pending and opens WhatsApp with a prefilled summary for you to send.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
