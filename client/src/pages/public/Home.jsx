import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetPublicSettingsQuery, useCheckServiceAreaMutation } from '../../services/api';

const steps = [
  { icon: '📍', title: 'Check Area', text: 'Enter pincode and instantly confirm delivery availability.' },
  { icon: '🛒', title: 'Choose Products', text: 'Select jars, bottles, cartons, or event water supply.' },
  { icon: '💳', title: 'Pay Securely', text: 'Use UPI, QR scan, COD, or pay later if enabled.' },
  { icon: '🚚', title: 'Fast Delivery', text: 'Get pure RO water delivered to your doorstep.' },
];

const products = [
  { tag: 'Best Seller', icon: '🫙', title: '20L Water Jar', desc: 'RO purified refillable jar with deposit tracking.', price: '₹35', meta: 'Deposit applicable', gradient: 'from-blue-600 to-cyan-500' },
  { tag: 'Daily Use', icon: '🥤', title: 'Packaged Bottles', desc: 'Sealed bottles for home, office, travel, and guests.', price: '₹180', meta: 'No deposit', gradient: 'from-sky-500 to-blue-600' },
  { tag: 'Bulk Supply', icon: '📦', title: 'Bulk Cartons', desc: 'Perfect for offices, shops, events, and functions.', price: '₹320', meta: 'Bulk pricing', gradient: 'from-indigo-600 to-blue-500' },
];

const features = [
  ['🧪', 'RO + UV Purified', 'Multi-stage purification and quality checked water.', 'from-blue-500 to-cyan-500'],
  ['⚡', 'Same-Day Delivery', 'Fast local delivery with clear ETA and slot selection.', 'from-orange-500 to-amber-400'],
  ['🫙', 'Jar Deposit Ledger', 'Transparent deposit, pending jar, and return tracking.', 'from-teal-500 to-emerald-500'],
  ['📍', 'Service Area Check', 'Pincode-based delivery availability and fee rules.', 'from-rose-500 to-pink-500'],
  ['💳', 'Flexible Payments', 'UPI, QR scan, COD, and manual admin verification.', 'from-violet-500 to-purple-500'],
  ['🎉', 'Event Water Supply', 'Send event enquiry and receive admin quote online.', 'from-cyan-500 to-blue-500'],
];

const reviews = [
  { name: 'Priya M.', place: 'Mumbai', text: 'Very clean water and fast delivery. Jar deposit tracking is very useful.' },
  { name: 'Rahul S.', place: 'Bangalore', text: 'We use it for our office. Ordering and billing are simple and professional.' },
  { name: 'Ananya K.', place: 'Pune', text: 'The app is easy to use and delivery updates are clear.' },
];

const faqs = [
  { q: 'How does jar deposit work?', a: 'If you need a new 20L jar, a refundable deposit is added. When you return the empty jar, admin can update your jar ledger and deposit status.' },
  { q: 'Can I order without logging in?', a: 'Guests can browse products and service areas, but ordering and checkout require customer login.' },
  { q: 'How do I pay?', a: 'You can pay by UPI ID, QR scan, cash on delivery, or pay later if the business enables it for your account.' },
  { q: 'Can I book water for events?', a: 'Yes. Submit event details and the admin will send you a quote. You can accept or reject it from your account.' },
];

export default function Home() {
  const { data: settings } = useGetPublicSettingsQuery();
  const [checkArea, { isLoading }] = useCheckServiceAreaMutation();
  const [pincode, setPincode] = useState('');
  const [areaResult, setAreaResult] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCheckArea = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) { toast.error('Please enter pincode'); return; }
    try {
      const result = await checkArea({ pincode: pincode.trim() }).unwrap();
      setAreaResult(result);
      if (result?.isServiceable) { toast.success('Great! Delivery is available in your area.'); }
      else { toast.error('Sorry, this pincode is not serviceable yet.'); }
    } catch (error) {
      toast.error(error?.data?.message || 'Could not check service area');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* ── Announcement Banner ── */}
      {settings?.announcementBanner && (
        <div className="border-b border-cyan-200 text-center px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(90deg,#0F2747,#2563EB,#0F2747)' }}>
          🎉 {settings.announcementBanner}
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO — Dark Navy Premium
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#071B34 0%,#0F2747 55%,#071B34 100%)' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        {/* Glow blobs */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.25)' }} />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: 'rgba(6,182,212,0.15)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-3xl" style={{ background: 'rgba(14,165,233,0.06)' }} />

        <div className="page-container relative grid min-h-[780px] grid-cols-1 items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
          {/* ── LEFT: Content ── */}
          <div className="animate-fade-in">
            {/* Live badge */}
            <div className="mb-8 flex items-center gap-3">
              <div className="live-badge">
                <span className="live-dot" />
                Live delivery active
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-blue-300" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                ⚡ Same-day delivery
              </div>
            </div>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-[68px] lg:leading-[1.05]" style={{ color: 'white' }}>
              Pure Water,
              <span className="block text-gradient-light">Delivered Fast</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8" style={{ color: 'rgba(186,215,255,0.85)' }}>
              Order RO jars, bottles, cartons, and event water supply with transparent pricing,
              service-area checks, payment verification, and jar deposit tracking.
            </p>

            {/* Pincode checker */}
            <form onSubmit={handleCheckArea} className="mt-9 flex max-w-xl flex-col gap-3 sm:flex-row" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1.5rem', padding: '10px' }}>
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <span className="text-blue-300">📍</span>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter your pincode"
                  className="h-12 w-full bg-transparent text-base font-semibold outline-none placeholder:font-medium"
                  style={{ color: 'white', caretColor: '#38BDF8' }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl px-8 py-3.5 text-base font-black text-white disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(249,115,22,0.6)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'}
              >
                {isLoading ? 'Checking...' : 'Check Area'}
              </button>
            </form>

            {areaResult && (
              <div className={`mt-4 max-w-xl rounded-2xl border px-5 py-4 text-sm font-semibold animate-scale-in ${areaResult.isServiceable ? 'border-emerald-400/30 text-emerald-300' : 'border-red-400/30 text-red-300'}`}
                style={{ background: areaResult.isServiceable ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                {areaResult.isServiceable
                  ? `✓ Delivery available. Fee ₹${areaResult.deliveryFee || 0}, ETA ${areaResult.etaMinutes || 30} mins.`
                  : '✕ This pincode is not serviceable yet.'}
              </div>
            )}

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="rounded-2xl px-8 py-4 text-center text-base font-black text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', boxShadow: '0 4px 24px rgba(37,99,235,0.5)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.7)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.5)'; }}
              >
                Order Water Now →
              </Link>
              <Link
                to="/service-area"
                className="rounded-2xl px-8 py-4 text-center text-base font-black transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Check Service Area
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              {[['8+', 'Cities Served'], ['24k+', 'Orders Done'], ['4.8★', 'Avg. Rating']].map(([num, label]) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <p className="text-2xl font-black text-white">{num}</p>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(148,195,255,0.8)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Jar Visual ── */}
          <div className="relative mx-auto w-full max-w-lg animate-slide-up">
            {/* Glow behind card */}
            <div className="absolute inset-0 rounded-[3rem] blur-3xl" style={{ background: 'rgba(37,99,235,0.2)' }} />

            {/* Main card */}
            <div className="relative rounded-[3rem] p-8" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
              <div className="rounded-[2.5rem] p-8 text-center" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="mx-auto mb-7 flex h-40 w-40 items-center justify-center rounded-[3rem]" style={{ background: 'rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <span className="text-7xl animate-float">💧</span>
                </div>
                <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: '#38BDF8' }}>RO Pure Water</p>
                <h2 className="mt-3 text-7xl font-black text-white">20L</h2>
                <p className="mt-3 text-lg font-bold" style={{ color: 'rgba(186,215,255,0.8)' }}>Fresh jar delivery</p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-sm font-bold" style={{ color: 'rgba(186,215,255,0.7)' }}>Starting from</p>
                    <p className="text-2xl font-black" style={{ color: '#38BDF8' }}>₹35</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-sm font-bold" style={{ color: 'rgba(186,215,255,0.7)' }}>Delivery</p>
                    <p className="text-2xl font-black text-emerald-400">Fast</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge — left */}
            <div className="absolute -left-6 top-12 animate-float float-badge">
              <p className="text-sm font-black text-slate-950">⚡ Same-day</p>
              <p className="text-xs font-semibold text-slate-500">Fast local delivery</p>
            </div>

            {/* Floating badge — right */}
            <div className="absolute -right-6 bottom-20 animate-float-slow float-badge">
              <p className="text-sm font-black text-slate-950">🫙 Jar ledger</p>
              <p className="text-xs font-semibold text-slate-500">Deposit tracking</p>
            </div>

            {/* Trust badge — bottom center */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 float-badge px-5 py-2.5">
              <p className="text-xs font-black text-emerald-600 flex items-center gap-1.5">
                <span className="live-dot" />
                RO + UV Purified • Quality Assured
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="bg-white py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,#2563EB,#0EA5E9,#06B6D4)' }} />
        <div className="page-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="section-eyebrow">Simple Process</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">How AquaFlow Works</h2>
            <p className="mt-4 text-lg text-slate-600">A clean ordering flow designed for home, office, and event water delivery.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {steps.map((item, index) => (
              <div key={item.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl" style={{ '--hover-shadow': '0 20px 40px rgba(37,99,235,0.12)' }}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-black" style={{ color: '#2563EB', opacity: 0.35 }}>0{index + 1}</span>
                </div>
                <div className="mb-3 h-0.5 w-8 rounded-full" style={{ background: 'linear-gradient(90deg,#2563EB,#0EA5E9)', opacity: 0.3 }} />
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRODUCTS
      ════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#F0F7FF' }}>
        <div className="page-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="section-eyebrow">Products</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Water for Every Need</h2>
            <p className="mt-4 text-lg text-slate-600">Choose the right water product for your home, office, or event.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="mb-6 flex items-start justify-between">
                  <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                    {item.tag}
                  </span>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-4xl shadow-lg transition-transform duration-300 hover:scale-110`}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.desc}</p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Starting from</p>
                    <p className="text-3xl font-black text-slate-950">{item.price}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">{item.meta}</span>
                </div>
                <Link
                  to="/products"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#071B34,#0F2747)', boxShadow: '0 4px 16px rgba(7,27,52,0.3)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg,#0F2747,#1e3a5f)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg,#071B34,#0F2747)'}
                >
                  Shop Now <span className="text-blue-300">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="page-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="section-eyebrow">Why AquaFlow</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Built Around Your Needs</h2>
            <p className="mt-4 text-lg text-slate-600">Every feature built to make water delivery simple, transparent, and professional.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, title, text, gradient]) => (
              <div key={title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className={`mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl p-3 transition-transform duration-300 group-hover:scale-110`} style={{ width: '52px', height: '52px' }}>
                  {icon}
                </div>
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          JAR DEPOSIT — Navy Section
      ════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#071B34 0%,#0F2747 50%,#071B34 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.3)' }} />
        <div className="absolute -bottom-32 left-0 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(6,182,212,0.2)' }} />

        <div className="page-container relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-cyan-300 mb-6" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
              🫙 Jar Deposit System
            </span>
            <h2 className="text-4xl font-black tracking-tight text-white">
              Transparent Jar Deposit Management
            </h2>
            <p className="mt-5 text-lg leading-8" style={{ color: 'rgba(186,215,255,0.8)' }}>
              Customers can return empty jars, request a new jar, return later, or use their own container.
              Every movement can be tracked in the jar ledger.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Returning now', 'Need new jar', 'Return later', 'Own container'].map((item) => (
                <span key={item} className="rounded-full px-4 py-2 text-sm font-bold text-cyan-200" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['1', 'Select jar option', 'Choose return/deposit option at checkout.', 'rgba(37,99,235,1)'],
              ['2', 'Deposit calculated', 'Deposit applies only when required.', 'rgba(6,182,212,1)'],
              ['3', 'Ledger updated', 'Pending jars and deposits stay visible.', 'rgba(16,185,129,1)'],
              ['4', 'Admin control', 'Admin can mark returns and adjust records.', 'rgba(249,115,22,1)'],
            ].map(([num, title, text, color]) => (
              <div key={title} className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: color }}>
                  {num}
                </div>
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(186,215,255,0.7)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          REVIEWS
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="page-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="section-eyebrow">Reviews</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">What Customers Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((item) => (
              <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-100" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="flex mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="text-base leading-7 text-slate-700 italic">"{item.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-950">{item.name}</p>
                    <p className="text-sm font-semibold text-slate-500">{item.place}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#F0F7FF' }}>
        <div className="page-container grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="section-eyebrow">FAQ</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Questions?</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Everything about ordering, delivery, payment, and jar deposit.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex rounded-2xl px-6 py-3 text-sm font-black text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
            >
              Contact Us →
            </Link>
          </div>

          <div className="space-y-3 lg:col-span-3">
            {faqs.map((item, index) => (
              <div key={item.q} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-200" style={{ boxShadow: openFaq === index ? '0 8px 30px rgba(37,99,235,0.1)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-black text-slate-950">{item.q}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full font-black text-lg transition-all duration-200 ${openFaq === index ? 'text-white' : 'text-blue-700'}`} style={{ background: openFaq === index ? 'linear-gradient(135deg,#2563EB,#0EA5E9)' : '#EFF6FF' }}>
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="border-t border-slate-100 px-6 pb-6 pt-4 text-sm leading-7 text-slate-600 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA — Navy Premium
      ════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="relative rounded-[2.5rem] p-12 text-center overflow-hidden md:p-20" style={{ background: 'linear-gradient(135deg,#071B34 0%,#0F2747 50%,#071B34 100%)', boxShadow: '0 24px 64px rgba(7,27,52,0.35)' }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.3)' }} />

            <div className="relative">
              <div className="live-badge mx-auto mb-6 w-fit">
                <span className="live-dot" />
                Accepting orders now
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Ready for Pure Fresh Water?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8" style={{ color: 'rgba(186,215,255,0.8)' }}>
                Start ordering water for your home, office, or event with a professional delivery experience.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/products"
                  className="rounded-2xl px-10 py-4 text-base font-black text-blue-700 transition-all"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
                >
                  Order Now →
                </Link>
                <Link
                  to="/event-booking"
                  className="rounded-2xl px-10 py-4 text-base font-black text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Book Event Supply
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
