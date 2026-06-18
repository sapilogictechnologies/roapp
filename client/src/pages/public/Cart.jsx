import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { clearCart, removeFromCart, selectCart, updateQuantity } from '../../features/cart/cartSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import {
  useCheckServiceAreaMutation,
  useCreateOrderMutation,
  useGetAddressesQuery,
  useGetPublicSettingsQuery,
  useGetTimeSlotsQuery,
  useSubmitPaymentProofMutation,
  useValidateCouponMutation,
} from '../../services/api';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
const STEPS = ['Cart', 'Address', 'Slot', 'Payment'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const JAR_OPTIONS = [
  {
    id: 'returning',
    label: 'Returning empty jar now',
    desc: 'Exchange at delivery. No deposit is charged.',
    badge: 'No deposit',
  },
  {
    id: 'no_jar',
    label: 'Need new jar',
    desc: 'Refundable deposit is added for each jar.',
    badge: 'Deposit added',
  },
  {
    id: 'return_later',
    label: 'Return later',
    desc: 'Deposit stays pending until the jar is returned.',
    badge: 'Pending deposit',
  },
  {
    id: 'own_container',
    label: 'Own container',
    desc: 'Use your own container. No jar deposit.',
    badge: 'No deposit',
  },
];

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const assetUrl = (path) => (!path ? '' : path.startsWith('http') ? path : `${API_ORIGIN}${path}`);

function Stepper({ step }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEPS.map((label, index) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${index <= step ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {index < step ? 'OK' : index + 1}
            </div>
            <span className={`hidden text-sm font-semibold sm:block ${index === step ? 'text-blue-700' : index < step ? 'text-cyan-700' : 'text-slate-400'}`}>{label}</span>
          </div>
          {index < STEPS.length - 1 && <div className={`h-0.5 w-8 rounded-full ${index < step ? 'bg-cyan-400' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Summary({ items, subtotal, depositTotal, deliveryFee, discount, total, slotLabel, address }) {
  return (
    <aside className="space-y-4">
      <div className="card">
        <h2 className="mb-4 font-semibold text-slate-900">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Qty {item.quantity}</p>
              </div>
              <span className="font-semibold">{money((item.salePrice || item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>{deliveryFee ? money(deliveryFee) : 'Free / pending'}</span></div>
          {depositTotal > 0 && <div className="flex justify-between text-amber-600"><span>Jar deposit</span><span>{money(depositTotal)}</span></div>}
          {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon discount</span><span>-{money(discount)}</span></div>}
          <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-950"><span>Total</span><span>{money(total)}</span></div>
        </div>
        {slotLabel && <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">{slotLabel}</div>}
        {address && <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{address}</div>}
      </div>
      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900">
        UPI and QR payments stay pending until an admin verifies the screenshot and UTR.
      </div>
    </aside>
  );
}

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCart);
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const fileRef = useRef(null);

  const { data: settings } = useGetPublicSettingsQuery();
  const { data: addresses = [] } = useGetAddressesQuery(undefined, { skip: !isAuth });
  const { data: timeSlots = [] } = useGetTimeSlotsQuery(undefined, { skip: !isAuth });
  const [checkServiceArea, { isLoading: checkingArea }] = useCheckServiceAreaMutation();
  const [validateCoupon, { isLoading: validatingCoupon }] = useValidateCouponMutation();
  const [createOrder, { isLoading: placing }] = useCreateOrderMutation();
  const [submitProof, { isLoading: submittingProof }] = useSubmitPaymentProofMutation();

  const [step, setStep] = useState(0);
  const [jarOptions, setJarOptions] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [manualAddress, setManualAddress] = useState({ fullAddress: '', area: '', pincode: '', city: '' });
  const [delivery, setDelivery] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiMode, setUpiMode] = useState('qr');
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [copied, setCopied] = useState(false);

  const jarDepositAmount = Number(settings?.jarDepositAmount || 150);
  const jarItems = items.filter((item) => item.isJarProduct);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.salePrice || item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const depositTotal = useMemo(() => jarItems.reduce((sum, item) => {
    const option = jarOptions[item.product] || 'no_jar';
    return ['no_jar', 'return_later'].includes(option) ? sum + jarDepositAmount * item.quantity : sum;
  }, 0), [jarItems, jarOptions, jarDepositAmount]);
  const deliveryFee = Number(delivery?.deliveryFee || 0);
  const total = Math.max(0, subtotal + depositTotal + deliveryFee - couponDiscount);
  const activeSlots = (timeSlots || []).filter((slot) => slot.isActive !== false);
  const addressInUse = selectedAddress || manualAddress;
  const slot = activeSlots.find((item) => item._id === selectedSlot);
  const dates = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: index,
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
  });
  const slotLabel = slot ? `${dates[selectedDate]?.label}, ${slot.name} (${slot.startTime}-${slot.endTime})` : '';

  const checkPincode = async (address) => {
    if (!address?.pincode || address.pincode.trim().length !== 6) {
      toast.error('Enter a valid 6-digit pincode');
      return null;
    }
    try {
      const result = await checkServiceArea({ pincode: address.pincode.trim() }).unwrap();
      if (!result.isServiceable) {
        setDelivery(null);
        toast.error(result.message || 'Delivery is not available for this pincode');
        return null;
      }
      setDelivery(result);
      if (!manualAddress.city && result.city) {
        setManualAddress((prev) => ({ ...prev, city: result.city }));
      }
      toast.success(result.message || 'Delivery available');
      return result;
    } catch (err) {
      setDelivery(null);
      toast.error(err?.data?.message || 'Could not check service area');
      return null;
    }
  };

  const ensureLoggedIn = () => {
    if (isAuth) return true;
    toast.error('Login required to checkout');
    navigate('/login');
    return false;
  };

  const goToAddress = () => {
    if (!ensureLoggedIn()) return;
    setStep(1);
  };

  const goToSlot = async () => {
    if (!ensureLoggedIn()) return;
    const hasAddress = selectedAddress?.fullAddress || manualAddress.fullAddress.trim();
    if (!hasAddress) return toast.error('Enter delivery address');
    const currentDelivery = delivery || await checkPincode(addressInUse);
    if (!currentDelivery?.isServiceable) return;
    if (Number(currentDelivery.minimumOrder || 0) > subtotal) {
      return toast.error(`Minimum order for this area is ${money(currentDelivery.minimumOrder)}`);
    }
    setStep(2);
  };

  const goToPayment = () => {
    if (!activeSlots.length) return toast.error('No active delivery slot is configured');
    if (!selectedSlot) return toast.error('Select a delivery slot');
    setStep(3);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setDelivery(null);
    checkPincode(address);
  };

  const handleManualChange = (key, value) => {
    setSelectedAddress(null);
    setDelivery(null);
    setManualAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error('Upload JPG, PNG, or WebP screenshot');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5MB');
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => setScreenshotPreview(loadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return toast.error('Enter coupon code');
    try {
      const result = await validateCoupon({ code: coupon.trim().toUpperCase(), orderAmount: subtotal }).unwrap();
      setCouponDiscount(Number(result.discount || 0));
      toast.success(`${money(result.discount)} discount applied`);
    } catch (err) {
      setCouponDiscount(0);
      toast.error(err?.data?.message || 'Invalid coupon');
    }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(settings?.upiId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('UPI ID copied');
    } catch {
      toast.error('Could not copy UPI ID');
    }
  };

  const openUpi = () => {
    const upiId = settings?.upiId;
    if (!upiId) return toast.error('UPI ID is not configured');
    window.location.href = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(settings?.businessName || 'RO Water')}&am=${total}&cu=INR`;
  };

  const placeOrder = async () => {
    if (!ensureLoggedIn()) return;
    if (!delivery?.isServiceable) return toast.error('Check delivery availability first');
    if (Number(delivery.minimumOrder || 0) > subtotal) return toast.error(`Minimum order for this area is ${money(delivery.minimumOrder)}`);
    if (!selectedSlot) return toast.error('Select a delivery slot');
    if (paymentMethod === 'upi' && !screenshot) return toast.error('Upload payment screenshot');

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          hasEmptyJar: (jarOptions[item.product] || 'no_jar') === 'returning',
          jarOption: item.isJarProduct ? (jarOptions[item.product] || 'no_jar') : 'own_container',
        })),
        address: addressInUse.fullAddress,
        area: addressInUse.area,
        pincode: addressInUse.pincode,
        city: delivery.city || addressInUse.city,
        locationSource: 'pincode',
        timeSlot: selectedSlot,
        paymentMethod,
        orderNotes: [notes, slotLabel ? `Slot: ${slotLabel}` : ''].filter(Boolean).join(' | '),
        couponCode: coupon.trim() || undefined,
      }).unwrap();

      if (paymentMethod === 'upi') {
        const proof = new FormData();
        proof.append('orderId', order._id);
        proof.append('amount', String(total));
        proof.append('expectedAmount', String(order.total || total));
        proof.append('method', 'upi');
        proof.append('utrNumber', utrNumber.trim());
        proof.append('notes', notes || 'Checkout UPI payment proof');
        proof.append('screenshot', screenshot);
        try {
          await submitProof(proof).unwrap();
        } catch (proofErr) {
          toast.error(proofErr?.data?.message || 'Order placed, but proof upload failed. Submit it from My Payments.');
        }
      }

      dispatch(clearCart());
      setOrderPlaced(order);
      toast.success(`Order #${order.orderNumber} placed`);
    } catch (err) {
      toast.error(err?.data?.message || 'Order failed');
    }
  };

  if (!items.length && !orderPlaced) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700">RO</div>
          <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-500">Add RO jars, bottles, or cartons before checkout.</p>
          <Link to="/products" className="btn-primary mt-5">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Cart & Checkout</h1>
              <p className="text-sm text-slate-500">Address, slot, jar deposit, and manual payment verification.</p>
            </div>
            <Link to="/products" className="btn-secondary btn-sm">Continue shopping</Link>
          </div>
          <Stepper step={step} />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          {step === 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Cart Items</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                      {item.isJarProduct ? 'JAR' : 'RO'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{money(item.salePrice || item.price)} / {item.unit || 'unit'}</p>
                          {item.isJarProduct && <p className="mt-1 text-xs text-amber-600">Refundable deposit may apply.</p>}
                        </div>
                        <button onClick={() => dispatch(removeFromCart(item.product))} className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600">Remove</button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <button onClick={() => dispatch(updateQuantity({ product: item.product, quantity: item.quantity - 1 }))} className="h-9 w-9 text-lg font-bold text-slate-500 hover:bg-slate-50">-</button>
                          <span className="flex h-9 w-10 items-center justify-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ product: item.product, quantity: item.quantity + 1 }))} className="h-9 w-9 text-lg font-bold text-slate-500 hover:bg-slate-50">+</button>
                        </div>
                        <span className="font-bold text-slate-900">{money((item.salePrice || item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {jarItems.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-slate-900">Jar Deposit Choice</h3>
                  {jarItems.map((item) => (
                    <div key={item.product} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-800">{item.name} x {item.quantity}</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {JAR_OPTIONS.map((option) => {
                          const selected = (jarOptions[item.product] || 'no_jar') === option.id;
                          const deposit = ['no_jar', 'return_later'].includes(option.id) ? jarDepositAmount * item.quantity : 0;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setJarOptions((prev) => ({ ...prev, [item.product]: option.id }))}
                              className={`rounded-2xl border p-3 text-left transition ${selected ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent bg-white/70 hover:border-blue-200'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                  <p className="mt-1 text-xs text-slate-500">{option.desc}</p>
                                </div>
                                <span className={`badge ${deposit ? 'badge-yellow' : 'badge-cyan'}`}>{option.badge}</span>
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-700">{deposit ? `Adds ${money(deposit)}` : 'Adds Rs. 0'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={goToAddress} className="btn-primary mt-6 w-full">Continue to address</button>
            </div>
          )}

          {step === 1 && (
            <div className="card space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Delivery Address</h2>
                <p className="text-sm text-slate-500">Pincode is used to block unsupported service areas and apply fee/minimum order.</p>
              </div>

              {addresses.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => handleAddressSelect(address)}
                      className={`rounded-2xl border p-4 text-left transition ${selectedAddress?._id === address._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                    >
                      <p className="font-semibold text-slate-900">{address.label || 'Address'}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{address.fullAddress}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">{address.pincode} {address.city}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="mb-3 font-semibold text-slate-900">New Address</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="label">Full Address</label>
                    <textarea className="input" rows={2} value={manualAddress.fullAddress} onChange={(event) => handleManualChange('fullAddress', event.target.value)} placeholder="House, building, street" />
                  </div>
                  <div>
                    <label className="label">Area / Locality</label>
                    <input className="input" value={manualAddress.area} onChange={(event) => handleManualChange('area', event.target.value)} placeholder="Area" />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input className="input" inputMode="numeric" maxLength={6} value={manualAddress.pincode} onChange={(event) => handleManualChange('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="110001" />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" value={manualAddress.city} onChange={(event) => handleManualChange('city', event.target.value)} placeholder="City" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => checkPincode(addressInUse)} disabled={checkingArea} className="btn-secondary">
                  {checkingArea ? 'Checking...' : 'Check service area'}
                </button>
                {delivery?.isServiceable && (
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Delivery {money(delivery.deliveryFee)} | Min {money(delivery.minimumOrder)} | ETA {delivery.etaMinutes} min
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
                <button onClick={goToSlot} className="btn-primary flex-1">Continue to slot</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Delivery Slot</h2>
                <p className="text-sm text-slate-500">Choose a delivery date and active admin-configured slot.</p>
              </div>
              <div>
                <label className="label">Date</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {dates.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedDate(item.value)}
                      className={`min-w-24 rounded-2xl border px-4 py-3 text-left ${selectedDate === item.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-sm">{item.date}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Time Slot</label>
                {!activeSlots.length ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">No active delivery slots are configured.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    {activeSlots.map((slotItem) => (
                      <button
                        key={slotItem._id}
                        type="button"
                        onClick={() => setSelectedSlot(slotItem._id)}
                        className={`rounded-2xl border p-4 text-left ${selectedSlot === slotItem._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                      >
                        <p className="font-semibold text-slate-900">{slotItem.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{slotItem.startTime}-{slotItem.endTime}</p>
                        <p className="mt-2 text-xs font-medium text-cyan-700">Max {slotItem.maxOrders || 0} orders</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button onClick={goToPayment} className="btn-primary flex-1">Continue to payment</button>
              </div>
            </div>
          )}

          {step === 3 && !orderPlaced && (
            <div className="card space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
                <p className="text-sm text-slate-500">Pay externally for UPI/QR, then upload proof for admin verification.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { id: 'upi', label: 'UPI / QR', desc: 'Screenshot and UTR required' },
                  ...(settings?.codEnabled !== false ? [{ id: 'cod', label: 'Cash on Delivery', desc: 'Admin marks cash received' }] : []),
                  ...(settings?.payLaterEnabled && user?.allowPayLater ? [{ id: 'credit', label: 'Pay Later', desc: 'Added to customer dues' }] : []),
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-2xl border p-4 text-left ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                  >
                    <p className="font-semibold text-slate-900">{method.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{method.desc}</p>
                  </button>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div className="overflow-hidden rounded-2xl border border-blue-100">
                  <div className="grid grid-cols-2 border-b border-blue-100">
                    <button type="button" onClick={() => setUpiMode('qr')} className={`py-3 text-sm font-semibold ${upiMode === 'qr' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>QR scan</button>
                    <button type="button" onClick={() => setUpiMode('id')} className={`py-3 text-sm font-semibold ${upiMode === 'id' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>UPI ID</button>
                  </div>
                  {upiMode === 'qr' ? (
                    <div className="p-4 text-center">
                      <p className="font-semibold text-slate-900">{settings?.businessName || 'RO Water'}</p>
                      <p className="text-sm text-slate-500">Pay {money(total)}</p>
                      {settings?.qrImage ? (
                        <img src={assetUrl(settings.qrImage)} alt="Payment QR" className="mx-auto mt-3 h-48 w-48 rounded-2xl border border-slate-200 bg-white object-contain p-2" />
                      ) : (
                        <div className="mx-auto mt-3 grid h-48 w-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">QR not configured</div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm text-slate-500">{settings?.paymentInstructions || 'Pay to the UPI ID, then upload screenshot and UTR.'}</p>
                      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">UPI ID</p>
                          <p className="truncate font-mono font-bold text-blue-700">{settings?.upiId || 'Not configured'}</p>
                        </div>
                        <button type="button" onClick={copyUpi} className="btn-secondary btn-sm">{copied ? 'Copied' : 'Copy'}</button>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-blue-100 p-4">
                    <button type="button" onClick={openUpi} className="btn-primary w-full">Open UPI app for {money(total)}</button>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="label">UTR / Transaction ID</label>
                        <input className="input" value={utrNumber} onChange={(event) => setUtrNumber(event.target.value)} placeholder="Enter UTR" />
                      </div>
                      <div>
                        <label className="label">Screenshot</label>
                        <input ref={fileRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
                        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full">{screenshot ? 'Change screenshot' : 'Upload screenshot'}</button>
                      </div>
                    </div>
                    {screenshotPreview && <img src={screenshotPreview} alt="Payment proof preview" className="mt-3 max-h-56 w-full rounded-2xl border border-slate-200 object-contain" />}
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Cash will be collected at delivery and marked received by admin.
                </div>
              )}

              {paymentMethod === 'credit' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  This order will be added to your outstanding dues.
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input className="input" value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Coupon code" />
                <button onClick={applyCoupon} disabled={validatingCoupon} className="btn-secondary">{validatingCoupon ? 'Checking...' : 'Apply coupon'}</button>
              </div>
              <div>
                <label className="label">Order Notes</label>
                <input className="input" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Call before delivery, landmark, etc." />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button onClick={placeOrder} disabled={placing || submittingProof} className="btn-primary flex-1">
                  {placing || submittingProof ? 'Placing...' : `Place order - ${money(total)}`}
                </button>
              </div>
            </div>
          )}

          {orderPlaced && (
            <div className="card py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-600">OK</div>
              <h2 className="text-2xl font-bold text-slate-950">Order placed</h2>
              <p className="mt-2 text-sm text-slate-500">Order #{orderPlaced.orderNumber}</p>
              {paymentMethod === 'upi' && <p className="mt-2 text-sm font-medium text-amber-600">Payment is pending admin verification.</p>}
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/orders" className="btn-primary">Track order</Link>
                <Link to="/products" className="btn-secondary">Shop more</Link>
              </div>
            </div>
          )}
        </section>

        <Summary
          items={items}
          subtotal={subtotal}
          depositTotal={depositTotal}
          deliveryFee={delivery?.deliveryFee}
          discount={couponDiscount}
          total={total}
          slotLabel={slotLabel}
          address={addressInUse?.fullAddress}
        />
      </main>
    </div>
  );
}
