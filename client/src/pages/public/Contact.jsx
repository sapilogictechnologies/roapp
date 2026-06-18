import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const contactCards = [
  {
    icon: '📞',
    title: 'Call Support',
    value: '+91 98765 43210',
    text: 'For urgent water delivery, billing, or event booking help.',
    href: 'tel:9876543210',
    action: 'Call Now',
  },
  {
    icon: '💬',
    title: 'WhatsApp',
    value: '+91 98765 43210',
    text: 'Send address, payment proof, event details, or jar queries.',
    href: 'https://wa.me/919876543210',
    action: 'Open WhatsApp',
  },
  {
    icon: '✉️',
    title: 'Email',
    value: 'support@aquaflow.in',
    text: 'For business enquiries, invoices, and account support.',
    href: 'mailto:support@aquaflow.in',
    action: 'Send Email',
  },
];

const helpTopics = [
  ['🛒', 'Order Help', 'Delivery status, wrong item, reorder, or cancellation support.'],
  ['💳', 'Payment Help', 'UPI/QR payment proof, UTR issues, pending verification.'],
  ['🫙', 'Jar Support', 'Deposit, pending empty jars, returns, lost/damaged jar updates.'],
  ['🎉', 'Event Booking', 'Wedding, party, conference, and bulk water quote support.'],
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill name, phone, and message');
      return;
    }

    toast.success('Message prepared. Please send through WhatsApp or call support.');

    const text = encodeURIComponent(
      `Hello AquaFlow,\n\nName: ${form.name}\nPhone: ${form.phone}\nSubject: ${
        form.subject || 'Support'
      }\nMessage: ${form.message}`
    );

    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');

    setForm({
      name: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="page-container relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">Contact Support</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              We’re Here to Help
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
              Need help with orders, payments, jars, service area, or event water supply?
              Contact AquaFlow support anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="page-container -mt-10 relative z-10">
        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-cyan-100"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-3xl">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-1 font-bold text-blue-700">{item.value}</p>
              <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">{item.text}</p>
              <span className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                {item.action}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="page-container py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <p className="section-eyebrow">Send Enquiry</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Write to AquaFlow
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Fill this form and we’ll open WhatsApp with your message ready to send.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input h-14 rounded-2xl"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="label">Phone *</label>
                  <input
                    className="input h-14 rounded-2xl"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="label">Subject</label>
                <select
                  className="input h-14 rounded-2xl"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                >
                  <option value="">Select support topic</option>
                  <option value="Order Help">Order Help</option>
                  <option value="Payment Help">Payment Help</option>
                  <option value="Jar Return / Deposit">Jar Return / Deposit</option>
                  <option value="Service Area">Service Area</option>
                  <option value="Event Booking">Event Booking</option>
                  <option value="Business Enquiry">Business Enquiry</option>
                </select>
              </div>

              <div>
                <label className="label">Message *</label>
                <textarea
                  className="input min-h-36 rounded-2xl"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="Write your issue, address, order detail, UTR, or event requirement..."
                />
              </div>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-base font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800"
              >
                Send via WhatsApp
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-cyan-600 p-7 text-white shadow-2xl shadow-blue-100">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-4xl">
                ⏱
              </div>
              <h3 className="text-2xl font-black">Support Hours</h3>
              <p className="mt-3 text-base leading-7 text-blue-50">
                Monday to Sunday, 7:00 AM to 10:00 PM. For emergency bulk/event water,
                contact by phone or WhatsApp.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-100">
                    Regular Orders
                  </p>
                  <p className="mt-1 font-black text-white">7:00 AM – 10:00 PM</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-100">
                    Event Support
                  </p>
                  <p className="mt-1 font-black text-white">Advance booking recommended</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Quick Help Topics</h3>

              <div className="mt-5 space-y-4">
                {helpTopics.map(([icon, title, text]) => (
                  <div key={title} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      {icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/event-booking"
              className="flex rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 transition hover:bg-cyan-100"
            >
              <div>
                <p className="text-lg font-black text-cyan-900">Need Event Water Supply?</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-cyan-700">
                  Submit event details and receive quote from admin.
                </p>
              </div>
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="section-eyebrow">Location</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Service Area & Delivery Office
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Delivery depends on admin-managed service areas and pincodes. Check your pincode
                before ordering.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/service-area"
                  className="rounded-2xl bg-blue-700 px-6 py-4 text-center text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-800"
                >
                  Check Service Area
                </Link>
                <Link
                  to="/products"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-black text-slate-900 hover:bg-blue-50 hover:text-blue-700"
                >
                  View Products
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
              <div className="flex h-96 items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50">
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-4xl shadow-xl">
                    🗺️
                  </div>
                  <p className="text-xl font-black text-slate-950">Map Placeholder</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Add Google Map / OpenStreetMap iframe here later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
