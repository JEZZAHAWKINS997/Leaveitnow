export enum Role {
  EMPLOYEE = 'Employee',
  MANAGER = 'Manager',
  SITE_MANAGER = 'Site Manager',
  ADMIN = 'Administrator'
}

export enum LeaveType {
  ANNUAL = 'Annual Leave',
  SICK = 'Sick Leave',
  WFH = 'Working from Home',
  LIEU = 'Time in Lieu',
  UNPAID = 'Unpaid Leave'
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  teamId: string;
  siteId: string;
  avatar: string;
  annualLeaveEntitlement: number; // in days
  takenLeave: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  status: RequestStatus;
  notes?: string;
  rejectionReason?: string;
  isBankHolidayWorkRequest?: boolean;
}

export interface BankHoliday {
  date: Date;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
}
