import React from 'react';

interface Props {
  onClick: () => void;
}
const VehicleAddButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium !rounded-button"
  >
    + 차량 등록
  </button>
);

export default VehicleAddButton; 