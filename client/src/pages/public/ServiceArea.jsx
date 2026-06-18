import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useCheckServiceAreaMutation, useGetServiceAreasQuery } from '../../services/api';

export default function ServiceArea() {
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [result, setResult] = useState(null);
  const [checkArea, { isLoading }] = useCheckServiceAreaMutation();
  const { data: areasData } = useGetServiceAreasQuery();
  const serviceableAreas = (areasData || []).filter((a) => a.isServiceable);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pincode.trim()) {
      toast.error('Please enter your pincode');
      return;
    }

    try {
      const res = await checkArea({
        pincode: pincode.trim(),
        area: area.trim(),
      }).unwrap();

      setResult(res);

      if (res?.isServiceable) {
        toast.success('Delivery is available in your area');
      } else {
        toast.error('This area is not serviceable yet');
      }
    } catch (error) {
      setResult(null);
      toast.error(error?.data?.message || 'Unable to check service area');
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
            <p className="section-eyebrow">Delivery Coverage</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              Check Service Area
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Enter your pincode to confirm availability, delivery fee, minimum order amount,
              and estimated delivery time before placing an order.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['📍', 'Pincode based', 'Admin controlled zones'],
                ['₹', 'Dynamic fee', 'Area-wise delivery rules'],
                ['⏱', 'Clear ETA', 'Know delivery time early'],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 text-2xl">{icon}</div>
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-cyan-100 md:p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Pincode</label>
                <input
                  className="input h-14 rounded-2xl"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Example: 400001"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="label">Area / Locality optional</label>
                <input
                  className="input h-14 rounded-2xl"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Example: Andheri West"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-base font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800 disabled:opacity-60"
              >
                {isLoading ? 'Checking availability...' : 'Check Availability'}
              </button>
            </form>

            {result && (
              <div
                className={`mt-6 rounded-3xl border p-5 ${
                  result.isServiceable
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                      result.isServiceable ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    {result.isServiceable ? '✅' : '❌'}
                  </div>

                  <div>
                    <h3
                      className={`text-xl font-black ${
                        result.isServiceable ? 'text-emerald-900' : 'text-red-800'
                      }`}
                    >
                      {result.isServiceable ? 'Delivery Available' : 'Not Serviceable Yet'}
                    </h3>

                    <p
                      className={`mt-1 text-sm font-semibold leading-6 ${
                        result.isServiceable ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {result.isServiceable
                        ? 'Great news! You can order water delivery in this area.'
                        : 'Sorry, we do not deliver to this pincode right now.'}
                    </p>
                  </div>
                </div>

                {result.isServiceable && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Delivery Fee
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        ₹{result.deliveryFee || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Minimum Order
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        ₹{result.minimumOrder || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        ETA
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {result.etaMinutes || 30} min
                      </p>
                    </div>
                  </div>
                )}

                {result.notes && (
                  <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                    {result.notes}
                  </p>
                )}

                {result.isServiceable && (
                  <Link
                    to="/products"
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
                  >
                    Start Shopping →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {serviceableAreas.length > 0 && (
        <section className="bg-white py-16">
          <div className="page-container">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="section-eyebrow">Serviceable Areas</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">We Deliver to These Areas</h2>
              <p className="mt-4 text-slate-600">Click any area to auto-fill and check availability.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {serviceableAreas.map((sa) => (
                <button
                  key={sa._id}
                  type="button"
                  onClick={() => {
                    setPincode(sa.pincode);
                    setArea(sa.areaName);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-black text-slate-950 text-sm">{sa.areaName}</p>
                    <span className="inline-flex rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Active</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-500">{sa.pincode}</p>
                  {sa.city && <p className="text-xs text-slate-400 mt-0.5">{sa.city}{sa.state ? `, ${sa.state}` : ''}</p>}
                  <div className="mt-3 flex gap-3 text-xs">
                    <span className="font-semibold text-slate-700">Fee: ₹{sa.deliveryFee || 0}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-700">Min: ₹{sa.minimumOrder || 0}</span>
                    {sa.etaMinutes && <><span className="text-slate-400">·</span><span className="font-semibold text-slate-700">{sa.etaMinutes}min</span></>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="page-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Area-Based Delivery Rules
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Delivery availability is controlled by admin-managed service areas and pincodes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              ['1', 'Enter Pincode', 'Customer checks service availability from public page.'],
              ['2', 'System Validates', 'Backend checks active service area rules.'],
              ['3', 'Fee & ETA Applied', 'Delivery fee, minimum order, and ETA are shown.'],
              ['4', 'Checkout Protected', 'Unsupported pincodes are blocked at checkout.'],
            ].map(([num, title, text]) => (
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

      <section className="bg-slate-50 py-20">
        <div className="page-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="section-eyebrow">Delivery Logic</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Clear Pricing Before Checkout
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Customers should never be surprised by delivery charges. This page helps them verify
              whether their area is serviceable and what charges apply.
            </p>

            <div className="mt-7 space-y-4">
              {[
                ['Delivery Fee', 'Applied automatically from admin service area settings.'],
                ['Minimum Order', 'Customer must meet the required order value.'],
                ['ETA Minutes', 'Displayed before order placement for clarity.'],
                ['Service Block', 'Unsupported pincodes are stopped before checkout.'],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
                  <div>
                    <p className="font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-cyan-600 p-8 text-white shadow-2xl shadow-blue-100">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-4xl">
              🗺️
            </div>

            <h2 className="text-4xl font-black tracking-tight">Want Delivery in Your Area?</h2>
            <p className="mt-4 text-lg leading-8 text-blue-50">
              If your pincode is not listed, contact us. Admin can add new service areas,
              delivery fees, ETA, and minimum order rules.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Contact Support
              </Link>
              <Link
                to="/products"
                className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-center text-sm font-black text-white transition hover:bg-white/20"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
