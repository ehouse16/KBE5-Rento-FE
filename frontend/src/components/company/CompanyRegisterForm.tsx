import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // 사업자번호 중복 체크
  const checkBizNumber = async (value: string) => {
    setChecking(true);
    try {
      if (!value) {
        setBizNumberError('사업자 등록번호를 입력해주세요');
        setChecking(false);
        return;
      }
      // POST 방식으로 body에 담아 전송
      const res = await fetch('http://api.rento.world/api/companies/check-bizNumber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biznumber: value }),
      });
      const result: { resultCode: string; data: boolean; message?: string } = await res.json();
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
      const res = await fetch('http://api.rento.world/api/companies/register', {     
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizNumber: num, name }),
      });
      const result = await res.json();
      if (result.resultCode === 'SUCCESS') {
        alert('업체가 등록되었습니다');
        if (onSuccess) onSuccess();
      } else {
        alert(result.message || '등록 실패');
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
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
  );
};

export default CompanyRegisterForm; 