import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setCredentials } from "../../features/auth/authSlice";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://roapp.onrender.com/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success(`Welcome, ${data.user.name}!`);
      navigate("/customer/dashboard", { replace: true });
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white">
                <path d="M12 2C10 5 5 10 5 15a7 7 0 0014 0c0-5-5-10-7-13z" />
              </svg>
            </div>
          </Link>
          <h1 className="font-bold text-2xl text-slate-800 mb-1">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm">Join AquaFlow today</p>
        </div>
        <div className="card shadow-md">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm mb-4 bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-3">
            {[
              { k: "name", l: "Full Name", t: "text", p: "Ravi Kumar" },
              { k: "email", l: "Email", t: "email", p: "ravi@email.com" },
              { k: "mobile", l: "Phone", t: "tel", p: "9876543210" },
              {
                k: "password",
                l: "Password",
                t: "password",
                p: "Min 6 characters",
              },
            ].map((f) => (
              <div key={f.k}>
                <label className="label">{f.l}</label>
                <input
                  className="input"
                  type={f.t}
                  value={form[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  placeholder={f.p}
                  required
                  minLength={f.k === "password" ? 6 : undefined}
                />
              </div>
            ))}
            <button
              className="w-full btn-primary py-3 justify-center mt-1"
              type="submit"
              disabled={loading}>
              {loading ? "Creating…" : "Create Account →"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
