import React, { useState } from 'react';
import axiosInstance from '../../utils/axios';

interface Props {
  onSuccess?: () => void;
}

const ManagerRegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    companyCode: ''
  });

  const [errors, setErrors] = useState({
    loginId: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    companyCode: ''
  });

  const [idChecked, setIdChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'loginId') setIdChecked(false);
    if (name === 'email') setEmailChecked(false);
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'loginId':
        if (!value) errorMsg = '아이디를 입력해주세요';
        else if (value.length < 4) errorMsg = '아이디는 4자 이상이어야 합니다';
        break;
      case 'password':
        if (!value) errorMsg = '비밀번호를 입력해주세요';
        else if (value.length < 8) errorMsg = '비밀번호는 8자 이상이어야 합니다';
        break;
      case 'name':
        if (!value) errorMsg = '이름을 입력해주세요';
        break;
      case 'phone':
        if (!value) errorMsg = '전화번호를 입력해주세요';
        else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(value)) errorMsg = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
        break;
      case 'email':
        if (!value) errorMsg = '이메일을 입력해주세요';
        else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = '올바른 이메일 형식이 아닙니다';
        break;
      case 'companyCode':
        if (!value) errorMsg = '회사 코드를 입력해주세요';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const checkDuplicateId = async () => {
    if (!formData.loginId || errors.loginId) return;
    setIdCheckLoading(true);
    try {
      const response = await axiosInstance.get(`/api/managers/check-loginId/${formData.loginId}`);
      const result = response.data;
      if (result.resultCode === 'SUCCESS' && result.data === true) {
        setIdChecked(true);
      } else {
        setErrors(prev => ({ ...prev, loginId: '이미 사용 중인 아이디입니다' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, loginId: '중복확인 실패' }));
    }
    setIdCheckLoading(false);
  };

  const checkDuplicateEmail = async () => {
    if (!formData.email || errors.email) return;
    setEmailCheckLoading(true);
    try {
      const response = await axiosInstance.get(`/api/managers/check-email/${formData.email}`);
      const result = response.data;
      if (result.resultCode === 'SUCCESS' && result.data === true) {
        setEmailChecked(true);
      } else {
        setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, email: '중복확인 실패' }));
    }
    setEmailCheckLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(formData).forEach(([key, value]) => validateField(key, value));
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (!hasErrors && idChecked && emailChecked) {
      try {
        const response = await axiosInstance.post('/api/managers/sign-up', formData);
        const result = response.data;
        if (result.resultCode === 'SUCCESS') {
          alert('매니저가 등록되었습니다');
          if (onSuccess) onSuccess();
        } else {
          alert(result.message || '등록 실패');
        }
      } catch {
        alert('등록 중 오류가 발생했습니다');
      }
    }
  };

  const isFormValid = () =>
    idChecked &&
    emailChecked &&
    Object.values(formData).every(value => value !== '') &&
    Object.values(errors).every(error => error === '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Login ID Field */}
      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
            아이디 <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="mt-1 flex">
          <input
            id="loginId"
            name="loginId"
            type="text"
            required
            value={formData.loginId}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.loginId ? 'border-red-300' : idChecked ? 'border-green-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="아이디를 입력하세요"
          />
          <button
            type="button"
            onClick={checkDuplicateId}
            disabled={!formData.loginId || !!errors.loginId || idChecked || idCheckLoading}
            className={`ml-2 whitespace-nowrap !rounded-button cursor-pointer px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
              !formData.loginId || !!errors.loginId || idChecked
                ? 'bg-gray-300 text-gray-500'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {idCheckLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : idChecked ? (
              <i className="fas fa-check text-green-500"></i>
            ) : (
              '중복확인'
            )}
          </button>
        </div>
        {errors.loginId && <p className="mt-2 text-sm text-red-600">{errors.loginId}</p>}
        {idChecked && <p className="mt-2 text-sm text-green-600">사용 가능한 아이디입니다</p>}
      </div>

      {/* Email Field */}
      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일 <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="mt-1 flex">
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.email ? 'border-red-300' : emailChecked ? 'border-green-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="이메일을 입력하세요"
          />
          <button
            type="button"
            onClick={checkDuplicateEmail}
            disabled={!formData.email || !!errors.email || emailChecked || emailCheckLoading}
            className={`ml-2 whitespace-nowrap !rounded-button cursor-pointer px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
              !formData.email || !!errors.email || emailChecked
                ? 'bg-gray-300 text-gray-500'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {emailCheckLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : emailChecked ? (
              <i className="fas fa-check text-green-500"></i>
            ) : (
              '중복확인'
            )}
          </button>
        </div>
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
        {emailChecked && <p className="mt-2 text-sm text-green-600">사용 가능한 이메일입니다</p>}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          비밀번호 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이름 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="이름을 입력하세요"
          />
        </div>
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          전화번호 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="text"
            required
            value={formData.phone}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="010-1234-5678"
          />
        </div>
        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
      </div>

      {/* Company Code Field */}
      <div>
        <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
          회사 코드 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="companyCode"
            name="companyCode"
            type="text"
            required
            value={formData.companyCode}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.companyCode ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder="회사 코드를 입력하세요"
          />
        </div>
        {errors.companyCode && <p className="mt-2 text-sm text-red-600">{errors.companyCode}</p>}
      </div>

      <div className="flex items-center justify-between space-x-4 pt-4">
        <button
          type="button"
          className="whitespace-nowrap !rounded-button cursor-pointer w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`whitespace-nowrap !rounded-button cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isFormValid() ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          가입하기
        </button>
      </div>
    </form>
  );
};

export default ManagerRegisterForm; 