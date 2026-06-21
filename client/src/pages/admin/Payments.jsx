import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  useApprovePaymentMutation,
  useGetAllPaymentsQuery,
  usePartialPaymentMutation,
  useRejectPaymentMutation,
} from "../../services/api";

const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "https://roapp.onrender.com";

const statusClass = {
  approved: "badge-green",
  rejected: "badge-red",
  partial: "badge-blue",
  pending: "badge-yellow",
  pending_verification: "badge-yellow",
};

const proofUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
};

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending_verification");
  const [review, setReview] = useState({
    id: null,
    action: "",
    amount: "",
    reason: "",
    adminNotes: "",
  });
  const { data, isLoading, refetch } = useGetAllPaymentsQuery({
    page,
    limit: 20,
    status,
  });
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();
  const [partialPayment] = usePartialPaymentMutation();

  const closeReview = () =>
    setReview({ id: null, action: "", amount: "", reason: "", adminNotes: "" });

  const submitReview = async () => {
    if (!review.id) return;
    try {
      if (review.action === "approve") {
        await approvePayment({
          id: review.id,
          adminNotes: review.adminNotes,
        }).unwrap();
        toast.success("Payment approved");
      }
      if (review.action === "reject") {
        await rejectPayment({
          id: review.id,
          reason: review.reason,
          adminNotes: review.adminNotes,
        }).unwrap();
        toast.success("Payment rejected");
      }
      if (review.action === "partial") {
        await partialPayment({
          id: review.id,
          approvedAmount: Number(review.amount),
          reason: review.reason,
          adminNotes: review.adminNotes,
        }).unwrap();
        toast.success("Partial payment approved");
      }
      closeReview();
    } catch (err) {
      toast.error(err?.data?.message || "Payment review failed");
    }
  };

  const currentPayment = data?.payments?.find(
    (payment) => payment._id === review.id,
  );

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Payment Verification</h1>
          <p>
            Manual UPI, QR, COD, and pay-later payment review. Nothing is
            auto-approved.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-48"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}>
            <option value="">All</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="pending">Legacy Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="partial">Partial</option>
          </select>
          <button onClick={refetch} className="btn-secondary btn-sm">
            Refresh
          </button>
        </div>
      </div>

      {review.id && (
        <div className="card border-blue-200 bg-blue-50/50 space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 capitalize">
                {review.action} Payment
              </h3>
              <p className="text-sm text-slate-500">
                Submitted Rs. {currentPayment?.amount || 0}
                {currentPayment?.expectedAmount
                  ? ` against expected Rs. ${currentPayment.expectedAmount}`
                  : ""}
              </p>
            </div>
            <button onClick={closeReview} className="btn-secondary btn-sm">
              Cancel
            </button>
          </div>

          {review.action === "partial" && (
            <div>
              <label className="label">Approved Amount</label>
              <input
                className="input max-w-xs"
                type="number"
                min="1"
                max={currentPayment?.amount || undefined}
                value={review.amount}
                onChange={(event) =>
                  setReview((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Amount admin verified"
              />
            </div>
          )}

          {review.action !== "approve" && (
            <div>
              <label className="label">
                {review.action === "reject" ? "Reason" : "Partial Note"}
              </label>
              <input
                className="input"
                value={review.reason}
                onChange={(event) =>
                  setReview((prev) => ({ ...prev, reason: event.target.value }))
                }
                placeholder="Visible audit reason"
              />
            </div>
          )}

          <div>
            <label className="label">Admin Notes</label>
            <input
              className="input"
              value={review.adminNotes}
              onChange={(event) =>
                setReview((prev) => ({
                  ...prev,
                  adminNotes: event.target.value,
                }))
              }
              placeholder="Internal verification notes"
            />
          </div>

          <button
            onClick={submitReview}
            className={
              review.action === "reject"
                ? "btn-danger btn-sm"
                : "btn-primary btn-sm"
            }>
            Confirm {review.action}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading payments...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Order</th>
                <th>Submitted</th>
                <th>Expected</th>
                <th>UTR</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.payments?.map((payment) => (
                <tr key={payment._id}>
                  <td className="text-xs">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="text-sm">
                    {payment.user?.name || "-"}
                    <br />
                    <span className="text-xs text-slate-400">
                      {payment.user?.mobile || payment.user?.email}
                    </span>
                  </td>
                  <td className="text-xs">
                    {payment.order?.orderNumber || "-"}
                    <br />
                    <span className="text-xs text-slate-400">
                      {payment.method}
                    </span>
                  </td>
                  <td className="font-medium">Rs. {payment.amount}</td>
                  <td className="text-sm">
                    Rs.{" "}
                    {payment.expectedAmount ||
                      payment.order?.total ||
                      payment.amount}
                  </td>
                  <td className="text-xs font-mono">
                    {payment.utrNumber || "-"}
                  </td>
                  <td>
                    {payment.screenshot ? (
                      <a
                        href={proofUrl(payment.screenshot)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-xs underline">
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${statusClass[payment.status] || "badge-gray"}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="text-xs max-w-xs">
                    <p className="truncate">{payment.notes || "-"}</p>
                    {(payment.adminNotes || payment.rejectionReason) && (
                      <p className="truncate text-slate-400">
                        {payment.adminNotes || payment.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td>
                    {["pending", "pending_verification"].includes(
                      payment.status,
                    ) && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() =>
                            setReview({
                              id: payment._id,
                              action: "approve",
                              amount: "",
                              reason: "",
                              adminNotes: "",
                            })
                          }
                          className="btn-success btn-sm">
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setReview({
                              id: payment._id,
                              action: "partial",
                              amount: "",
                              reason: "",
                              adminNotes: "",
                            })
                          }
                          className="btn-secondary btn-sm">
                          Partial
                        </button>
                        <button
                          onClick={() =>
                            setReview({
                              id: payment._id,
                              action: "reject",
                              amount: "",
                              reason: "",
                              adminNotes: "",
                            })
                          }
                          className="btn-danger btn-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!data?.payments?.length && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 justify-end text-sm text-slate-600">
        <button
          disabled={page === 1}
          onClick={() => setPage((value) => value - 1)}
          className="btn-secondary btn-sm">
          Prev
        </button>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium">
          Page {page} of {data?.pages || 1}
        </span>
        <button
          disabled={page >= (data?.pages || 1)}
          onClick={() => setPage((value) => value + 1)}
          className="btn-secondary btn-sm">
          Next
        </button>
      </div>
    </div>
  );
}
