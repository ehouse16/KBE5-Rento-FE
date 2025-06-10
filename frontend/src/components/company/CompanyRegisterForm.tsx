import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

interface Props {
  onSuccess?: () => void;
}

const CompanyRegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [bizNumber, setBizNumber] = useState('');
  const [name, setName] = useState('');
  const [bizNumberError, setBizNumberError] = useState('');
  const [nameError, setNameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [companyCode, setCompanyCode] = useState<string | null>(null);

  // 사업자번호 중복 체크
  const checkBizNumber = async (value: string) => {
    setChecking(true);
    try {
      if (!value) {
        setBizNumberError('사업자 등록번호를 입력해주세요');
        setChecking(false);
        return;
      }
      const response = await axiosInstance.post('/api/companies/check-bizNumber', {
        biznumber: value
      });
      const result = response.data;
      if (result.resultCode === 'SUCCESS' && result.data === false) {
        setBizNumberError('이미 등록된 사업자번호입니다');
      } else {
        setBizNumberError('');
      }
    } catch {
      setBizNumberError('중복 확인 실패');
    }
    setChecking(false);
  };

  const handleBizNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBizNumber(value);
    if (!value) {
      setBizNumberError('사업자 등록번호를 입력해주세요');
    } else {
      setBizNumberError('');
      if (value.length > 0) checkBizNumber(value);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (!value.trim()) {
      setNameError('업체명을 입력해주세요');
    } else {
      setNameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    if (!bizNumber) {
      setBizNumberError('사업자 등록번호를 입력해주세요');
      isValid = false;
    }
    if (!name.trim()) {
      setNameError('업체명을 입력해주세요');
      isValid = false;
    }
    if (isValid && !bizNumberError) {
      const num = Number(bizNumber);
      if (!num) {
        setBizNumberError('사업자 등록번호는 숫자만 입력하세요');
        return;
      }
      try {
        const response = await axiosInstance.post('/api/companies/register', {
          bizNumber: num,
          name
        });
        const result = response.data;
        if (result.resultCode === 'SUCCESS') {
          setCompanyCode(result.data.code);
          setModalOpen(true);
          console.log('모달 오픈! code:', result.data.code);
        } else {
          alert(result.message || '등록 실패');
        }
      } catch (error) {
        alert('등록 중 오류가 발생했습니다');
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const closeModal = () => {
    setModalOpen(false);
    setCompanyCode(null);
    setBizNumber('');
    setName('');
    if (onSuccess) {
      console.log('onSuccess 호출!');
      onSuccess();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="bizNumber" className="block text-sm font-medium text-gray-700 mb-1">
            사업자 등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bizNumber"
            value={bizNumber}
            onChange={handleBizNumberChange}
            className={`w-full px-4 py-2 border ${bizNumberError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="사업자 등록번호를 입력하세요"
          />
          {bizNumberError && <p className="mt-1 text-sm text-red-500">{bizNumberError}</p>}
        </div>
        <div className="mb-8">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            업체명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className={`w-full px-4 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="업체명을 입력하세요"
          />
          {nameError && <p className="mt-1 text-sm text-red-500">{nameError}</p>}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 !rounded-button whitespace-nowrap cursor-pointer"
          >
            취소하기
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 !rounded-button whitespace-nowrap cursor-pointer"
            disabled={checking}
          >
            {checking ? '확인 중...' : '등록하기'}
          </button>
        </div>
      </form>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">업체 등록 완료</h2>
            <p className="mb-2">업체코드가 성공적으로 발급되었습니다.</p>
            <div className="text-lg font-semibold text-green-700 mb-6">업체코드: {companyCode}</div>
            <button
              onClick={closeModal}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyRegisterForm; 