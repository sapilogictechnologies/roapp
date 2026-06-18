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

export default function RefundPolicy() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="page-container relative py-16 md:py-24">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Refund Policy</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Understand how cancellations, refunds, and deposit returns work at AquaFlow.
          </p>
          <p className="mt-3 text-sm text-slate-400">Last updated: January 2026</p>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <h2 className="text-xl font-black text-emerald-900">Quick Summary</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['✅', 'Jar Deposit', 'Fully refundable when jar is returned in good condition'],
                  ['✅', 'Order Cancellation', 'Full refund if cancelled before order is prepared'],
                  ['⚠️', 'After Delivery', 'Contact support within 24 hours for quality issues'],
                ].map(([icon, title, text]) => (
                  <div key={title} className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-2xl">{icon}</p>
                    <p className="mt-2 font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-xs text-slate-600 leading-5">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: '1. Jar Deposit Refund',
                items: [
                  'A refundable deposit of ₹150 (or admin-configured amount) is charged per 20L jar when you need a new jar.',
                  'Deposit is fully refunded to your AquaFlow wallet when the jar is returned in good condition.',
                  'You can request a jar return from your Jar Status dashboard page.',
                  'Our delivery team will collect the empty jar on your next delivery.',
                  'Wallet credit is processed immediately upon admin confirmation of return.',
                  'Jars that are lost, cracked, or damaged will not receive a deposit refund.',
                  'The deposit amount per jar is configurable by the business owner.',
                ],
              },
              {
                title: '2. Order Cancellation & Refund',
                items: [
                  'Orders can be requested for cancellation before they enter the "Preparing" stage.',
                  'Contact admin via the Messages section or WhatsApp to cancel an order.',
                  'If payment was made via UPI/QR and admin has not approved it, the payment will not be processed.',
                  'For COD orders, no payment is collected, so no refund is applicable.',
                  'Pay Later orders that are cancelled will be adjusted in your outstanding dues.',
                  'Partial refunds may apply if part of the order was already fulfilled.',
                ],
              },
              {
                title: '3. Quality Complaints',
                items: [
                  'If you receive damaged, incorrect, or poor-quality products, contact us within 24 hours of delivery.',
                  'Share photos of the issue via WhatsApp or the Messages section in your dashboard.',
                  'Admin will review and issue a replacement delivery or wallet credit as appropriate.',
                  'We do not offer refunds for subjective taste or preference issues.',
                ],
              },
              {
                title: '4. Payment Refund Process',
                items: [
                  'All refunds are issued as AquaFlow wallet credits, not direct bank transfers.',
                  'Wallet credits can be used for future orders on AquaFlow.',
                  'Bank refunds are not available at this time.',
                  'Refund timeline: Wallet credit is applied immediately after admin approval.',
                  'For disputes, contact support with your order number and payment UTR.',
                ],
              },
              {
                title: '5. Event Booking Refund',
                items: [
                  'Event enquiries that are not confirmed have no cancellation fee.',
                  'If an event booking is confirmed and then cancelled by the customer, advance payments may not be refunded.',
                  'Events cancelled by AquaFlow due to service unavailability will receive a full refund.',
                  'Advance payment terms are specified in the event quote sent by admin.',
                ],
              },
              {
                title: '6. Non-Refundable Items',
                items: [
                  'Delivery fees are non-refundable after the order is dispatched.',
                  'Jar deposits for damaged or lost jars are non-refundable.',
                  'Partially consumed products are not eligible for refund.',
                  'Orders cancelled after the "Out for Delivery" stage are non-refundable.',
                ],
              },
            ].map((sec) => (
              <div key={sec.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-5 text-xl font-black text-slate-950">{sec.title}</h2>
                <ul className="space-y-3">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-slate-600">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
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
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="font-black text-blue-900">Need Refund Help?</p>
                <p className="mt-2 text-sm text-blue-700">Contact our support team with your order number and issue details.</p>
                <Link to="/contact" className="mt-4 inline-flex rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800">Contact Support</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
