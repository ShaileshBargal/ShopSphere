import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from 'lucide-react';

const OrderTimeline = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800">
        <XCircle size={22} className="text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs text-rose-600">This order has been cancelled and will not be fulfilled.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Processing', label: 'Processing', icon: PackageCheck },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

        {/* Active connector line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-teal-100 scale-110' : ''}`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] ${
                  isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
