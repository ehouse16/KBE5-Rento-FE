import React from "react";
import { User, Department } from "../types";

interface UserTableProps {
  users: User[];
  departments: Department[];
  openUserModal: (user?: User) => void;
  deleteUser: (id: number) => void;
  getDepartmentName: (id: number) => string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  departments,
  openUserModal,
  deleteUser,
  getDepartmentName,
}) => (
  <div className="bg-white rounded-md shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-800">사용자 관리</h2>
      <button
        className="bg-[#2ECC71] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer !rounded-button whitespace-nowrap"
        onClick={() => openUserModal()}
      >
        <i className="fas fa-plus mr-2"></i>
        사용자 추가
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직책</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">{user.name.substring(0, 2)}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.loginId}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDepartmentName(user.departmentId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  활성
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-[#2ECC71] hover:text-[#27ae60] mr-3 cursor-pointer !rounded-button whitespace-nowrap"
                  onClick={() => openUserModal(user)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="text-red-500 hover:text-red-700 cursor-pointer !rounded-button whitespace-nowrap"
                  onClick={() => deleteUser(user.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserTable;