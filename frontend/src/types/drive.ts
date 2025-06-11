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
}

export interface DriveDetail {
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
}