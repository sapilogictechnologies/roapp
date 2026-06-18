import React, { useState } from 'react';
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

const faqs = [
  {
    q: 'I paid via UPI but my order still shows pending. What should I do?',
    a: 'Upload your payment screenshot and UTR number from the "Submit Payment" page in your customer dashboard. Admin manually verifies all UPI payments. Once verified, your order status will update automatically.',
  },
  {
    q: 'How long does payment verification take?',
    a: 'Admin manually reviews payment proofs. It usually takes a few minutes to a few hours. You will receive a notification once your payment is approved or if there is an issue.',
  },
  {
    q: 'I uploaded the wrong screenshot. Can I resubmit?',
    a: 'Yes. Go to My Payments in your dashboard and submit a new payment proof for the same order. Contact admin via Messages if you need help.',
  },
  {
    q: "I don't have a UPI app. Can I pay by cash?",
    a: 'Yes. Select "Cash on Delivery" at checkout. Our delivery person will collect cash at the time of delivery. Admin then marks the payment as received.',
  },
  {
    q: 'What is Pay Later / Credit mode?',
    a: 'Pay Later is a feature that admin can enable for trusted customers. It allows you to place orders and pay at the end of the month. Your outstanding dues are tracked in your dashboard.',
  },
  {
    q: 'My payment was marked as Partial. What does that mean?',
    a: 'Admin marked your payment as partially verified. The approved amount is lower than what you submitted. This may happen if the uploaded amount did not match the order total. Contact admin for clarification.',
  },
  {
    q: 'My payment was rejected. What should I do?',
    a: 'If admin rejected your payment, check the rejection reason in My Payments. Re-upload the correct screenshot or contact admin via WhatsApp or Messages.',
  },
  {
    q: 'Can I pay using Google Pay, PhonePe, or Paytm?',
    a: 'Yes. Any UPI-based app (GPay, PhonePe, Paytm, BHIM, etc.) works. After paying, upload the payment screenshot and enter the UTR/transaction ID in the payment form.',
  },
];

export default function PaymentHelp() {
  const [open, setOpen] = useState(null);

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="page-container relative py-16 md:py-24">
          <p className="section-eyebrow">Support</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Payment Help</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            How to pay, submit proof, track verification, and resolve payment issues.
          </p>
          <p className="mt-3 text-sm text-slate-400">Last updated: January 2026</p>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">

            {/* Payment methods */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: '📱', title: 'UPI / QR', desc: 'Pay to UPI ID or scan QR code. Upload screenshot + UTR after payment.', badge: 'Most Used', color: 'blue' },
                { icon: '💵', title: 'Cash on Delivery', desc: 'Pay cash when the delivery person arrives. Admin marks it received.', badge: 'No Proof', color: 'emerald' },
                { icon: '📋', title: 'Pay Later', desc: 'Admin-enabled for trusted customers. Pay dues at end of month.', badge: 'By Request', color: 'amber' },
              ].map((m) => (
                <div key={m.title} className={`rounded-3xl border p-5 shadow-sm ${m.color === 'blue' ? 'border-blue-200 bg-blue-50' : m.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  <p className="text-3xl">{m.icon}</p>
                  <p className={`mt-3 font-black ${m.color === 'blue' ? 'text-blue-900' : m.color === 'emerald' ? 'text-emerald-900' : 'text-amber-900'}`}>{m.title}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${m.color === 'blue' ? 'bg-blue-200 text-blue-800' : m.color === 'emerald' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{m.badge}</span>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Step-by-step UPI flow */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xl font-black text-slate-950">How to Pay via UPI — Step by Step</h2>
              <div className="space-y-4">
                {[
                  ['1', 'Place your order', 'Add products to cart, complete checkout, and select UPI as payment method.'],
                  ['2', 'Open UPI app or scan QR', 'Scan the QR code shown at checkout or copy the UPI ID and open your UPI app.'],
                  ['3', 'Pay the exact amount', 'Transfer the exact order total shown. Include delivery fee and jar deposit.'],
                  ['4', 'Copy UTR number', 'After payment, copy the 12-digit UTR (transaction reference) from your UPI app.'],
                  ['5', 'Upload screenshot', 'Take a screenshot of the payment success screen from your UPI app.'],
                  ['6', 'Submit via app', 'Go to My Account → Submit Payment. Upload screenshot and enter UTR number.'],
                  ['7', 'Wait for admin', 'Admin manually verifies and approves your payment. You will be notified.'],
                ].map(([num, title, text]) => (
                  <div key={num} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-sm font-black text-white">{num}</div>
                    <div>
                      <p className="font-black text-slate-950">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important notes */}
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-red-900">Important Payment Rules</h2>
              <ul className="space-y-3">
                {[
                  'No payment is auto-approved. All payments require manual admin verification.',
                  'Always upload the correct screenshot — wrong screenshots will be rejected.',
                  'UTR number is required for UPI payments. Find it in your UPI app transaction history.',
                  'Do not close the payment page until you have submitted proof.',
                  'For COD orders, pay the exact cash amount to the delivery person.',
                  'Pay Later is only available if admin has enabled it for your account.',
                  'Wallet balance (from jar returns) can be used for future orders.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-7 text-red-800">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xl font-black text-slate-950">Payment FAQ</h2>
              <div className="space-y-3">
                {faqs.map((item, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOpen(open === index ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-slate-900 text-sm">{item.q}</span>
                      <span className="text-lg font-black text-blue-700 shrink-0">{open === index ? '−' : '+'}</span>
                    </button>
                    {open === index && (
                      <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-7 text-slate-600">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit payment CTA */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-600 p-8 text-white shadow-2xl">
              <h2 className="text-2xl font-black">Need to Submit Payment Proof?</h2>
              <p className="mt-3 text-base leading-7 text-blue-50">
                Upload your UPI screenshot and UTR number from the Submit Payment page in your account.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/payments/submit" className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-black text-blue-700 hover:bg-blue-50">Submit Payment →</Link>
                <Link to="/contact" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-center text-sm font-black text-white hover:bg-white/20">Contact Support</Link>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="sticky top-24 space-y-4">
              <PolicyNav />
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="font-black text-blue-900">Payment Issue?</p>
                <p className="mt-2 text-sm text-blue-700">Contact support with your order number and payment UTR for quick resolution.</p>
                <Link to="/contact" className="mt-4 inline-flex rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800">Get Help →</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
