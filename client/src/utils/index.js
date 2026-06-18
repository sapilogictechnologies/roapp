export const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;
export const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';
export const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-IN') : '-';
export const statusColor = (status) => {
  const map = {
    placed: 'blue', payment_pending: 'yellow', confirmed: 'blue',
    preparing: 'yellow', out_for_delivery: 'yellow', delivered: 'green',
    cancelled: 'red', pending: 'yellow', approved: 'green', rejected: 'red',
    partial: 'blue', paid: 'green', unpaid: 'red', active: 'green', paused: 'yellow',
  };
  return map[status] || 'gray';
};
