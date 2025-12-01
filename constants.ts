import { Role, User, Team, LeaveRequest, LeaveType, RequestStatus, BankHoliday } from './types';
import { addDays, subDays } from 'date-fns';

export const TEAMS: Team[] = [
  { id: 't1', name: 'Engineering', managerId: 'u2' },
  { id: 't2', name: 'Sales', managerId: 'u5' },
];

export const USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Alice Johnson', 
    role: Role.EMPLOYEE, 
    teamId: 't1', 
    siteId: 's1', 
    avatar: 'https://picsum.photos/id/101/150/150',
    annualLeaveEntitlement: 25,
    takenLeave: 12
  },
  { 
    id: 'u2', 
    name: 'Bob Smith', 
    role: Role.MANAGER, 
    teamId: 't1', 
    siteId: 's1', 
    avatar: 'https://picsum.photos/id/102/150/150',
    annualLeaveEntitlement: 28,
    takenLeave: 5
  },
  { 
    id: 'u3', 
    name: 'Charlie Davis', 
    role: Role.EMPLOYEE, 
    teamId: 't1', 
    siteId: 's1', 
    avatar: 'https://picsum.photos/id/103/150/150',
    annualLeaveEntitlement: 25,
    takenLeave: 20
  },
  { 
    id: 'u4', 
    name: 'Diana Prince', 
    role: Role.SITE_MANAGER, 
    teamId: 't2', 
    siteId: 's1', 
    avatar: 'https://picsum.photos/id/104/150/150',
    annualLeaveEntitlement: 30,
    takenLeave: 15
  },
];

export const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'r1',
    userId: 'u1',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 7),
    type: LeaveType.ANNUAL,
    status: RequestStatus.PENDING,
    notes: 'Long weekend trip'
  },
  {
    id: 'r2',
    userId: 'u3',
    startDate: subDays(new Date(), 2),
    endDate: new Date(),
    type: LeaveType.SICK,
    status: RequestStatus.APPROVED,
    notes: 'Flu'
  },
  {
    id: 'r3',
    userId: 'u1',
    startDate: addDays(new Date(), 14),
    endDate: addDays(new Date(), 14),
    type: LeaveType.LIEU,
    status: RequestStatus.APPROVED,
    isBankHolidayWorkRequest: true
  }
];

export const BANK_HOLIDAYS: BankHoliday[] = [
  { date: new Date(new Date().getFullYear(), 11, 25), name: 'Christmas Day' },
  { date: new Date(new Date().getFullYear(), 11, 26), name: 'Boxing Day' },
  { date: new Date(new Date().getFullYear() + 1, 0, 1), name: 'New Year\'s Day' },
];
