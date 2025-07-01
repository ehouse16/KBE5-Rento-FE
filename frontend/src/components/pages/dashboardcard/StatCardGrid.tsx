import React from 'react';
import TotalVehiclesCard from './TotalVehiclesCard';
import ActiveReservationsCard from './ActiveReservationsCard';
import TotalDriversCard from './TotalDriversCard';
import OperationLogsCard from './OperationLogsCard';
import { useNavigate } from 'react-router-dom';

interface StatCardGridProps {
  totalVehicles: number;
  activeReservations: number;
  totalDrivers: number;
  operationLogs: number;
}

const StatCardGrid: React.FC<StatCardGridProps> = ({
  totalVehicles,
  totalDrivers,
  activeReservations,
  operationLogs,
}) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div onClick={() => navigate('/vehicles')} className="cursor-pointer hover:shadow-md transition">
        <TotalVehiclesCard value={totalVehicles} />
      </div>
      <div onClick={() => navigate('/users')} className="cursor-pointer hover:shadow-md transition">
        <TotalDriversCard value={totalDrivers} />
      </div>
      <div onClick={() => navigate('/drives')} className="cursor-pointer hover:shadow-md transition">
        <ActiveReservationsCard value={activeReservations} />
      </div>
      <div onClick={() => navigate('/realtime-event')} className="cursor-pointer hover:shadow-md transition">
        <OperationLogsCard value={operationLogs} />
      </div>
    </div>
  );
};

export default StatCardGrid;
