import React from 'react';
import { Link } from 'react-router-dom';

const PolicyNav = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="font-black text-slate-950">Policy Pages</h3>
    <div className="mt-4 space-y-2">
      {[
        ['/privacy', 'Privacy Policy'],
        ['/refund-policy', 'Refund Policy'],
        ['/delivery-policy', 'Delivery Policy'],
        ['/jar-return-policy', 'Jar Return Policy'],
        ['/payment-help', 'Payment Help'],
      ].map(([to, label]) => (
        <Link key={to} to={to} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
          {label}
        </Link>
      ))}
    </div>
  </div>
);

export default function JarReturnPolicy() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="page-container relative py-16 md:py-24">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Jar Return Policy</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            How jar deposits work, how to return empty jars, and how to get your deposit back.
          </p>
          <p className="mt-3 text-sm text-slate-400">Last updated: January 2026</p>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">

            {/* Jar flow visual */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-black text-amber-900">Jar Deposit Flow</h2>
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  ['📦', '1. Order Jar', 'New jar delivered with ₹150 refundable deposit added.'],
                  ['🫙', '2. Use & Empty', 'Use the water. Keep the empty jar safely.'],
                  ['🔄', '3. Request Return', 'Click Return Jar in your Jar Status dashboard.'],
                  ['💰', '4. Get Refund', 'Deposit credited to your wallet on next collection.'],
                ].map(([icon, title, text]) => (
                  <div key={title} className="rounded-2xl bg-white p-4 shadow-sm text-center">
                    <p className="text-3xl">{icon}</p>
                    <p className="mt-3 font-black text-slate-950 text-sm">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: '1. Jar Deposit System',
                items: [
                  'A refundable security deposit is charged per 20L jar when a new jar is required.',
                  'The default deposit is ₹150 per jar. This amount is set by the business and may change.',
                  'Deposit is added to your order total during checkout when you select "Need new jar".',
                  'If you select "Returning empty jar now" at checkout, no deposit is charged.',
                  'If you select "Return later", deposit is charged now and refunded when you return.',
                  'If you select "Own container", no jar is delivered and no deposit is charged.',
                  'Your current jar balance and deposit held are visible in the Jar Status page.',
                ],
              },
              {
                title: '2. How to Return Jars',
                items: [
                  'Go to My Account → Jar Status in your customer dashboard.',
                  'Click "Return Jars & Get Refund" button.',
                  'Select the number of jars you want to return (up to your pending balance).',
                  'Submit the return request. Our team will collect the jar on your next order delivery.',
                  'Alternatively, hand the empty jar to the delivery person at your next delivery.',
                  'Jar returns can also be arranged by contacting admin via WhatsApp or Messages.',
                ],
              },
              {
                title: '3. Deposit Refund',
                items: [
                  'Once the jar is returned, admin marks it as returned in the ledger.',
                  'Deposit (₹150 per jar) is instantly credited to your AquaFlow wallet.',
                  'Wallet balance can be used for future water orders.',
                  'Refunds are only to wallet — not to bank account or UPI.',
                  'You can track wallet balance in your Profile or Customer Dashboard.',
                  'Refunds are processed only after physical collection of the jar.',
                ],
              },
              {
                title: '4. Jar Condition Requirements',
                items: [
                  'Jars must be returned in good condition — no major cracks, chips, or damage.',
                  'Jars with missing caps or severe discoloration may not qualify for full refund.',
                  'Admin has discretion to assess jar condition and may issue partial or no refund.',
                  'Lost jars will not receive a deposit refund.',
                  'Jars reported as stolen must be supported with a complaint reference.',
                ],
              },
              {
                title: '5. Lost or Damaged Jars',
                items: [
                  'If a jar is lost or damaged while in your possession, contact admin immediately.',
                  'Admin may mark the jar as lost/damaged in the ledger.',
                  'Lost/damaged jars will not qualify for deposit refund.',
                  'A replacement jar can be ordered at a new deposit charge.',
                  'Admin may offer partial credit for damaged jars at their discretion.',
                ],
              },
              {
                title: '6. Jar Ledger Transparency',
                items: [
                  'Every jar transaction is logged — deliveries, returns, lost, and damaged.',
                  'You can view your complete jar history in the Jar Status page.',
                  'The ledger shows date, type, quantity, and deposit amount for each entry.',
                  'If you notice a discrepancy in your jar ledger, contact admin via Messages.',
                  'Admin can manually adjust entries after verification.',
                ],
              },
            ].map((sec) => (
              <div key={sec.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-5 text-xl font-black text-slate-950">{sec.title}</h2>
                <ul className="space-y-3">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-slate-600">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="sticky top-24 space-y-4">
              <PolicyNav />
              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <p className="font-black text-amber-900">Track Your Jars</p>
                <p className="mt-2 text-sm text-amber-700">View pending jars, deposit held, and return history in your account.</p>
                <Link to="/jars" className="mt-4 inline-flex rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white hover:bg-amber-700">Jar Status →</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
