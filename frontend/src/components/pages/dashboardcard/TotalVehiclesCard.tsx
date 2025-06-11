import React from 'react';
import StatCardBase from './StatCardBase';

interface TotalVehiclesCardProps {
  value: number;
}

const TotalVehiclesCard: React.FC<TotalVehiclesCardProps> = ({ value }) => (
  <StatCardBase
    title="전체 차량"
    value={value}
    icon="fa-car"
    color="bg-blue-500"
    unit="대"
  />
);

export default TotalVehiclesCard;
