import React from 'react';
import StatCardBase from './StatCardBase';

interface OperationLogsCardProps {
  value: number;
}

const OperationLogsCard: React.FC<OperationLogsCardProps> = ({ value }) => (
  <StatCardBase
    title="운행 일지"
    value={value}
    icon="fa-book"
    color="bg-orange-500"
    unit="건"
  />
);

export default OperationLogsCard;
