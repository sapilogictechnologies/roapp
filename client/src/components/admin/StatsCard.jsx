import React from 'react';
import { Link } from 'react-router-dom';
export default function StatsCard({ label, value, to, color = 'text-blue-700' }) {
  const content = <div className="card text-center hover:shadow-md transition-shadow"><div className={`text-2xl font-bold ${color}`}>{value ?? '-'}</div><div className="text-xs text-gray-500 mt-1">{label}</div></div>;
  return to ? <Link to={to}>{content}</Link> : content;
}
