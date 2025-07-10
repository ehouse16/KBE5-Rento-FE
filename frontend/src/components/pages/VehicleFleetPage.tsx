import React, { useEffect, useState, useRef } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VehicleFilter from '../vehicle/VehicleFilter';
import VehicleStats from '../vehicle/VehicleStats';
import VehicleTable from '../vehicle/VehicleTable';
import VehiclePagination, { PageSizeDropdown, PaginationButtons } from '../vehicle/VehiclePagination';
import VehicleAddButton from '../vehicle/VehicleAddButton';
import VehicleAddModal from '../vehicle/VehicleAddModal';
import axiosInstance from '../../utils/axios';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [allVehicles, setAllVehicles] = useState([]);

  // 부서 목록 불러오기
  useEffect(() => {
    const fetchDepartments = async () => {
      const companyCode = localStorage.getItem('companyCode');
      if (!companyCode) return;
      const res = await axiosInstance.get(`/api/departments?companyCode=${companyCode}`);
      const data = res.data;
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
    const params = new URLSearchParams();
    if (departmentFilter !== 'all') params.append('departmentId', departmentFilter);
    if (onlyFree) params.append('onlyFree', 'true');
    params.append('page', String(isNaN(currentPage) ? 1 : currentPage - 1));
    params.append('size', String(isNaN(itemsPerPage) ? 5 : itemsPerPage));
    params.append('sort', 'id,desc');
    if (search.trim()) {
      params.append('vehicleNumber', search.trim());
      const res = await axiosInstance.get(`/api/vehicles/search?${params.toString()}`);
      const data = res.data;
      setVehicles(
        (Array.isArray(data.data?.content) ? data.data.content : []).sort((a: any, b: any) => b.id - a.id)
      );
      setTotalElements(Number.isNaN(Number(data.data?.page?.totalElements)) ? 0 : Number(data.data?.page?.totalElements));
    } else {
      const res = await axiosInstance.get(`/api/vehicles?${params.toString()}`);
      const data = res.data;
      setVehicles(
        (Array.isArray(data.data?.content) ? data.data.content : []).sort((a: any, b: any) => b.id - a.id)
      );
      setTotalElements(Number.isNaN(Number(data.data?.page?.totalElements)) ? 0 : Number(data.data?.page?.totalElements));
    }
  };

  useEffect(() => {
    console.log("DriveListPage mounted");
    const fetchDrives = async () => {
      console.log("fetchDrives called");
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/drives");
        console.log("API 응답:", res);
        const data = res.data;
        setTotalElements(Number.isNaN(Number(data.data?.totalElements)) ? 0 : Number(data.data?.totalElements));
      } catch (e) {
        setError('운행 목록을 불러오지 못했습니다.');
        console.error("운행 목록 에러:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [departmentFilter, onlyFree, currentPage, itemsPerPage]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      fetchVehicles();
    }, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
    // eslint-disable-next-line
  }, [search, departmentFilter, onlyFree, currentPage, itemsPerPage]);

  // 차량 등록 성공 시 목록 및 통계 새로고침
  const handleAddSuccess = () => {
    setCurrentPage(1);
    setTimeout(() => {
      fetchVehicles();
      fetchAllVehicles();
    }, 0);
  };

  // 전체 차량 리스트 불러오기 (검색/필터와 무관하게)
  const fetchAllVehicles = async () => {
    const res = await axiosInstance.get('/api/vehicles?size=100000'); // 충분히 큰 값으로 전체 조회
    const data = res.data;
    setAllVehicles(Array.isArray(data.data?.content) ? data.data.content : []);
  };

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  useEffect(() => {
    console.log('allVehicles.length:', allVehicles.length, 'vehicles.length:', vehicles.length, 'totalElements:', totalElements);
  }, [allVehicles, vehicles, totalElements]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <VehicleStats vehicles={allVehicles} />
          <div className="flex justify-end items-center mb-2">
            <VehicleAddButton onClick={() => setAddModalOpen(true)} />
          </div>
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
          <VehicleTable
            vehicles={vehicles}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            fetchVehicles={fetchVehicles}
            fetchAllVehicles={fetchAllVehicles}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <PageSizeDropdown itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} setCurrentPage={setCurrentPage} />
            </div>
            <div className="flex-1 flex justify-end">
              <PaginationButtons currentPage={currentPage} totalPages={isNaN(itemsPerPage) || itemsPerPage === 0 ? 1 : Math.ceil((Number.isNaN(Number(totalElements)) ? 0 : Number(totalElements)) / itemsPerPage)} setCurrentPage={setCurrentPage} />
            </div>
          </div>
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
 