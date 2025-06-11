// src/components/dashboardStats/StatCardBase.tsx
import React from 'react';

interface StatCardBaseProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  unit?: string;
}

const StatCardBase: React.FC<StatCardBaseProps> = ({ title, value, icon, color, unit = '' }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
          {unit}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <i className={`fas ${icon} text-xl text-white`}></i>
      </div>
    </div>
  </div>
);

export default StatCardBase;
