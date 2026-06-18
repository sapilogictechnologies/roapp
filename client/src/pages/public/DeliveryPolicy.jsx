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

export default function DeliveryPolicy() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="page-container relative py-16 md:py-24">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Delivery Policy</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Everything you need to know about delivery areas, fees, slots, and ETAs.
          </p>
          <p className="mt-3 text-sm text-slate-400">Last updated: January 2026</p>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">

            <div className="grid gap-4 sm:grid-cols-4">
              {[
                ['📍', 'Service Area', 'Pincode-based delivery zones with admin-managed areas'],
                ['🚚', 'Same-Day', 'Orders placed before cutoff delivered same day'],
                ['⏱', 'ETA', 'Delivery time estimated per service zone'],
                ['💰', 'Fees', 'Delivery fee varies by zone and minimum order'],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-3xl">{icon}</p>
                  <p className="mt-3 font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </div>

            {[
              {
                title: '1. Delivery Service Area',
                items: [
                  'AquaFlow delivers only within admin-configured service areas and pincodes.',
                  'You can check your delivery availability by entering your pincode on the Home page or Service Area page.',
                  'Delivery fee and minimum order amount are set per service zone.',
                  'Pincodes outside the configured service areas will not be accepted at checkout.',
                  'Service areas may change periodically. Check the Service Area page for current availability.',
                  'New pincodes can be requested by contacting us. Admin reviews and enables them.',
                ],
              },
              {
                title: '2. Delivery Fees',
                items: [
                  'Delivery fees are determined by your pincode / service zone, not by order value.',
                  'Each service area has a fixed delivery fee configured by admin.',
                  'Minimum order amount per area must be met before checkout is allowed.',
                  'Delivery fee is shown during address verification in the checkout flow.',
                  'Delivery fee is non-refundable after the order is dispatched.',
                  'Events and bulk orders may have custom delivery charges quoted separately.',
                ],
              },
              {
                title: '3. Delivery Slots',
                items: [
                  'Delivery slots are configured by admin (Morning, Afternoon, Evening, Night, ASAP).',
                  'You can select a preferred slot at checkout. Slots are subject to availability.',
                  'Maximum orders per slot may be limited. If a slot is full, select another.',
                  'Admin may disable specific slots on holidays or high-demand periods.',
                  'Cutoff times apply — orders after cutoff time will be scheduled for next available slot.',
                  'You can select delivery date (Today, Tomorrow, or upcoming days) at checkout.',
                ],
              },
              {
                title: '4. Delivery ETA',
                items: [
                  'Estimated delivery time is shown per service zone at checkout.',
                  'ETA is calculated based on distance, traffic buffer, and selected slot.',
                  'ETA is an estimate, not a guaranteed delivery time.',
                  'For urgent deliveries, contact us via WhatsApp before placing order.',
                  'During festivals, weekends, or high-demand periods, ETA may be higher.',
                ],
              },
              {
                title: '5. Delivery Process',
                items: [
                  'Once your order is confirmed, it enters the preparing → packed → out for delivery flow.',
                  'You will receive notifications at each order status update.',
                  'Delivery is done to the address specified during checkout.',
                  'Please ensure someone is available at the address during the selected slot.',
                  'If no one is available at delivery, contact us to reschedule.',
                  'Empty jar exchange happens at the time of delivery if you selected that option at checkout.',
                ],
              },
              {
                title: '6. Failed Deliveries',
                items: [
                  'If delivery fails due to wrong address or no one available, admin will contact you.',
                  'Failed deliveries may be rescheduled for the next slot at no extra charge (first time).',
                  'Repeated failed deliveries due to customer unavailability may incur a re-delivery charge.',
                  'Perishable items cannot be re-delivered. Contact support immediately.',
                ],
              },
              {
                title: '7. Event & Bulk Deliveries',
                items: [
                  'Event water supply is handled separately via the Event Booking page.',
                  'Bulk orders require advance booking and custom delivery arrangement.',
                  'Event delivery timing and special requirements are specified in the admin quote.',
                  'Event cancellation policies are covered in the Refund Policy.',
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
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
                <p className="font-black text-cyan-900">Check Your Area</p>
                <p className="mt-2 text-sm text-cyan-700">Enter your pincode to see delivery availability, fees, and ETA.</p>
                <Link to="/service-area" className="mt-4 inline-flex rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800">Service Area →</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
