import React from 'react';
import StatCardBase from './StatCardBase';

interface ActiveReservationsCardProps {
  value: number;
}

const ActiveReservationsCard: React.FC<ActiveReservationsCardProps> = ({ value }) => (
  <StatCardBase
    title="진행중인 예약"
    value={value}
    icon="fa-calendar-check"
    color="bg-green-500"
    unit="건"
  />
);

export default ActiveReservationsCard;
