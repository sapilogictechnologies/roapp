import React from 'react';
const colorMap = {
  placed:'blue', payment_pending:'yellow', confirmed:'blue', preparing:'yellow',
  out_for_delivery:'yellow', delivered:'green', cancelled:'red', pending:'yellow',
  approved:'green', rejected:'red', partial:'blue', paid:'green', unpaid:'red',
  active:'green', paused:'yellow',
};
export default function StatusBadge({ status }) {
  const c = colorMap[status] || 'gray';
  return <span className={`badge badge-${c}`}>{status}</span>;
}
