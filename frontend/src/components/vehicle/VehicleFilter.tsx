import React from 'react';

interface Department {
  id: string;
  name: string;
}

interface VehicleFilterProps {
  departments: Department[];
  departmentFilter: string;
  setDepartmentFilter: (id: string) => void;
  onlyFree: boolean;
  setOnlyFree: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
  departments, departmentFilter, setDepartmentFilter,
  onlyFree, setOnlyFree, search, setSearch
}) => (
  <div className="w-full bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-end gap-4">
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">부서별 필터</label>
      <select
        className="block w-full h-12 pl-3 pr-10 border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base rounded-md"
        value={departmentFilter}
        onChange={e => setDepartmentFilter(e.target.value)}
      >
        {departments.map((dept: Department) => (
          <option key={`dept-${dept.id}`} value={dept.id}>{dept.name}</option>
        ))}
      </select>
    </div>
    <div className="flex items-end h-12">
      <label className="inline-flex items-center cursor-pointer h-12">
        <input
          type="checkbox"
          className="sr-only"
          checked={onlyFree}
          onChange={() => setOnlyFree(!onlyFree)}
        />
        <div className={`relative w-12 h-7 transition-colors duration-200 ease-in-out rounded-full ${onlyFree ? 'bg-green-500' : 'bg-gray-200'}`}>
          <div className={`absolute left-0.5 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out transform ${onlyFree ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
        <span className="ml-2 text-sm text-gray-700">사용 가능한 차량만 보기</span>
      </label>
    </div>
    <div className="relative flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
      <input
        type="text"
        className="block w-full h-12 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
        placeholder="차량 번호 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="absolute left-0 top-12 -translate-y-1/2 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400 text-lg"></i>
      </div>
    </div>
  </div>
);

export default VehicleFilter;