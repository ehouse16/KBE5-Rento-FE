import React, { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: { id: string; name: string }[];
}

const vehicleTypes = [
  { value: "SEDAN", label: "세단" },
  { value: "HATCHBACK", label: "해치백" },
  { value: "COUPE", label: "쿠페" },
  { value: "CONVERTIBLE", label: "컨버터블" },
  { value: "SUV", label: "SUV" },
  { value: "CUV", label: "CUV" },
  { value: "MINIVAN", label: "미니밴" },
  { value: "VAN", label: "밴" },
  { value: "PICKUP_TRUCK", label: "픽업트럭" },
  { value: "TRUCK", label: "트럭" },
  { value: "EV", label: "전기차" },
  { value: "HEV", label: "하이브리드" },
];

const fuelTypes = [
  { value: "GASOLINE", label: "가솔린" },
  { value: "DIESEL", label: "디젤" },
  { value: "LPG", label: "LPG" },
  { value: "CNG", label: "CNG" },
  { value: "ELECTRIC", label: "전기" },
  { value: "HEV", label: "하이브리드" },
];

// 엔진 타입 enum 매핑 (예시)
const engineTypes = [
  { value: "GASOLINE", label: "가솔린" },
  { value: "DIESEL", label: "디젤" },
  { value: "LPG", label: "LPG" },
  { value: "CNG", label: "CNG" },
  { value: "ELECTRIC", label: "전기" },
  { value: "HEV", label: "하이브리드" },
];

const initialForm = {
  departmentId: "",
  vehicleNumber: "",
  brand: "",
  modelName: "",
  vehicleType: "SEDAN",
  fuelType: "GASOLINE",
  totalDistanceKm: "",
  batteryVoltage: "",
};

const VehicleAddModal: React.FC<Props> = ({ open, onClose, onSuccess, departments }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) {
      setFormData(initialForm);
      setErrors({});
      setTouched({});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      console.log('모달 open 시점 departments:', departments);
      console.log('모달 open 시점 formData:', formData);
    }
  }, [open, departments]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateField(name, value);
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const validateField = (name: string, value: string) => {
    let newErrors = { ...errors };
    switch (name) {
      case "departmentId":
        if (!value) {
          newErrors[name] = "부서를 선택해 주세요";
        } else {
          delete newErrors[name];
        }
        break;
      case "vehicleNumber":
        if (!value) {
          newErrors[name] = "차량 번호는 null일수 없습니다";
        } else if (!/^\d{2,3}[가-힣]\d{4}$/.test(value)) {
          newErrors[name] = "올바른 차량 번호 형식이 아닙니다 (예: 12가1234)";
        } else {
          delete newErrors[name];
        }
        break;
      case "brand":
        if (!value) {
          newErrors[name] = "차량 제조사는 null일수 없습니다";
        } else {
          delete newErrors[name];
        }
        break;
      case "modelName":
        if (!value) {
          newErrors[name] = "차량 모델명은 null일수 없습니다";
        } else {
          delete newErrors[name];
        }
        break;
      case "totalDistanceKm":
        if (!value) {
          newErrors[name] = "총 키로수는 null일수 없습니다";
        } else if (isNaN(Number(value)) || Number(value) < 0) {
          newErrors[name] = "유효한 주행거리를 입력해 주세요";
        } else {
          delete newErrors[name];
        }
        break;
      case "batteryVoltage":
        if (!value) {
          newErrors[name] = "배터리 전압는 null일수 없습니다";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const isFormValid = () => {
    return (
      Object.keys(errors).length === 0 &&
      formData.departmentId !== "" &&
      formData.vehicleNumber !== "" &&
      formData.brand !== "" &&
      formData.modelName !== "" &&
      formData.totalDistanceKm !== "" &&
      formData.batteryVoltage !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData].toString());
      setTouched((prev) => ({
        ...prev,
        [key]: true,
      }));
    });
    console.log('handleSubmit formData:', formData);
    console.log('handleSubmit departments:', departments);
    if (Object.keys(errors).length === 0) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const payload = {
          ...formData,
          departmentId:
            formData.departmentId && !isNaN(Number(formData.departmentId)) && formData.departmentId !== ""
              ? Number(formData.departmentId)
              : null,
          totalDistanceKm: Number(formData.totalDistanceKm),
          vehicleNumber: formData.vehicleNumber.replace(/\s/g, ""),
        };
        console.log('payload:', payload);
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'AccessToken': accessToken || ''
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('등록 실패');
        onSuccess();
        onClose();
        alert('차량이 성공적으로 등록되었습니다.');
      } catch (err) {
        alert('차량 등록에 실패했습니다.');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <h2 className="text-xl font-bold mb-4">차량 등록</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">부서 <span className="text-red-500">*</span></label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={e => {
                setFormData({
                  ...formData,
                  departmentId: e.target.value
                });
                validateField('departmentId', e.target.value);
                setTouched({
                  ...touched,
                  departmentId: true,
                });
                console.log('select onChange value:', e.target.value);
                console.log('select onChange formData.departmentId:', formData.departmentId);
              }}
              className={`block w-full px-4 py-3 bg-white border ${touched.departmentId && errors.departmentId ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="">부서 선택</option>
              {departments.filter(d => d.id !== 'all').map((dept) => {
                console.log('option value:', String(dept.id), 'option name:', dept.name);
                return (
                  <option key={`dept-${dept.id}`} value={String(dept.id)}>{dept.name}</option>
                );
              })}
            </select>
            {touched.departmentId && errors.departmentId && (
              <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">차량 번호 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="예: 12가1234"
              className={`block w-full px-4 py-3 bg-white border ${touched.vehicleNumber && errors.vehicleNumber ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {touched.vehicleNumber && errors.vehicleNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">제조사 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="예: 현대"
              className={`block w-full px-4 py-3 bg-white border ${touched.brand && errors.brand ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {touched.brand && errors.brand && (
              <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">모델명 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              placeholder="예: 아반떼"
              className={`block w-full px-4 py-3 bg-white border ${touched.modelName && errors.modelName ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {touched.modelName && errors.modelName && (
              <p className="text-red-500 text-xs mt-1">{errors.modelName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700"> 차량 종류 <span className="text-red-500">*</span></label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {vehicleTypes.map((type) => (
                <option key={`vehicleType-${type.value}`} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">엔진 타입 <span className="text-red-500">*</span></label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {engineTypes.map((type) => (
                <option key={`engineType-${type.value}`} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">총 주행거리 (km) <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="totalDistanceKm"
              value={formData.totalDistanceKm}
              onChange={handleChange}
              placeholder="예: 10000"
              className={`block w-full px-4 py-3 bg-white border ${touched.totalDistanceKm && errors.totalDistanceKm ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {touched.totalDistanceKm && errors.totalDistanceKm && (
              <p className="text-red-500 text-xs mt-1">{errors.totalDistanceKm}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">배터리 전압 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="batteryVoltage"
              value={formData.batteryVoltage}
              onChange={handleChange}
              placeholder="예: 12V"
              className={`block w-full px-4 py-3 bg-white border ${touched.batteryVoltage && errors.batteryVoltage ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {touched.batteryVoltage && errors.batteryVoltage && (
              <p className="text-red-500 text-xs mt-1">{errors.batteryVoltage}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full mt-4 px-6 py-2 rounded-lg text-white font-medium !rounded-button whitespace-nowrap cursor-pointer ${isFormValid() ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"}`}
          >
            저장
          </button>
        </form>
      </div>
    </div>
  );
};

export default VehicleAddModal; 
 