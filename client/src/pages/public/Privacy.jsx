import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'Personal details: Name, phone number, email address during registration.',
      'Delivery address: Full address, area, pincode, and city for order delivery.',
      'Order data: Products ordered, quantity, delivery slots, and payment method.',
      'Payment proof: UPI screenshot and UTR number for manual verification.',
      'Jar deposit records: Number of jars delivered, returned, and deposit balance.',
      'Event booking details: Event type, venue, guest count, and water requirement.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To process and deliver your water orders to the correct address.',
      'To verify payments manually and update payment status.',
      'To manage jar deposit ledger and track returns.',
      'To send order updates, delivery notifications, and admin messages.',
      'To respond to event enquiries and send custom quotes.',
      'To generate bills and maintain account records.',
    ],
  },
  {
    title: '3. Data Storage & Security',
    content: [
      'All data is stored on secure servers with encrypted connections.',
      'Passwords are hashed using bcrypt and never stored in plain text.',
      'Payment screenshots are stored on our server and accessible only to admin.',
      'JWT authentication ensures only verified users access account data.',
      'We do not store credit card or bank account numbers.',
    ],
  },
  {
    title: '4. Data Sharing',
    content: [
      'We do not sell or share your personal data with third parties.',
      'Delivery details may be shared with our delivery team for order fulfillment.',
      'Admin staff can view orders, payments, and jar records for business operations.',
      'Data may be disclosed if required by law or government authority.',
    ],
  },
  {
    title: '5. Cookies & Local Storage',
    content: [
      'We use localStorage to store your login session token securely.',
      'Cart data is saved in browser localStorage for session continuity.',
      'No third-party tracking cookies are used.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'You can view and update your profile information from your dashboard.',
      'You can add, edit, or delete delivery addresses anytime.',
      'To request data deletion, contact us via WhatsApp or email.',
      'You can unsubscribe from promotional messages by contacting support.',
    ],
  },
  {
    title: '7. Contact for Privacy',
    content: [
      'For any privacy-related concerns, contact our support team.',
      'Email: support@aquaflow.in',
      'Phone / WhatsApp: As listed on the Contact page.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="page-container relative py-16 md:py-24">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Privacy Policy</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            How AquaFlow collects, uses, and protects your personal information.
          </p>
          <p className="mt-3 text-sm text-slate-400">Last updated: January 2026</p>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-8">
            {sections.map((sec) => (
              <div key={sec.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-5 text-xl font-black text-slate-950">{sec.title}</h2>
                <ul className="space-y-3">
                  {sec.content.map((item, i) => (
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
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="font-black text-blue-900">Questions?</p>
                <p className="mt-2 text-sm text-blue-700">Contact our support team for any privacy-related concerns.</p>
                <Link to="/contact" className="mt-4 inline-flex rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800">Contact Us</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
