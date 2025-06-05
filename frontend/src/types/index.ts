export interface User {
    id: number;
    name: string;
    email: string;
    position: string;
    loginId: string;
    password: string;
    phoneNumber: string;
    departmentId: number;
    companyCode: string;
    [key: string]: any;
  }
  
  export interface Department {
    id: number;
    name: string;
    description: string;
    memberCount: number;
    [key: string]: any;
  }