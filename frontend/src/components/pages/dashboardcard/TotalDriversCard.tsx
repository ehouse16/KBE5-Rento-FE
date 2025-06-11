import React from 'react';
import StatCardBase from './StatCardBase';

interface TotalDriversCardProps {
  value: number;
}

const TotalDriversCard: React.FC<TotalDriversCardProps> = ({ value }) => (
  <StatCardBase
    title="등록된 운전자"
    value={value}
    icon="fa-users"
    color="bg-purple-500"
    unit="명"
  />
);

export default TotalDriversCard;
