import React, { useState, useEffect } from "react";
import axiosInstance from '../../utils/axios';

interface FormData {
  memberId: string;
  vehicleId: string;
  driveType: string;
  startLocation: string;
  endLocation: string;
  startDateTime: string;
  endDateTime: string;
}

interface Errors {
  memberId: boolean;
  vehicleId: boolean;
  startLocation: boolean;
  endLocation: boolean;
  startDateTime: boolean;
  endDateTime: boolean;
}

interface Member { id: number; name: string; }
interface Vehicle { id: number; brand: string; modelName: string; vehicleNumber: string; }

const DRIVE_TYPE_OPTIONS = [
  { value: "BUSINESS", label: "업무" },
  { value: "COMMUTE", label: "출퇴근" },
  { value: "NON_BUSINESS", label: "비업무" },
];

interface DriveRegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedVehicleId?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const DriveRegisterModal: React.FC<DriveRegisterModalProps> = ({ open, onClose, onSuccess, selectedVehicleId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<FormData>({
    memberId: "",
    vehicleId: "",
    driveType: "BUSINESS",
    startLocation: "",
    endLocation: "",
    startDateTime: "",
    endDateTime: "",
  });
  const [errors, setErrors] = useState<Errors>({
    memberId: false,
    vehicleId: false,
    startLocation: false,
    endLocation: false,
    startDateTime: false,
    endDateTime: false,
  });
  const [loading, setLoading] = useState(false);
  const [startMonthDay, setStartMonthDay] = useState("");
  const [startHour, setStartHour] = useState<string | null>(null);
  const [endMonthDay, setEndMonthDay] = useState("");
  const [endHour, setEndHour] = useState<string | null>(null);
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [amPmEnd, setAmPmEnd] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (open) {
      const companyCode = localStorage.getItem("companyCode");
      if (!companyCode) {
        alert("회사 코드가 없습니다. 다시 로그인 해주세요.");
        onClose();
        return;
      }
      axiosInstance.get(`/api/members?companyCode=${companyCode}`)
        .then(res => setMembers(res.data.data?.content || []));
      axiosInstance.get("/api/vehicles?onlyFree=true")
        .then(res => {
          setVehicles(res.data.data?.content || []);
        });
    }
  }, [open, onClose]);

  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0) {
      const vehicleExists = vehicles.some(v => v.id.toString() === selectedVehicleId);
      if (vehicleExists) {
        setFormData(prev => ({ ...prev, vehicleId: selectedVehicleId }));
      }
    }
  }, [selectedVehicleId, vehicles]);

  function to24Hour(hour12: string, ampm: 'AM' | 'PM') {
    let h = parseInt(hour12, 10);
    if (ampm === 'AM') {
      if (h === 12) return '00';
      return h.toString().padStart(2, '0');
    } else {
      if (h === 12) return '12';
      return (h + 12).toString().padStart(2, '0');
    }
  }

  useEffect(() => {
    if (startMonthDay && startHour !== null) {
      setFormData(f => ({
        ...f,
        startDateTime: `${CURRENT_YEAR}-${startMonthDay}T${to24Hour(startHour, amPm)}:00`
      }));
    }
  }, [startMonthDay, startHour, amPm]);

  useEffect(() => {
    if (endMonthDay && endHour !== null) {
      setFormData(f => ({
        ...f,
        endDateTime: `${CURRENT_YEAR}-${endMonthDay}T${to24Hour(endHour, amPmEnd)}:00`
      }));
    }
  }, [endMonthDay, endHour, amPmEnd]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = Number(formData.memberId);
    const vehicleId = Number(formData.vehicleId);

    if (!memberId || !vehicleId || isNaN(memberId) || isNaN(vehicleId)) {
      alert("운전자와 차량을 모두 선택해 주세요.");
      setLoading(false);
      return;
    }

    const newErrors = {
      memberId: !formData.memberId,
      vehicleId: !formData.vehicleId,
      startLocation: !formData.startLocation,
      endLocation: !formData.endLocation,
      startDateTime: !formData.startDateTime,
      endDateTime: !formData.endDateTime,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const payload = {
        member: { id: memberId },
        vehicle: { id: vehicleId },
        driveType: formData.driveType,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
      };
      console.log("payload", payload);
      const res = await axiosInstance.post("/api/drives", payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "운행 예약 등록에 실패했습니다.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <h2 className="text-xl font-bold mb-4">운행 예약 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">운전자 <span className="text-red-500">*</span></label>
            <select name="memberId" value={formData.memberId} onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.memberId ? "border-red-500" : "border-gray-300"} rounded-md`}>
              <option value="">운전자를 선택하세요</option>
              {members.map((m, idx) => (
                <option key={m.id ?? idx} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.memberId && <p className="text-red-500 text-xs mt-1">운전자는 필수 항목입니다.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">차량 <span className="text-red-500">*</span></label>
            <select name="vehicleId" value={formData.vehicleId} onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.vehicleId ? "border-red-500" : "border-gray-300"} rounded-md`}>
              <option value="">차량을 선택하세요</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.modelName} ({v.vehicleNumber})
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-red-500 text-xs mt-1">차량은 필수 항목입니다.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">운행 유형 <span className="text-red-500">*</span></label>
            <div className="flex space-x-6">
              {DRIVE_TYPE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center cursor-pointer">
                  <input type="radio" name="driveType" value={opt.value}
                    checked={formData.driveType === opt.value} onChange={handleChange}
                    className="form-radio h-5 w-5 text-green-500 focus:ring-green-500" />
                  <span className="ml-2 text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">출발지 <span className="text-red-500">*</span></label>
            <input type="text" name="startLocation" value={formData.startLocation} onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.startLocation ? "border-red-500" : "border-gray-300"} rounded-md`} />
            {errors.startLocation && <p className="text-red-500 text-xs mt-1">출발지는 필수 항목입니다.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">도착지 <span className="text-red-500">*</span></label>
            <input type="text" name="endLocation" value={formData.endLocation} onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.endLocation ? "border-red-500" : "border-gray-300"} rounded-md`} />
            {errors.endLocation && <p className="text-red-500 text-xs mt-1">도착지는 필수 항목입니다.</p>}
          </div>
          <div className="flex flex-row gap-4 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">출발 일시 <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="date"
                  value={startMonthDay ? `${CURRENT_YEAR}-${startMonthDay}` : ""}
                  onChange={e => {
                    const val = e.target.value;
                    setStartMonthDay(val ? val.slice(5) : "");
                  }}
                  className={`px-3 py-2 border ${errors.startDateTime ? "border-red-500" : "border-gray-300"} rounded-md`}
                  pattern="\\d{4}-\\d{2}-\\d{2}"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className={`px-3 py-1 rounded ${amPm === 'AM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPm('AM')}>오전</button>
                <button type="button" className={`px-3 py-1 rounded ${amPm === 'PM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPm('PM')}>오후</button>
              </div>
              <div className="flex flex-row flex-wrap gap-1 w-full mt-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    type="button"
                    key={i+1}
                    className={`min-w-[36px] px-1 py-1 rounded text-sm ${startHour === (i+1).toString().padStart(2, "0") ? "bg-green-500 text-white" : "bg-gray-100"}`}
                    onClick={() => setStartHour((i+1).toString().padStart(2, "0"))}
                  >
                    {(i+1).toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
              {errors.startDateTime && <p className="text-red-500 text-xs mt-1">출발 일시는 필수 항목입니다.</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">도착 일시 <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="date"
                  value={endMonthDay ? `${CURRENT_YEAR}-${endMonthDay}` : ""}
                  onChange={e => {
                    const val = e.target.value;
                    setEndMonthDay(val ? val.slice(5) : "");
                  }}
                  className={`px-3 py-2 border ${errors.endDateTime ? "border-red-500" : "border-gray-300"} rounded-md`}
                  pattern="\\d{4}-\\d{2}-\\d{2}"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className={`px-3 py-1 rounded ${amPmEnd === 'AM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPmEnd('AM')}>오전</button>
                <button type="button" className={`px-3 py-1 rounded ${amPmEnd === 'PM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPmEnd('PM')}>오후</button>
              </div>
              <div className="flex flex-row flex-wrap gap-1 w-full mt-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    type="button"
                    key={i+1}
                    className={`min-w-[36px] px-1 py-1 rounded text-sm ${endHour === (i+1).toString().padStart(2, "0") ? "bg-green-500 text-white" : "bg-gray-100"}`}
                    onClick={() => setEndHour((i+1).toString().padStart(2, "0"))}
                  >
                    {(i+1).toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
              {errors.endDateTime && <p className="text-red-500 text-xs mt-1">도착 일시는 필수 항목입니다.</p>}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors duration-300 !rounded-button whitespace-nowrap cursor-pointer">
            {loading ? "등록 중..." : "예약하기"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriveRegisterModal;