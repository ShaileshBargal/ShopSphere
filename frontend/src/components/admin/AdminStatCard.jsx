import React from 'react';

const AdminStatCard = ({ title, value, icon: Icon, color = 'teal', subtitle }) => {
  const colorMap = {
    teal: 'bg-teal-500/10 text-teal-600 border-teal-200',
    blue: 'bg-sky-500/10 text-sky-600 border-sky-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-200',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            colorMap[color] || colorMap.teal
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
