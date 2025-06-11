import React from "react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}

const DriveFilter: React.FC<Props> = ({
  search, setSearch, status, setStatus, sort, setSort
}) => (
  <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-100 flex flex-wrap items-center gap-4">
    <div className="relative flex-grow max-w-xs">
      <input
        type="text"
        placeholder="이름 또는 차량번호 검색"
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
    </div>
    <div className="relative">
      <select
        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option>전체 상태</option>
        <option>운행 중</option>
        <option>예약됨</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
      </div>
    </div>
    <div className="relative">
      <select
        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
        value={sort}
        onChange={e => setSort(e.target.value)}
      >
        <option>날짜순</option>
        <option>이름순</option>
        <option>차량번호순</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
      </div>
    </div>
  </div>
);

export default DriveFilter; 