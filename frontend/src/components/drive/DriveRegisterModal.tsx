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
  onSuccess: (message: string) => void;
  selectedVehicleId?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return { yyyy, mm, dd, ymd: `${yyyy}-${mm}-${dd}` };
};

// 현재 시간 관련 변수 (useState 위에서 선언)
const now = new Date();
const nowHour = now.getHours();
const nowMinute = now.getMinutes();
const nowAmPm = nowHour < 12 ? 'AM' : 'PM';
const now12Hour = nowHour % 12 === 0 ? 12 : nowHour % 12;

// 도착일시 한 시간 뒤 제한용
const nextHour = (nowHour + 1) % 24;
const nextAmPm = nextHour < 12 ? 'AM' : 'PM';
const next12Hour = nextHour % 12 === 0 ? 12 : nextHour % 12;

// 오전/오후 시간 배열 생성
const AM_HOURS = Array.from({ length: 12 }, (_, i) => i); // 00~11
const PM_HOURS = Array.from({ length: 12 }, (_, i) => i + 12); // 12~23

// 출발일시 초기값: 현재 분이 0이 아니면 +1시간(시만 반영)
const initialHour = nowMinute === 0 ? nowHour : (nowHour + 1) % 24;
const initialAmPm = initialHour < 12 ? 'AM' : 'PM';
const initialEndHour = (initialHour + 1) % 24;
const initialEndAmPm = initialEndHour < 12 ? 'AM' : 'PM';

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
  const [today] = useState(getToday());
  const [startMonthDay, setStartMonthDay] = useState(`${today.mm}-${today.dd}`);
  const [amPm, setAmPm] = useState<'AM' | 'PM'>(initialAmPm);
  const [startHour, setStartHour] = useState<string | null>(initialHour.toString().padStart(2, '0'));
  const [endMonthDay, setEndMonthDay] = useState(`${today.mm}-${today.dd}`);
  const [amPmEnd, setAmPmEnd] = useState<'AM' | 'PM'>(initialEndAmPm);
  const [endHour, setEndHour] = useState<string | null>(initialEndHour.toString().padStart(2, '0'));
  const [endTimeManuallySet, setEndTimeManuallySet] = useState(false);

  useEffect(() => {
    if (open) {
      const companyCode = localStorage.getItem("companyCode");
      if (!companyCode) {
        alert("회사 코드가 없습니다. 다시 로그인 해주세요.");
        onClose();
        return;
      }
      axiosInstance.get("/api/members?companyCode=" + companyCode)
        .then(res => setMembers(res.data.data?.content || []));
      axiosInstance.get("/api/vehicles?size=10000")
        .then(res => {
          setVehicles(res.data.data?.content || []);
        });
      setFormData({
        memberId: "",
        vehicleId: "",
        driveType: "BUSINESS",
        startLocation: "",
        endLocation: "",
        startDateTime: "",
        endDateTime: "",
      });
      setErrors({
        memberId: false,
        vehicleId: false,
        startLocation: false,
        endLocation: false,
        startDateTime: false,
        endDateTime: false,
      });
      setStartMonthDay(`${today.mm}-${today.dd}`);
      setEndMonthDay(`${today.mm}-${today.dd}`);
      setAmPm(initialAmPm);
      setStartHour(initialHour.toString().padStart(2, '0'));
      setAmPmEnd(initialEndAmPm);
      setEndHour(initialEndHour.toString().padStart(2, '0'));
      setEndTimeManuallySet(false);
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

  // 출발일시 변경 시 도착일시를 +1시간으로 자동 세팅
  useEffect(() => {
    if (!startMonthDay || !amPm || !startHour || endTimeManuallySet) return;
    const [mm, dd] = startMonthDay.split('-').map(Number);
    let hour24 = Number(startHour);
    const startDate = new Date(CURRENT_YEAR, mm - 1, dd, hour24);
    // 출발이 23시라면 도착은 다음날 00시
    if (hour24 === 23) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const endMm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const endDd = String(nextDate.getDate()).padStart(2, '0');
      setEndMonthDay(`${endMm}-${endDd}`);
      setAmPmEnd('AM');
      setEndHour('00');
      setEndTimeManuallySet(false);
      return;
    }
    // 기본: +1시간
    startDate.setHours(startDate.getHours() + 1);
    const endMm = String(startDate.getMonth() + 1).padStart(2, '0');
    const endDd = String(startDate.getDate()).padStart(2, '0');
    const endAmPm = startDate.getHours() < 12 ? 'AM' : 'PM';
    const end24Hour = startDate.getHours();
    setEndMonthDay(`${endMm}-${endDd}`);
    setAmPmEnd(endAmPm);
    setEndHour(end24Hour.toString().padStart(2, '0'));
    setEndTimeManuallySet(false);
  }, [startMonthDay, amPm, startHour]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: false }));
  };

  // 도착일시를 사용자가 직접 선택하면 플래그 변경
  const handleEndTimeSelect = (type: 'ampm' | 'hour', value: string) => {
    setEndTimeManuallySet(true);
    if (type === 'ampm') setAmPmEnd(value as 'AM' | 'PM');
    if (type === 'hour') setEndHour(value);
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
      const successMessage = res.data?.message || "운행이 성공적으로 예약되었습니다.";
      onSuccess(successMessage);
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
                  min={today.ymd}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className={`px-3 py-1 rounded ${amPm === 'AM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPm('AM')}
                  disabled={startMonthDay === `${today.mm}-${today.dd}` && nowAmPm === 'PM'}>오전</button>
                <button type="button" className={`px-3 py-1 rounded ${amPm === 'PM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => setAmPm('PM')}
                  disabled={startMonthDay === `${today.mm}-${today.dd}` && nowAmPm === 'AM' && now12Hour === 12}>오후</button>
              </div>
              <div className="flex flex-row flex-wrap gap-1 w-full mt-2">
                {(amPm === 'AM' ? AM_HOURS : PM_HOURS).map(hour => {
                  let disabled = false;
                  if (startMonthDay === `${today.mm}-${today.dd}` && amPm === (initialHour < 12 ? 'AM' : 'PM')) {
                    if (nowMinute === 0) {
                      if (hour < initialHour) disabled = true;
                    } else {
                      if (hour <= nowHour) disabled = true;
                    }
                  }
                  return (
                    <button
                      type="button"
                      key={hour}
                      className={`min-w-[36px] px-1 py-1 rounded text-sm ${startHour === hour.toString().padStart(2, "0") ? "bg-green-500 text-white" : "bg-gray-100"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      onClick={() => !disabled && setStartHour(hour.toString().padStart(2, "0"))}
                      disabled={disabled}
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  );
                })}
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
                  min={today.ymd}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className={`px-3 py-1 rounded ${amPmEnd === 'AM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => handleEndTimeSelect('ampm', 'AM')}
                  disabled={
                    endMonthDay === startMonthDay &&
                    ((amPm === 'PM' && amPmEnd === 'AM') ||
                     (amPm === amPmEnd && amPmEnd === 'AM' && Number(startHour) === 12))
                  }
                >오전</button>
                <button type="button" className={`px-3 py-1 rounded ${amPmEnd === 'PM' ? 'bg-green-500 text-white' : 'bg-gray-100'}`} onClick={() => handleEndTimeSelect('ampm', 'PM')}
                  disabled={
                    endMonthDay === startMonthDay &&
                    (amPm === 'AM' && amPmEnd === 'PM' && Number(startHour) === 12)
                  }
                >오후</button>
              </div>
              <div className="flex flex-row flex-wrap gap-1 w-full mt-2">
                {(amPmEnd === 'AM' ? AM_HOURS : PM_HOURS).map(hour => {
                  let disabled = false;
                  if (endMonthDay === startMonthDay && amPmEnd === amPm) {
                    if (Number(startHour) !== null && hour <= Number(startHour)) disabled = true;
                  } else if (endMonthDay === `${today.mm}-${today.dd}` && amPmEnd === (initialHour < 12 ? 'AM' : 'PM')) {
                    if (nowMinute === 0) {
                      if (hour < initialHour + 1) disabled = true;
                    } else {
                      if (hour <= nowHour + 1) disabled = true;
                    }
                  }
                  return (
                    <button
                      type="button"
                      key={hour}
                      className={`min-w-[36px] px-1 py-1 rounded text-sm ${endHour === hour.toString().padStart(2, "0") ? "bg-green-500 text-white" : "bg-gray-100"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      onClick={() => !disabled && handleEndTimeSelect('hour', hour.toString().padStart(2, "0"))}
                      disabled={disabled}
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  );
                })}
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