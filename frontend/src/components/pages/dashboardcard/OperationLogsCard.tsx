import React from 'react';
import StatCardBase from './StatCardBase';

interface OperationLogsCardProps {
  value: number;
}

const OperationLogsCard: React.FC<OperationLogsCardProps> = ({ value }) => (
  <StatCardBase
    title="현재 운행중인 차량"
    value={value}
    icon="fa-car-side"
    color="bg-orange-500"
    unit="대"
  />
);

export default OperationLogsCard;
