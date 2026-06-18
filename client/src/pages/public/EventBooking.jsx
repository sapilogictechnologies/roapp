import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useCreateEventMutation } from '../../services/api';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';

const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Corporate Event',
  'Conference',
  'Party',
  'Seminar',
  'School / College',
  'Religious Function',
  'Other',
];

const WATER_OPTIONS = [
  {
    key: '20L RO Jar',
    icon: '🫙',
    title: '20L RO Jar',
    unit: 'jars',
    desc: 'Best for large functions and refillable service.',
  },
  {
    key: '1L Sealed Bottles',
    icon: '🍶',
    title: '1L Sealed Bottles',
    unit: 'bottles',
    desc: 'Premium sealed bottles for guests and VIP counters.',
  },
  {
    key: '500ml Bottles',
    icon: '🥤',
    title: '500ml Bottles',
    unit: 'bottles',
    desc: 'Compact bottles for conferences and outdoor events.',
  },
  {
    key: 'Bulk Cartons',
    icon: '📦',
    title: 'Bulk Cartons',
    unit: 'cartons',
    desc: 'Bulk packaged water for offices, camps, and halls.',
  },
  {
    key: 'Custom Requirement',
    icon: '💧',
    title: 'Custom Requirement',
    unit: 'units',
    desc: 'Tell us your exact event water requirement.',
  },
];

const PROCESS = [
  ['1', 'Submit Enquiry', 'Share event date, venue, guests, and water requirement.'],
  ['2', 'Admin Reviews', 'Owner checks quantity, service area, and delivery timing.'],
  ['3', 'Receive Quote', 'You get a custom quote in your customer dashboard.'],
  ['4', 'Accept & Confirm', 'Accept the quote online and admin confirms booking.'],
];

export default function EventBooking() {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const [createEvent, { isLoading }] = useCreateEventMutation();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    eventType: '',
    eventDate: '',
    venue: '',
    guestCount: '',
    waterQuantity: '',
    waterType: '',
    chilledWaterNeeded: false,
    deliveryTiming: '',
    notes: '',
  });

  const [selectedWater, setSelectedWater] = useState([]);

  const selectedWaterText = useMemo(() => {
    if (selectedWater.length === 0) return '';
    return selectedWater.map((item) => item.title).join(', ');
  }, [selectedWater]);

  const selectedQuantityText = useMemo(() => {
    if (selectedWater.length === 0) return '';
    return selectedWater
      .map((item) => `${item.quantity} ${item.unit} ${item.title}`)
      .join(', ');
  }, [selectedWater]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isSelected = (key) => selectedWater.some((item) => item.key === key);

  const toggleWater = (option) => {
    setSelectedWater((prev) => {
      const exists = prev.some((item) => item.key === option.key);

      if (exists) {
        return prev.filter((item) => item.key !== option.key);
      }

      return [
        ...prev,
        {
          key: option.key,
          title: option.title,
          unit: option.unit,
          quantity: 1,
        },
      ];
    });
  };

  const updateWaterQuantity = (key, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setSelectedWater((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuth) {
      toast.error('Please login to submit event enquiry');
      navigate('/login');
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.eventType || !form.eventDate || !form.venue.trim()) {
      toast.error('Please fill all required event details');
      return;
    }

    if (!form.guestCount || Number(form.guestCount) <= 0) {
      toast.error('Please enter valid guest count');
      return;
    }

    if (selectedWater.length === 0 && !form.waterType.trim()) {
      toast.error('Please select product and quantity, or enter custom water type');
      return;
    }

    try {
      const finalWaterType = form.waterType?.trim() || selectedWaterText;
      const finalWaterQuantity = form.waterQuantity?.trim() || selectedQuantityText;

      const payload = {
        ...form,
        guestCount: Number(form.guestCount),
        waterType: finalWaterType,
        waterQuantity: finalWaterQuantity,
        status: 'new',
      };

      await createEvent(payload).unwrap();

      toast.success('Event enquiry submitted. Admin will send quote soon.');
      navigate('/customer/events');
    } catch (error) {
      toast.error(error?.data?.message || 'Could not submit event enquiry');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="page-container relative grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="section-eyebrow">Events & Bulk Orders</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              Event Water Supply
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Book purified RO water for weddings, corporate events, conferences, parties,
              and large gatherings. Submit enquiry first, then admin sends a custom quote.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#event-form"
                className="rounded-2xl bg-blue-700 px-8 py-4 text-center text-base font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800"
              >
                Submit Enquiry
              </a>
              {isAuth ? (
                <Link
                  to="/customer/events"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-slate-900 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                >
                  My Event Quotes
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-slate-900 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Login to Book
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[3rem] bg-cyan-300/30 blur-3xl" />
            <div className="relative rounded-[3rem] border border-cyan-200 bg-white p-7 shadow-2xl shadow-cyan-100">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-cyan-500 p-8 text-white">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl">
                  🎉
                </div>
                <h2 className="text-3xl font-black tracking-tight">Custom Event Quote</h2>
                <p className="mt-4 text-base leading-7 text-blue-50">
                  Select products with quantities, submit enquiry, and receive admin quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAuth && (
        <section className="border-y border-amber-200 bg-amber-50">
          <div className="page-container flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-amber-900">Login required to submit enquiry</p>
              <p className="text-sm font-semibold text-amber-700">
                You can view this page, but event enquiries require customer login.
              </p>
            </div>
            <Link
              to="/login"
              className="rounded-2xl bg-amber-600 px-6 py-3 text-center text-sm font-black text-white hover:bg-amber-700"
            >
              Login Now
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="page-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="section-eyebrow">Process</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Quote Flow That Works
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {PROCESS.map(([num, title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-sm font-black text-white">
                  {num}
                </div>
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="event-form" className="bg-slate-50 py-20">
        <div className="page-container grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <p className="section-eyebrow">Booking Enquiry</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Tell Us About Your Event
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="label">Your Name *</label>
                <input className="input h-14 rounded-2xl" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Full name" required />
              </div>

              <div>
                <label className="label">Phone *</label>
                <input className="input h-14 rounded-2xl" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="Mobile number" required />
              </div>

              <div>
                <label className="label">Email</label>
                <input className="input h-14 rounded-2xl" type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="email@example.com" />
              </div>

              <div>
                <label className="label">Event Type *</label>
                <select className="input h-14 rounded-2xl" value={form.eventType} onChange={(e) => updateForm('eventType', e.target.value)} required>
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Event Date *</label>
                <input className="input h-14 rounded-2xl" type="date" value={form.eventDate} onChange={(e) => updateForm('eventDate', e.target.value)} required />
              </div>

              <div>
                <label className="label">Guest Count *</label>
                <input className="input h-14 rounded-2xl" type="number" min="1" value={form.guestCount} onChange={(e) => updateForm('guestCount', e.target.value)} placeholder="Example: 250" required />
              </div>

              <div className="md:col-span-2">
                <label className="label">Venue / Delivery Address *</label>
                <input className="input h-14 rounded-2xl" value={form.venue} onChange={(e) => updateForm('venue', e.target.value)} placeholder="Event venue with area and pincode" required />
              </div>

              <div>
                <label className="label">Delivery Timing</label>
                <input className="input h-14 rounded-2xl" value={form.deliveryTiming} onChange={(e) => updateForm('deliveryTiming', e.target.value)} placeholder="Example: 8:00 AM before event" />
              </div>
            </div>

            <div className="mt-7">
              <label className="label">Select Products & Quantity *</label>
              <div className="grid gap-4 md:grid-cols-2">
                {WATER_OPTIONS.map((item) => {
                  const active = isSelected(item.key);
                  const selectedItem = selectedWater.find((x) => x.key === item.key);

                  return (
                    <div
                      key={item.key}
                      className={`rounded-3xl border p-5 transition ${
                        active ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleWater(item)}
                        className="w-full text-left"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <span className="text-3xl">{item.icon}</span>
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            ✓
                          </span>
                        </div>
                        <p className="font-black text-slate-950">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                      </button>

                      {active && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                          <span className="text-sm font-black text-slate-700">Quantity</span>
                          <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateWaterQuantity(item.key, selectedItem.quantity - 1)}
                              className="h-10 w-10 text-lg font-black text-slate-500 hover:bg-slate-50"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={selectedItem.quantity}
                              onChange={(e) => updateWaterQuantity(item.key, e.target.value)}
                              className="h-10 w-16 border-x border-slate-200 text-center text-sm font-black outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateWaterQuantity(item.key, selectedItem.quantity + 1)}
                              className="h-10 w-10 text-lg font-black text-slate-500 hover:bg-slate-50"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-black text-slate-500">{item.unit}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <input
                className="input mt-4 h-14 rounded-2xl"
                value={form.waterType}
                onChange={(e) => updateForm('waterType', e.target.value)}
                placeholder="Optional custom water type"
              />

              <input
                className="input mt-4 h-14 rounded-2xl"
                value={form.waterQuantity}
                onChange={(e) => updateForm('waterQuantity', e.target.value)}
                placeholder="Optional custom quantity note"
              />
            </div>

            <div className="mt-7 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="font-black text-slate-950">Chilled Water Needed?</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Select yes if you need cold water supply for guests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateForm('chilledWaterNeeded', !form.chilledWaterNeeded)}
                className={`relative h-8 w-16 shrink-0 rounded-full transition ${form.chilledWaterNeeded ? 'bg-blue-700' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${form.chilledWaterNeeded ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            <div className="mt-7">
              <label className="label">Additional Notes</label>
              <textarea
                className="input min-h-32 rounded-2xl"
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                placeholder="Mention floor, contact person, special timing, loading point, cold storage needs, etc."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-base font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800 disabled:opacity-60"
            >
              {isLoading ? 'Submitting Enquiry...' : isAuth ? 'Submit Event Enquiry' : 'Login to Submit'}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Enquiry Summary</h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Event</p>
                  <p className="mt-1 font-black text-slate-950">{form.eventType || 'Not selected'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Guests</p>
                    <p className="mt-1 font-black text-slate-950">{form.guestCount || '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Date</p>
                    <p className="mt-1 font-black text-slate-950">{form.eventDate || '—'}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-500">Selected Products</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-blue-900">
                    {selectedQuantityText || form.waterQuantity || 'Select product and quantity'}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Status After Submit</p>
                  <p className="mt-1 font-black text-emerald-900">New Enquiry</p>
                </div>
              </div>
            </div>

            {isAuth && (
              <Link
                to="/customer/events"
                className="flex rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 transition hover:bg-cyan-100"
              >
                <div>
                  <p className="text-lg font-black text-cyan-900">Track Your Event Quotes</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-cyan-700">
                    View enquiry status, quote amount, and accept/reject quote.
                  </p>
                </div>
              </Link>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
