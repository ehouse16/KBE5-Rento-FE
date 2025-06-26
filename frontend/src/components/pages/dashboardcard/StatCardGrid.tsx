import React from 'react';
import TotalVehiclesCard from './TotalVehiclesCard';
import ActiveReservationsCard from './ActiveReservationsCard';
import TotalDriversCard from './TotalDriversCard';
import OperationLogsCard from './OperationLogsCard';

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
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <TotalVehiclesCard value={totalVehicles} />
    <TotalDriversCard value={totalDrivers} />
    <ActiveReservationsCard value={activeReservations} />
    <OperationLogsCard value={operationLogs} />
  </div>
);

export default StatCardGrid;
