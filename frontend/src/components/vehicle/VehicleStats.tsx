import React from 'react';

interface Vehicle {
  vehicleNumber: string;
  brand: string;
  modelName: string;
  totalDistanceKm?: number;
  status: 'available' | 'in-use';
}

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

const VehicleStats: React.FC<VehicleStatsProps> = ({ vehicles }) => {
  const total = vehicles.length;
  const available = vehicles.filter((v: Vehicle) => v.status === 'available').length;
  const inUse = vehicles.filter((v: Vehicle) => v.status === 'in-use').length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">총 차량</p>
            <h3 className="text-3xl font-bold mt-1">{total}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <i className="fas fa-car text-green-500"></i>
          </div>
        </div>
        <div className="mt-4 text-sm text-green-500">
          <i className="fas fa-arrow-up mr-1"></i>
          <span>지난 달 대비 2대 증가</span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">사용 가능 차량</p>
            <h3 className="text-3xl font-bold mt-1">{available}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <i className="fas fa-check-circle text-blue-500"></i>
          </div>
        </div>
        <div className="mt-4 text-sm text-blue-500">
          <span>
            전체의 {total ? Math.round((available / total) * 100) : 0}% 사용 가능
          </span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">사용중인 차량</p>
            <h3 className="text-3xl font-bold mt-1">{inUse}</h3>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <i className="fas fa-route text-orange-500"></i>
          </div>
        </div>
        <div className="mt-4 text-sm text-orange-500">
          <span>
            전체의 {total ? Math.round((inUse / total) * 100) : 0}% 사용중
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehicleStats;
 