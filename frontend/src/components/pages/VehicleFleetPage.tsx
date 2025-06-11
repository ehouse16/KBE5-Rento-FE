import React, { useEffect, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VehicleFilter from '../vehicle/VehicleFilter';
import VehicleStats from '../vehicle/VehicleStats';
import VehicleTable from '../vehicle/VehicleTable';
import VehiclePagination from '../vehicle/VehiclePagination';
import VehicleAddButton from '../vehicle/VehicleAddButton';
import VehicleAddModal from '../vehicle/VehicleAddModal';

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
};

const VehicleFleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; }[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [onlyFree, setOnlyFree] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [totalElements, setTotalElements] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // 부서 목록 불러오기
  useEffect(() => {
    const fetchDepartments = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const companyCode = localStorage.getItem('companyCode');
      if (!companyCode) return;
      const res = await fetch(`/api/departments?companyCode=${companyCode}`, { 
        credentials: 'include',
        headers: {
          'AccessToken': accessToken || ''
        }
      });
      const data = await res.json();
      setDepartments([
        { id: 'all', name: '모든 부서' },
        ...data.data.map((d: any) => ({
          id: d.departmentId,
          name: d.departmentName
        }))
      ]);
    };
    fetchDepartments();
  }, []);

  // 차량 목록 불러오기 함수 분리
  const fetchVehicles = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const params = new URLSearchParams();
    if (departmentFilter !== 'all') params.append('departmentId', departmentFilter);
    if (onlyFree) params.append('onlyFree', 'true');
    params.append('page', String(isNaN(currentPage) ? 1 : currentPage - 1));
    params.append('size', String(isNaN(itemsPerPage) ? 5 : itemsPerPage));
    const res = await fetch(`/api/vehicles?${params.toString()}`, { 
      credentials: 'include',
      headers: {
        'AccessToken': accessToken || ''
      }
    });
    const data = await res.json();
    setVehicles(Array.isArray(data.data?.content) ? data.data.content : []);
    setTotalElements(Number.isNaN(Number(data.data?.totalElements)) ? 0 : Number(data.data?.totalElements));
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [departmentFilter, onlyFree, currentPage, itemsPerPage]);

  // 차량 등록 성공 시 목록 새로고침
  const handleAddSuccess = () => {
    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-[2] min-w-[300px]">
              <VehicleFilter
                departments={departments}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                onlyFree={onlyFree}
                setOnlyFree={setOnlyFree}
                search={search}
                setSearch={setSearch}
              />
            </div>
            <div className="flex-shrink-0">
              <VehicleAddButton onClick={() => setAddModalOpen(true)} />
            </div>
          </div>
          <VehicleStats vehicles={vehicles} />
          <VehicleTable
            vehicles={vehicles}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            fetchVehicles={fetchVehicles}
          />
          <VehiclePagination
            currentPage={isNaN(currentPage) ? 1 : currentPage}
            totalPages={isNaN(itemsPerPage) || itemsPerPage === 0 ? 1 : Math.ceil((Number.isNaN(Number(totalElements)) ? 0 : Number(totalElements)) / itemsPerPage)}
            setCurrentPage={setCurrentPage}
            itemsPerPage={isNaN(itemsPerPage) ? 5 : itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>
      <Footer />
      <VehicleAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        departments={departments}
      />
    </div>
  );
};

export default VehicleFleetPage;
 