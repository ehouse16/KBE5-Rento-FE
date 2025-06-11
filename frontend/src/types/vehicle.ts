export interface VehicleDetail {
  id: number;
  vehicleNumber: string;
  brand: string;
  modelName: string;
  vehicleType: string;
  fuelType: string;
  totalDistanceKm: number;
  batteryVoltage: string;
  year?: number;
  maxDistance?: number;
  maxPower?: number;
  fastChargeTime?: string;
  // isDriving 속성은 백엔드 VehicleDetailResponse에는 없지만, 필요시 추가될 수 있습니다.
} 