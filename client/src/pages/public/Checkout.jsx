import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { selectCart, clearCart } from '../../features/cart/cartSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import { useCalculateDeliveryMutation, useCreateOrderMutation, useGetTimeSlotsQuery, useValidateCouponMutation, useCheckServiceAreaMutation } from '../../services/api';

export default function Checkout() {
  const items = useSelector(selectCart);
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [locationMode, setLocationMode] = useState('coordinates'); // 'coordinates' | 'pincode'
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const { data: slots } = useGetTimeSlotsQuery();
  const [calculateDelivery, { isLoading: calcLoading }] = useCalculateDeliveryMutation();
  const [checkServiceArea, { isLoading: checkLoading }] = useCheckServiceAreaMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();

  const subtotal = items.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0);
  const depositFee = items.filter(i => i.isJarProduct && !i.hasEmptyJar).reduce((s, i) => s + i.depositAmount * i.quantity, 0);
  const total = subtotal + (delivery?.deliveryFee || 0) + depositFee - couponDiscount;

  const handleCheckCoords = async () => {
    if (!lat || !lng) return toast.error('Enter latitude and longitude');
    try {
      const res = await calculateDelivery({ latitude: parseFloat(lat), longitude: parseFloat(lng), locationSource: 'gps' }).unwrap();
      setDelivery(res);
      if (!res.isServiceable) toast.error(res.message);
      else toast.success(res.message);
    } catch { toast.error('Failed to calculate delivery'); }
  };

  const handleCheckPincode = async () => {
    if (!pincode) return toast.error('Enter pincode');
    try {
      const res = await checkServiceArea({ pincode }).unwrap();
      if (!res.isServiceable) { toast.error(res.message); setDelivery(null); }
      else { setDelivery(res); setCity(res.city || city); toast.success(res.message); }
    } catch { toast.error('Failed to check pincode'); }
  };

  const handleCoupon = async () => {
    try {
      const res = await validateCoupon({ code: couponCode, orderAmount: subtotal }).unwrap();
      setCouponDiscount(res.discount);
      toast.success(`Coupon applied! ₹${res.discount} off`);
    } catch (err) { toast.error(err?.data?.message || 'Invalid coupon'); }
  };

  const handleOrder = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (!address) return toast.error('Enter delivery address');
    if (!delivery?.isServiceable) return toast.error('Check delivery availability first');
    if (!isAuth && (!guestName || !guestPhone)) return toast.error('Enter name and phone for guest checkout');
    if (paymentMethod === 'credit' && !isAuth) return toast.error('Login required for Pay Later');

    try {
      const orderData = {
        items: items.map(i => ({ product: i.product, quantity: i.quantity, hasEmptyJar: i.hasEmptyJar })),
        address,
        area,
        pincode: locationMode === 'pincode' ? pincode : '',
        city,
        locationSource: locationMode === 'coordinates' ? 'gps' : 'pincode',
        coordinates: locationMode === 'coordinates' && lat && lng ? { latitude: parseFloat(lat), longitude: parseFloat(lng) } : undefined,
        timeSlot: timeSlot || undefined,
        paymentMethod,
        orderNotes,
        guestName: !isAuth ? guestName : undefined,
        guestPhone: !isAuth ? guestPhone : undefined,
        couponCode: couponCode || undefined,
      };
      const order = await createOrder(orderData).unwrap();
      dispatch(clearCart());
      toast.success(`Order #${order.orderNumber} placed!`);
      if (paymentMethod === 'upi') {
        toast('Please submit payment proof to confirm your order.', { icon: '💳' });
      }
      navigate(isAuth ? '/orders' : '/');
    } catch (err) { toast.error(err?.data?.message || 'Order failed'); }
  };

  if (!items.length) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <p className="text-slate-500">Cart is empty</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">Checkout</h1>

      {!isAuth && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Guest Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name</label><input className="input" value={guestName} onChange={e => setGuestName(e.target.value)} /></div>
            <div><label className="label">Phone</label><input className="input" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} /></div>
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="font-semibold">Delivery Location</h2>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="locMode" value="coordinates" checked={locationMode==='coordinates'} onChange={() => { setLocationMode('coordinates'); setDelivery(null); }} />
            Use GPS Coordinates
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="locMode" value="pincode" checked={locationMode==='pincode'} onChange={() => { setLocationMode('pincode'); setDelivery(null); }} />
            Enter Pincode
          </label>
        </div>

        {locationMode === 'coordinates' ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Latitude</label><input className="input" placeholder="28.6139" value={lat} onChange={e => setLat(e.target.value)} /></div>
              <div><label className="label">Longitude</label><input className="input" placeholder="77.2090" value={lng} onChange={e => setLng(e.target.value)} /></div>
            </div>
            <button onClick={handleCheckCoords} disabled={calcLoading} className="btn-secondary btn-sm">{calcLoading ? 'Checking...' : 'Check Delivery by Coordinates'}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Pincode</label><input className="input" placeholder="110001" value={pincode} onChange={e => setPincode(e.target.value)} /></div>
              <div><label className="label">Area / Locality</label><input className="input" placeholder="Connaught Place" value={area} onChange={e => setArea(e.target.value)} /></div>
            </div>
            <button onClick={handleCheckPincode} disabled={checkLoading} className="btn-secondary btn-sm">{checkLoading ? 'Checking...' : 'Check Delivery by Pincode'}</button>
          </div>
        )}

        {delivery && (
          <div className={`p-3 rounded text-sm ${delivery.isServiceable ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {delivery.message}
            {delivery.isServiceable && ` | Fee: ₹${delivery.deliveryFee} | Min: ₹${delivery.minimumOrder} | ETA: ${delivery.etaMinutes} min`}
          </div>
        )}

        <div><label className="label">Full Address</label><textarea className="input" rows={2} placeholder="Full delivery address" value={address} onChange={e => setAddress(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">City</label><input className="input" value={city} onChange={e => setCity(e.target.value)} /></div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Slot & Payment</h2>
        <div><label className="label">Time Slot</label>
          <select className="input" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
            <option value="">Select slot</option>
            {slots?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="label">Payment Method</label>
          <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI / QR (upload proof)</option>
            {isAuth && user?.allowPayLater && <option value="credit">Pay Later</option>}
          </select>
        </div>
        {paymentMethod === 'upi' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
            ⚠️ After placing order, you must submit UPI payment proof. Order will be confirmed only after admin verifies payment.
          </div>
        )}
        {paymentMethod === 'credit' && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-800">
            ℹ️ Amount will be added to your outstanding dues.
          </div>
        )}
        <div><label className="label">Notes</label><input className="input" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} /></div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold">Coupon</h2>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} />
          <button onClick={handleCoupon} className="btn-secondary btn-sm">Apply</button>
        </div>
        {couponDiscount > 0 && <p className="text-green-600 text-sm">✓ Discount: -₹{couponDiscount}</p>}
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold">Summary</h2>
        {items.map(i => (
          <div key={i.product} className="flex justify-between text-sm">
            <span>{i.name} × {i.quantity}</span><span>₹{(i.salePrice || i.price) * i.quantity}</span>
          </div>
        ))}
        <div className="border-t pt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>₹{delivery?.deliveryFee || 0}</span></div>
          {depositFee > 0 && <div className="flex justify-between text-orange-600"><span>Jar Deposit</span><span>₹{depositFee}</span></div>}
          {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{couponDiscount}</span></div>}
          <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>₹{total}</span></div>
        </div>
        <button onClick={handleOrder} disabled={orderLoading} className="btn-primary w-full mt-2">
          {orderLoading ? 'Placing...' : `Place Order ₹${total}`}
        </button>
      </div>
    </div>
  );
}
