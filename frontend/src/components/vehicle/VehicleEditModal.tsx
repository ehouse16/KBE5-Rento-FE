import React, { useState, useEffect } from "react";

interface VehicleEditModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: any;
  onSuccess: () => void;
}

const VehicleEditModal: React.FC<VehicleEditModalProps> = ({ open, onClose, vehicle, onSuccess }) => {
  const [totalDistanceKm, setTotalDistanceKm] = useState("");
  const [batteryVoltage, setBatteryVoltage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setTotalDistanceKm(vehicle.totalDistanceKm?.toString() || "");
      setBatteryVoltage(vehicle.batteryVoltage || "");
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "AccessToken": localStorage.getItem("accessToken") || "",
        },
        body: JSON.stringify({
          totalDistanceKm: Number(totalDistanceKm),
          batteryVoltage,
        }),
      });
      if (!res.ok) throw new Error("수정 실패");
      alert("수정 완료");
      onSuccess();
      onClose();
    } catch (err) {
      alert("수정 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !vehicle) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <h2 className="text-xl font-bold mb-4">차량 정보 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">총 주행거리 (km)</label>
            <input
              type="number"
              value={totalDistanceKm}
              onChange={e => setTotalDistanceKm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">배터리 전압</label>
            <input
              type="text"
              value={batteryVoltage}
              onChange={e => setBatteryVoltage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditModal; 