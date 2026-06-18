import React from 'react';
export default function Loader({ text = 'Loading...' }) {
  return <div className="p-8 text-center text-gray-500">{text}</div>;
}
