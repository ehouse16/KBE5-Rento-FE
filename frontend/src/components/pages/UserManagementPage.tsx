import React, { useState, useEffect } from 'react';
import { Member, MemberRegisterRequest, MemberUpdateRequest, getMembers, getMember, registerMember, updateMember, deleteMember, getPositions } from '../../services/memberService';
import { Department, DepartmentRegisterRequest, DepartmentUpdateRequest, getDepartments, registerDepartment, updateDepartment, deleteDepartment } from '../../services/departmentService';
import { handleApiError } from '../../utils/errorHandler';
import { useCompany } from '../../contexts/CompanyContext';
import axiosInstance from '../../utils/axios';

const UserManagementPage: React.FC = () => {
  const { companyCode: contextCompanyCode } = useCompany();
  const companyCode = contextCompanyCode || localStorage.getItem('companyCode') || '';
  // 사용자 상태 관리
  const [users, setUsers] = useState<Member[]>([]);
  // 부서 상태 관리
  const [departments, setDepartments] = useState<Department[]>([]);
  // 현재 활성화된 탭
  const [activeTab, setActiveTab] = useState<'users' | 'departments'>('users');
  // 모달 상태 관리
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  // 사용자 폼 상태
  const [userForm, setUserForm] = useState<MemberRegisterRequest>({
    name: '',
    email: '',
    position: '',
    loginId: '',
    password: '',
    phoneNumber: '',
    departmentId: 0,
    companyCode: companyCode
  });
  // 부서 폼 상태
  const [departmentForm, setDepartmentForm] = useState<DepartmentRegisterRequest>({
    companyCode: companyCode,
    departmentName: ''
  });
  // 폼 에러 상태
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});
  const [departmentFormErrors, setDepartmentFormErrors] = useState<Record<string, string>>({});
  // 직책 목록
  const [positions, setPositions] = useState<string[]>([]);
  // 에러 상태 관리
  const [error, setError] = useState<string | null>(null);
  // 중복확인 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  // Add filter state
  const [userDepartmentFilter, setUserDepartmentFilter] = useState<string>('전체');
  const [userPositionFilter, setUserPositionFilter] = useState<string>('전체');
  // Add search state
  const [userSearch, setUserSearch] = useState<string>('');

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedCompanyCode = localStorage.getItem('companyCode');
        console.log('Stored company code:', storedCompanyCode);
        
        if (!storedCompanyCode) {
          setError('회사 코드가 없습니다. 다시 로그인해주세요.');
          return;
        }

        const [usersResponse, departmentsResponse, positionsResponse] = await Promise.all([
          getMembers(storedCompanyCode as string),
          getDepartments(storedCompanyCode as string),
          getPositions()
        ]);

        console.log('API Responses:', {
          users: usersResponse,
          departments: departmentsResponse,
          positions: positionsResponse
        });

        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
        setPositions(Array.isArray(positionsResponse.data) ? positionsResponse.data : []);

        console.log('Processed data:', {
          users: usersResponse.data,
          departments: departmentsResponse.data,
          positions: positionsResponse.data
        });
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      }
    };

    loadInitialData();
  }, []);

  // 사용자 추가/수정 모달 열기
  const openUserModal = (user?: Member) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        position: user.position,
        loginId: user.login_id,
        password: '', // 수정 시에는 비밀번호를 비워둠
        phoneNumber: user.phoneNumber,
        departmentId: user.departmentId,
        companyCode: companyCode
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        position: '',
        loginId: '',
        password: '',
        phoneNumber: '',
        departmentId: 0,
        companyCode: companyCode
      });
    }
    setUserFormErrors({});
    setShowUserModal(true);
  };

  // 부서 추가/수정 모달 열기
  const openDepartmentModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setDepartmentForm({
        companyCode: companyCode,
        departmentName: department.departmentName
      });
    } else {
      setEditingDepartment(null);
      setDepartmentForm({
        companyCode: companyCode,
        departmentName: ''
      });
    }
    setDepartmentFormErrors({});
    setShowDepartmentModal(true);
  };

  // 사용자 폼 변경 핸들러
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phoneNumber') {
      // 숫자만 남기고, 11자리까지만 허용
      const onlyNums = newValue.replace(/[^\d]/g, '').slice(0, 11);
      if (onlyNums.length < 4) {
        newValue = onlyNums;
      } else if (onlyNums.length < 8) {
        newValue = onlyNums.slice(0, 3) + '-' + onlyNums.slice(3);
      } else {
        newValue = onlyNums.slice(0, 3) + '-' + onlyNums.slice(3, 7) + '-' + onlyNums.slice(7);
      }
    }
    setUserForm(prev => ({ ...prev, [name]: newValue }));
    validateUserField(name, newValue);
    if (name === 'loginId') setIsIdChecked(false);
    if (name === 'email') setIsEmailChecked(false);
    if (name === 'phoneNumber') setIsPhoneChecked(false);
  };

  // 부서 폼 변경 핸들러
  const handleDepartmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({ ...prev, [name]: value }));
    // 실시간 유효성 검사
    validateDepartmentField(name, value);
  };

  // 사용자 필드 유효성 검사
  const validateUserField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = '이름은 필수 값입니다.';
        break;
      case 'email':
        if (!value) error = '이메일은 필수 값입니다.';
        else if (!/\S+@\S+\.\S+/.test(value)) error = '유효한 이메일 형식이 아닙니다.';
        break;
      case 'position':
        if (!value) error = '직책은 필수 값입니다.';
        break;
      case 'loginId':
        if (!value) error = '아이디는 필수 값입니다.';
        break;
      case 'password':
        if (!editingUser && !value) error = '비밀번호는 필수 값입니다.';
        else if (value && value.length < 4) error = '비밀번호는 4자리 이상이어야합니다.';
        break;
      case 'phoneNumber':
        if (!value) error = '전화번호는 필수 값입니다.';
        else if (!/^\d{3}-\d{4}-\d{4}$/.test(value)) error = '전화번호는 010-1234-5678 형식으로 입력하세요.';
        break;
      case 'departmentId':
        if (!value) error = '부서는 필수 값입니다.';
        break;
      default:
        break;
    }
    setUserFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // 부서 필드 유효성 검사
  const validateDepartmentField = (name: string, value: string) => {
    let error = '';
    if (name === 'departmentName' && !value) {
      error = '부서명은 필수 값입니다.';
    }
    setDepartmentFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // 사용자 폼 전체 유효성 검사
  const validateUserForm = () => {
    const fields = ['name', 'email', 'position', 'loginId', 'phoneNumber', 'departmentId'];
    let isValid = true;
    fields.forEach(field => {
      const value = userForm[field as keyof MemberRegisterRequest]?.toString() || '';
      if (!validateUserField(field, value)) {
        isValid = false;
      }
    });
    if (!editingUser && !validateUserField('password', userForm.password)) {
      isValid = false;
    }
    return isValid;
  };

  // 부서 폼 전체 유효성 검사
  const validateDepartmentForm = () => {
    return validateDepartmentField('departmentName', departmentForm.departmentName);
  };

  // 중복확인 함수들
  const checkIdDuplicate = async () => {
    if (!userForm.loginId) {
      alert('아이디를 입력하세요.');
      return;
    }
    try {
      const response = await axiosInstance.get(`/api/members/check-id/${userForm.loginId}`);
      const data = response.data;
      if (data.data) {
        setIsIdChecked(true);
        alert('사용 가능한 아이디입니다.');
      } else {
        setIsIdChecked(false);
        alert('이미 사용 중인 아이디입니다.');
      }
    } catch {
      setIsIdChecked(false);
      alert('중복확인 실패');
    }
  };
  const checkEmailDuplicate = async () => {
    if (!userForm.email) {
      alert('이메일을 입력하세요.');
      return;
    }
    try {
      const response = await axiosInstance.get(`/api/members/check-email/${userForm.email}`);
      const data = response.data;
      if (data.data) {
        setIsEmailChecked(true);
        alert('사용 가능한 이메일입니다.');
      } else {
        setIsEmailChecked(false);
        alert('이미 사용 중인 이메일입니다.');
      }
    } catch {
      setIsEmailChecked(false);
      alert('중복확인 실패');
    }
  };
  const checkPhoneDuplicate = async () => {
    if (!userForm.phoneNumber) {
      alert('전화번호를 입력하세요.');
      return;
    }
    try {
      const response = await axiosInstance.get(`/api/members/check-phone/${userForm.phoneNumber}`);
      const data = response.data;
      if (data.data) {
        setIsPhoneChecked(true);
        alert('사용 가능한 전화번호입니다.');
      } else {
        setIsPhoneChecked(false);
        alert('이미 사용 중인 전화번호입니다.');
      }
    } catch {
      setIsPhoneChecked(false);
      alert('중복확인 실패');
    }
  };

  // 저장 버튼 활성화 조건
  const isSaveEnabled = editingUser ? true : (isIdChecked && isEmailChecked && isPhoneChecked);

  // 사용자 저장
  const saveUser = async () => {
    if (!validateUserForm() || !companyCode) {
      setError('회사 코드가 없습니다. 다시 로그인해주세요.');
      return;
    }
    try {
      if (editingUser) {
        const updateRequest: MemberUpdateRequest = {
          id: editingUser.id,
          name: userForm.name,
          email: userForm.email,
          position: userForm.position,
          loginId: userForm.loginId,
          phoneNumber: userForm.phoneNumber,
          departmentId: userForm.departmentId,
          companyCode: companyCode
        };
        await updateMember(editingUser.id, updateRequest);
        const updatedUsers = await getMembers(companyCode);
        setUsers(updatedUsers.data || []);
      } else {
        const registerRequest: MemberRegisterRequest = {
          ...userForm,
          companyCode: companyCode
        };
        await registerMember(registerRequest);
        const updatedUsers = await getMembers(companyCode);
        setUsers(updatedUsers.data || []);
      }
      setShowUserModal(false);
      setError(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      alert(errorMessage);
      console.error('Failed to save user:', error);
    }
  };

  // 부서 저장
  const saveDepartment = async () => {
    if (!validateDepartmentForm() || !companyCode) {
      setError('회사 코드가 없습니다. 다시 로그인해주세요.');
      return;
    }
    try {
      if (editingDepartment) {
        const updateRequest: DepartmentUpdateRequest = {
          departmentId: editingDepartment.departmentId,
          departmentName: departmentForm.departmentName,
          companyCode: companyCode
        };
        await updateDepartment(updateRequest);
        const updatedDepartments = await getDepartments(companyCode);
        setDepartments(updatedDepartments.data || []);
      } else {
        const registerRequest: DepartmentRegisterRequest = {
          companyCode: companyCode,
          departmentName: departmentForm.departmentName
        };
        await registerDepartment(registerRequest);
        const updatedDepartments = await getDepartments(companyCode);
        setDepartments(updatedDepartments.data || []);
      }
      setShowDepartmentModal(false);
      setError(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('Failed to save department:', error);
    }
  };

  // 사용자 삭제
  const deleteUser = async (id: number) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await deleteMember(id);
        setUsers(users.filter(user => user.id !== id));
        setError(null);
      } catch (error) {
        const errorMessage = handleApiError(error);
        setError(errorMessage);
        console.error('Failed to delete user:', error);
      }
    }
  };

  // 부서 삭제
  const handleDeleteDepartment = async (id: number) => {
    if (window.confirm('정말로 이 부서를 삭제하시겠습니까?')) {
      try {
        if (!companyCode) {
          setError('회사 코드가 없습니다. 다시 로그인해주세요.');
          return;
        }
        await deleteDepartment(companyCode, id);
        const updatedDepartments = await getDepartments(companyCode);
        setDepartments(updatedDepartments.data || []);
        setError(null);
      } catch (error) {
        const errorMessage = handleApiError(error);
        setError(errorMessage);
        console.error('Failed to delete department:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 w-full max-w-lg mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">닫기</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6">
        {/* 추가 버튼: 탭 위, 오른쪽 정렬 */}
        <div className="flex justify-end mb-2">
          {activeTab === 'users' && (
            <button
              className="bg-[#2ECC71] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer !rounded-button whitespace-nowrap"
              onClick={() => openUserModal()}
            >
              <i className="fas fa-plus mr-2"></i>
              사용자 추가
            </button>
          )}
          {activeTab === 'departments' && (
            <button
              className="bg-[#2ECC71] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer !rounded-button whitespace-nowrap"
              onClick={() => openDepartmentModal()}
            >
              <i className="fas fa-plus mr-2"></i>
              부서 추가
            </button>
          )}
        </div>
        {/* 탭 */}
        <div className="bg-white rounded-md shadow-sm mb-6">
          <div className="flex justify-start border-b">
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'users' ? 'text-[#2ECC71] border-b-2 border-[#2ECC71]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('users')}
            >
              사용자
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'departments' ? 'text-[#2ECC71] border-b-2 border-[#2ECC71]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('departments')}
            >
              부서 ({departments.length})
            </button>
          </div>
        </div>

        {/* 사용자 관리 */}
        {activeTab === 'users' && (
          <>
            {/* VehicleFilter 스타일의 필터 카드 */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">부서별 필터</label>
                <select
                  className="block w-full h-12 pl-3 pr-10 border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base rounded-md"
                  value={userDepartmentFilter}
                  onChange={e => setUserDepartmentFilter(e.target.value)}
                >
                  <option value="전체">전체 부서</option>
                  {departments.map(dept => (
                    <option key={dept.departmentId} value={dept.departmentName}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">직책별 필터</label>
                <select
                  className="block w-full h-12 pl-3 pr-10 border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base rounded-md"
                  value={userPositionFilter}
                  onChange={e => setUserPositionFilter(e.target.value)}
                >
                  <option value="전체">전체 직책</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
                <input
                  type="text"
                  className="block w-full h-12 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                  placeholder="이름, 아이디, 이메일 검색"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <div className="absolute left-0 top-12 -translate-y-1/2 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400 text-lg"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직책</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(user => userDepartmentFilter === '전체' || user.departmentName === userDepartmentFilter)
                      .filter(user => userPositionFilter === '전체' || user.position === userPositionFilter)
                      .filter(user =>
                        userSearch.trim() === '' ||
                        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        user.login_id?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        user.email?.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((user, idx) => (
                        <tr key={user.id ?? user.login_id ?? idx} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || '이름 없음'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.login_id || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.position || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.departmentName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phoneNumber || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-green-600 hover:text-green-900 mr-3 cursor-pointer whitespace-nowrap !rounded-button"
                              onClick={e => { e.stopPropagation(); openUserModal(user); }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap !rounded-button"
                              onClick={e => { e.stopPropagation(); deleteUser(user.id); }}
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
          </>
        )}

        {/* 부서 관리 */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서명</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구성원수</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map(department => (
                    <tr key={department.departmentId} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.departmentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.numberOfEmployees}명</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-green-600 hover:text-green-900 mr-3 cursor-pointer whitespace-nowrap !rounded-button"
                          onClick={e => { e.stopPropagation(); openDepartmentModal(department); }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap !rounded-button"
                          onClick={e => { e.stopPropagation(); handleDeleteDepartment(department.departmentId); }}
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
        )}
      </main>

      {/* 사용자 추가/수정 모달 */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingUser ? '사용자 수정' : '사용자 추가'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserFormChange}
                    className={`w-full px-3 py-2 border ${userFormErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                  />
                  {userFormErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserFormChange}
                      className={`w-full px-3 py-2 border ${userFormErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                    />
                    {!editingUser && (
                      <button
                        className="ml-2 min-w-[80px] px-3 py-1.5 bg-[#2ECC71] text-white text-sm font-medium rounded-md hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:ring-offset-2 leading-tight"
                        onClick={checkEmailDuplicate}
                      >
                        중복 확인
                      </button>
                    )}
                  </div>
                  {userFormErrors.email && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직책 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="position"
                    value={userForm.position}
                    onChange={handleUserFormChange}
                    className={`w-full px-3 py-2 border ${userFormErrors.position ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                  >
                    <option value="">직책 선택</option>
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                  {userFormErrors.position && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.position}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이디 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="loginId"
                      value={userForm.loginId}
                      onChange={handleUserFormChange}
                      className={`w-full px-3 py-2 border ${userFormErrors.loginId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                    />
                    {!editingUser && (
                      <button
                        className="ml-2 min-w-[80px] px-3 py-1.5 bg-[#2ECC71] text-white text-sm font-medium rounded-md hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:ring-offset-2 leading-tight"
                        onClick={checkIdDuplicate}
                      >
                        중복 확인
                      </button>
                    )}
                  </div>
                  {userFormErrors.loginId && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.loginId}</p>
                  )}
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      className={`w-full px-3 py-2 border ${userFormErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                    />
                    {userFormErrors.password && (
                      <p className="mt-1 text-xs text-red-500">{userFormErrors.password}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="phoneNumber"
                      value={userForm.phoneNumber}
                      placeholder="010-1234-5678"
                      onChange={handleUserFormChange}
                      className={`w-full px-3 py-2 border ${userFormErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                    />
                    {!editingUser && (
                      <button
                        className="ml-2 min-w-[80px] px-3 py-1.5 bg-[#2ECC71] text-white text-sm font-medium rounded-md hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:ring-offset-2 leading-tight"
                        onClick={checkPhoneDuplicate}
                      >
                        중복 확인
                      </button>
                    )}
                  </div>
                  {userFormErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    부서 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    value={userForm.departmentId}
                    onChange={handleUserFormChange}
                    className={`w-full px-3 py-2 border ${userFormErrors.departmentId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                  >
                    <option value="">부서 선택</option>
                    {departments.map(dept => (
                      <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
                    ))}
                  </select>
                  {userFormErrors.departmentId && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.departmentId}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 mr-3 hover:bg-gray-100 cursor-pointer !rounded-button whitespace-nowrap"
                onClick={() => setShowUserModal(false)}
              >
                취소
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium !rounded-button whitespace-nowrap ${isSaveEnabled ? 'bg-[#2ECC71] text-white hover:bg-[#27ae60] cursor-pointer' : 'bg-gray-300 text-white cursor-not-allowed'}`}
                disabled={!isSaveEnabled}
                onClick={saveUser}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 부서 추가/수정 모달 */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingDepartment ? '부서 수정' : '부서 추가'}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="departmentName"
                  value={departmentForm.departmentName}
                  onChange={handleDepartmentFormChange}
                  className={`w-full px-3 py-2 border ${departmentFormErrors.departmentName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm`}
                />
                {departmentFormErrors.departmentName && (
                  <p className="mt-1 text-xs text-red-500">{departmentFormErrors.departmentName}</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 mr-3 hover:bg-gray-100 cursor-pointer !rounded-button whitespace-nowrap"
                onClick={() => setShowDepartmentModal(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-md text-sm font-medium hover:bg-[#27ae60] cursor-pointer !rounded-button whitespace-nowrap"
                onClick={saveDepartment}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage; 