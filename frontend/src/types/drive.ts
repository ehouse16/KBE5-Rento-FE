export type DriveType = "BUSINESS" | "COMMUTE" | "NON_BUSINESS";

export interface Drive {
  id: number;
  member: {
    id: number;
    name: string;
    profileImage?: string;
  };
  vehicle: {
    id: number;
    modelName: string;
    vehicleNumber: string;
  };
  driveType: DriveType;
  startDate: string;
  endDate: string | null;
  startLocation: string;
  endLocation: string | null;
  distance: number;
  isStart: boolean;
  status?: "READY" | "DRIVING" | "COMPLETED";
}

export interface DriveDetail {
  memberName: string;
  vehicleNumber: string;
  driveType: DriveType;
  startDate: string;
  endDate: string | null;
  startLocation: string;
  endLocation: string | null;
  distance: number;
  driveStatus: "READY" | "DRIVING" | "COMPLETED";
}

export interface PathPoint {
  latitude: number;
  longitude: number;
}