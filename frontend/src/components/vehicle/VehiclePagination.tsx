import React from 'react';

interface VehiclePaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  totalElements: number;
}

const VehiclePagination: React.FC<VehiclePaginationProps> = ({ currentPage, totalPages, setCurrentPage, itemsPerPage, setItemsPerPage, totalElements }) => {
  // totalPages가 0 이하일 경우 1로 설정
  const safeTotalPages = Math.max(1, totalPages);
  
  // 페이지 버튼 생성
  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= safeTotalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`relative inline-flex items-center px-4 py-2 border ${currentPage === i ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} cursor-pointer whitespace-nowrap !rounded-button`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'} cursor-pointer whitespace-nowrap !rounded-button`}
        >
          이전
        </button>
        <button
          onClick={() => setCurrentPage(currentPage < safeTotalPages ? currentPage + 1 : safeTotalPages)}
          disabled={currentPage === safeTotalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === safeTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'} cursor-pointer whitespace-nowrap !rounded-button`}
        >
          다음
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            전체 <span className="font-medium">{totalElements}</span> 개 중 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-<span className="font-medium">{Math.min(currentPage * itemsPerPage, totalElements)}</span> 표시
          </p>
        </div>
        <div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-700">페이지당 표시:</span>
            <select
              className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option key={5} value={5}>5</option>
              <option key={10} value={10}>10</option>
              <option key={20} value={20}>20</option>
            </select>
          </div>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'} cursor-pointer whitespace-nowrap !rounded-button`}
            >
              <span className="sr-only">이전</span>
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            {renderPageButtons()}
            <button
              onClick={() => setCurrentPage(currentPage < safeTotalPages ? currentPage + 1 : safeTotalPages)}
              disabled={currentPage === safeTotalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${currentPage === safeTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'} cursor-pointer whitespace-nowrap !rounded-button`}
            >
              <span className="sr-only">다음</span>
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default VehiclePagination;