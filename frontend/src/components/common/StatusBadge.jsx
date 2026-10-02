import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
      case 'Processing':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {status || 'Pending'}
    </span>
  );
};

export default StatusBadge;
