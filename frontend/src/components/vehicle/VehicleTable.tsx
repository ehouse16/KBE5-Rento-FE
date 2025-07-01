import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleEditModal from './VehicleEditModal';
import axiosInstance from '../../utils/axios';

interface Vehicle {
  id?: number;
  vehicleNumber: string;
  brand: string;
  modelName: string;
  totalDistanceKm?: number;
  batteryVoltage?: string;
  status: 'available' | 'in-use' | 'READY' | 'RESERVATION';
}

interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig) => void;
  fetchVehicles: () => void;
  fetchAllVehicles: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const VehicleTable: React.FC<VehicleTableProps> = ({ vehicles, sortConfig, setSortConfig, fetchVehicles, fetchAllVehicles, currentPage, setCurrentPage, itemsPerPage }) => {
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    if (vehicle.id) {
      navigate(`/vehicles/${vehicle.id}`);
    }
  };

  const handleDelete = async (vehicleId?: number) => {
    if (!vehicleId) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await axiosInstance.delete(`/api/vehicles/${vehicleId}`);
      if (res.status === 200 || res.status === 204) {
        alert('삭제되었습니다.');
        if (vehicles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchVehicles();
          fetchAllVehicles();
        }
      } else if (res.data && res.data.message && res.data.message.includes('해당 차량에 운행 예약/실시간 운행이 존재합니다')) {
        alert('해당 차량에 운행 예약/실시간 운행이 존재합니다.');
        return;
      } else {
        alert('삭제 실패');
      }
    } catch (error: any) {
      if (error?.response?.data?.message && error.response.data.message.includes('해당 차량에 운행 예약/실시간 운행이 존재합니다')) {
        alert('해당 차량에 운행 예약/실시간 운행이 존재합니다.');
        return;
      }
      alert('삭제 실패');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('vehicleNumber')}>
                  <div className="flex items-center">
                    <span>차량 번호</span>
                    {sortConfig?.key === 'vehicleNumber' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('brand')}>
                  <div className="flex items-center">
                    <span>브랜드</span>
                    {sortConfig?.key === 'brand' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('modelName')}>
                  <div className="flex items-center">
                    <span>모델명</span>
                    {sortConfig?.key === 'modelName' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalDistanceKm')}>
                  <div className="flex items-center">
                    <span>총 주행거리 (km)</span>
                    {sortConfig?.key === 'totalDistanceKm' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle: Vehicle, index: number) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.modelName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicle.totalDistanceKm !== undefined && vehicle.totalDistanceKm !== null
                        ? `${Number(vehicle.totalDistanceKm / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`
                        : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicle.status === 'READY' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">사용 가능</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">사용 불가</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3 cursor-pointer whitespace-nowrap !rounded-button"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedVehicle(vehicle);
                        setEditModalOpen(true);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap !rounded-button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(vehicle.id);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <VehicleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />
    </>
  );
};

export default VehicleTable;