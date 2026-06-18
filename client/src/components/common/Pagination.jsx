import React from 'react';
export default function Pagination({ page, pages, total, onPage }) {
  return (
    <div className="flex gap-2 justify-end text-sm items-center">
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="btn-secondary btn-sm">Prev</button>
      <span className="py-1 px-2">Page {page} of {pages || 1} {total !== undefined && `(${total} total)`}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="btn-secondary btn-sm">Next</button>
    </div>
  );
}
