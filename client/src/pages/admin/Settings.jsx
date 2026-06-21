import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../services/api";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "https://roapp.onrender.com";

function Section({ title, icon, children }) {
  return (
    <div className="card mb-5">
      <h3 className="font-display font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
function Toggle({ label, desc, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-0"
      style={{ borderColor: "rgba(0,0,0,0.08)" }}>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0`}
        style={{
          background: checked
            ? "linear-gradient(135deg,#14b8a6,#0891b2)"
            : "#f1f5f9",
        }}>
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checked ? "left-6" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const [form, setForm] = useState({});
  const qrRef = useRef();
  const logoRef = useRef();
  const [uploadingQR, setUploadingQR] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await updateSettings(form).unwrap();
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleUpload = async (file, type) => {
    if (!file) return;
    const isQR = type === "qr";
    if (isQR) setUploadingQR(true);
    else setUploadingLogo(true);
    const fd = new FormData();
    fd.append(isQR ? "qr" : "logo", file);
    try {
      const token = localStorage.getItem("ro_token");
      const res = await fetch(
        `${API_BASE}/api/settings/upload-${isQR ? "qr" : "logo"}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );
      const data = await res.json();
      if (isQR) set("qrImage", data.qrImage);
      else set("logoImage", data.logoImage);
      toast.success(`${isQR ? "QR" : "Logo"} uploaded!`);
    } catch {
      toast.error("Upload failed");
    }
    if (isQR) setUploadingQR(false);
    else setUploadingLogo(false);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="app-page max-w-3xl animate-fade-in">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>
            Manage business details, payment settings, delivery rules, and
            system options.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      <Section title="Business Details" icon="🏢">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Business Name">
            <input
              className="input"
              value={form.businessName || ""}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={form.phone || ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className="input"
              value={form.whatsapp || ""}
              onChange={(e) => set("whatsapp", e.target.value)}
            />
          </Field>
          <Field label="Working Hours">
            <input
              className="input"
              value={form.workingHours || ""}
              onChange={(e) => set("workingHours", e.target.value)}
              placeholder="9:00 AM - 9:00 PM"
            />
          </Field>
        </div>
        <Field label="Address">
          <textarea
            className="input"
            rows={2}
            value={form.address || ""}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        <Field label="Announcement Banner">
          <input
            className="input"
            value={form.announcementBanner || ""}
            onChange={(e) => set("announcementBanner", e.target.value)}
            placeholder="e.g. Festival offer! 10% off today"
          />
        </Field>
        <Field label="Holiday Notice">
          <input
            className="input"
            value={form.holidayNotice || ""}
            onChange={(e) => set("holidayNotice", e.target.value)}
            placeholder="Closed on Sunday"
          />
        </Field>
      </Section>

      <Section title="Logo" icon="🖼️">
        <div className="flex items-center gap-4">
          {form.logoImage && (
            <img
              src={form.logoImage}
              alt="Logo"
              className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border border-slate-200"
            />
          )}
          <div>
            <button
              onClick={() => logoRef.current?.click()}
              className="btn-secondary btn-sm"
              disabled={uploadingLogo}>
              {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </button>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0], "logo")}
            />
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG · Recommended 200×200px
            </p>
          </div>
        </div>
      </Section>

      <Section title="UPI / Payment" icon="💳">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Field label="UPI ID">
            <input
              className="input font-mono"
              value={form.upiId || ""}
              onChange={(e) => set("upiId", e.target.value)}
              placeholder="yourname@bankname"
            />
          </Field>
          <Field label="Jar Deposit Amount (₹)">
            <input
              className="input"
              type="number"
              min={0}
              value={form.jarDepositAmount || 150}
              onChange={(e) => set("jarDepositAmount", Number(e.target.value))}
              placeholder="150"
            />
          </Field>
        </div>
        <Field label="Payment Instructions">
          <textarea
            className="input"
            rows={2}
            value={form.paymentInstructions || ""}
            onChange={(e) => set("paymentInstructions", e.target.value)}
            placeholder="Scan QR or pay to UPI ID. Upload screenshot after payment."
          />
        </Field>
        {/* QR Upload */}
        <div
          className="flex items-start gap-4 p-4 rounded-2xl"
          style={{
            background: "#f1f5f9",
            border: "1px solid var(--border-subtle)",
          }}>
          {form.qrImage ? (
            <img
              src={form.qrImage}
              alt="QR"
              className="w-28 h-28 rounded-xl object-contain bg-white p-1 border border-slate-700 shrink-0"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "#ffffff",
                border: "2px dashed rgba(20,184,166,0.25)",
              }}>
              <span className="text-3xl">📱</span>
            </div>
          )}
          <div>
            <p className="font-medium text-slate-800 text-sm mb-1">
              QR Code Image
            </p>
            <p className="text-xs text-slate-500 mb-3">
              This appears in the payment screen for customers to scan.
            </p>
            <button
              onClick={() => qrRef.current?.click()}
              className="btn-secondary btn-sm"
              disabled={uploadingQR}>
              {uploadingQR ? "Uploading…" : "Upload QR Image"}
            </button>
            <input
              ref={qrRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0], "qr")}
            />
            {form.upiId && (
              <p className="text-xs text-teal-400 mt-2 font-mono">
                UPI: {form.upiId}
              </p>
            )}
          </div>
        </div>

        <div
          className="mt-4 space-y-0 rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)" }}>
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Payment Methods
            </p>
          </div>
          <div className="px-4">
            <Toggle
              label="Cash on Delivery"
              desc="Allow customers to pay cash on delivery"
              checked={form.codEnabled !== false}
              onChange={() => set("codEnabled", !form.codEnabled)}
            />
            <Toggle
              label="Pay Later"
              desc="Allow trusted customers to pay at end of month"
              checked={!!form.payLaterEnabled}
              onChange={() => set("payLaterEnabled", !form.payLaterEnabled)}
            />
          </div>
        </div>
      </Section>

      <Section title="Delivery" icon="🚚">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Max Delivery Distance (km)">
            <input
              className="input"
              type="number"
              value={form.maxDeliveryDistance || 10}
              onChange={(e) =>
                set("maxDeliveryDistance", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Traffic Buffer (min)">
            <input
              className="input"
              type="number"
              value={form.trafficBufferMinutes || 0}
              onChange={(e) =>
                set("trafficBufferMinutes", Number(e.target.value))
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="System" icon="⚙️">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)" }}>
          <div className="px-4">
            <Toggle
              label="Maintenance Mode"
              desc="Show maintenance message to all visitors"
              checked={!!form.maintenanceMode}
              onChange={() => set("maintenanceMode", !form.maintenanceMode)}
            />
          </div>
        </div>
      </Section>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary btn-lg">
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
