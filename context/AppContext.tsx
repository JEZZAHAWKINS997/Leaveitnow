import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { User, LeaveRequest, Role, RequestStatus, LeaveType } from '../types';
import { supabase } from '../lib/supabase';
import { USERS, INITIAL_REQUESTS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  requests: LeaveRequest[];
  loading: boolean;
  isDemoMode: boolean;
  switchUser: (userId: string) => void;
  addRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, reason?: string) => Promise<void>;
  getTeamMembers: (teamId: string) => User[];
  getPendingApprovals: () => LeaveRequest[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to load mock data
  const loadMockData = useCallback(() => {
    console.log("Loading mock data from constants...");
    setUsers(USERS);
    // Convert date objects if necessary (constants already have Date objects)
    setRequests(INITIAL_REQUESTS);
    
    // Set default user if not set
    if (!currentUser) {
      const defaultUser = USERS.find(u => u.role === Role.MANAGER) || USERS[0];
      setCurrentUser(defaultUser);
    }
    setIsDemoMode(true);
    setLoading(false);
  }, [currentUser]);

  // Fetch initial data from Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is configured with real keys
      const isPlaceholder = supabase.supabaseUrl.includes('placeholder');
      if (isPlaceholder) {
        throw new Error("Supabase is not configured (using placeholder URL)");
      }
      
      // 1. Fetch Users (Profiles)
      const { data: profiles, error: userError } = await supabase
        .from('profiles')
        .select('*');
      
      if (userError) throw userError;

      // Map DB snake_case to app camelCase
      const mappedUsers: User[] = (profiles || []).map(p => ({
        id: p.id,
        name: p.full_name,
        role: p.role as Role,
        teamId: p.team_id,
        siteId: p.site_id,
        avatar: p.avatar_url,
        annualLeaveEntitlement: p.annual_leave_entitlement,
        takenLeave: p.taken_leave
      }));

      // If no users found in DB, maybe tables exist but are empty? Fallback to mock for better DX
      if (mappedUsers.length === 0) {
        console.warn("Connected to Supabase but no users found. Loading mock data.");
        loadMockData();
        return;
      }

      setUsers(mappedUsers);

      // Set default user if none selected
      if (!currentUser && mappedUsers.length > 0) {
        const defaultUser = mappedUsers.find(u => u.role === Role.MANAGER) || mappedUsers[0];
        setCurrentUser(defaultUser);
      } else if (currentUser) {
        // Refresh current user data
        const updatedCurrent = mappedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrent) setCurrentUser(updatedCurrent);
      }

      // 2. Fetch Requests
      const { data: reqs, error: reqError } = await supabase
        .from('leave_requests')
        .select('*');

      if (reqError) throw reqError;

      const mappedRequests: LeaveRequest[] = (reqs || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        type: r.type as LeaveType,
        status: r.status as RequestStatus,
        notes: r.notes,
        rejectionReason: r.rejection_reason,
        isBankHolidayWorkRequest: r.is_bank_holiday_work_request
      }));

      setRequests(mappedRequests);
      setIsDemoMode(false);

    } catch (error: any) {
      console.warn("Supabase connection failed or not configured. Falling back to demo mode.");
      if (error?.message) console.warn("Error details:", error.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, loadMockData]);

  useEffect(() => {
    fetchData();
  }, []);

  const switchUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, [users]);

  const addRequest = useCallback(async (requestData: Omit<LeaveRequest, 'id' | 'status'>) => {
    if (!currentUser) return;

    if (isDemoMode) {
      // Mock implementation
      const newRequest: LeaveRequest = {
        ...requestData,
        id: `local-${Date.now()}`,
        status: RequestStatus.PENDING
      };
      setRequests(prev => [...prev, newRequest]);
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: requestData.userId,
          start_date: requestData.startDate.toISOString(),
          end_date: requestData.endDate.toISOString(),
          type: requestData.type,
          notes: requestData.notes,
          status: 'Pending',
          is_bank_holiday_work_request: requestData.isBankHolidayWorkRequest || false
        });

      if (error) throw error;
      await fetchData();

    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    }
  }, [currentUser, isDemoMode, fetchData]);

  const updateRequestStatus = useCallback(async (requestId: string, status: RequestStatus, reason?: string) => {
    if (isDemoMode) {
      // Mock implementation
      setRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { ...r, status, rejectionReason: reason } 
          : r
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: status,
          rejection_reason: reason 
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchData();

    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update status.");
    }
  }, [isDemoMode, fetchData]);

  const getTeamMembers = useCallback((teamId: string) => {
    return users.filter(u => u.teamId === teamId);
  }, [users]);

  const getPendingApprovals = useCallback(() => {
    if (!currentUser) return [];

    if (currentUser.role === Role.ADMIN || currentUser.role === Role.SITE_MANAGER) {
        return requests.filter(r => r.status === RequestStatus.PENDING && r.userId !== currentUser.id);
    }
    const teamMembers = getTeamMembers(currentUser.teamId);
    const teamMemberIds = teamMembers.map(u => u.id);
    
    return requests.filter(r => 
      r.status === RequestStatus.PENDING && 
      teamMemberIds.includes(r.userId) && 
      r.userId !== currentUser.id 
    );
  }, [currentUser, requests, getTeamMembers]);

  const value = useMemo(() => ({
    currentUser,
    users,
    requests,
    loading,
    isDemoMode,
    switchUser,
    addRequest,
    updateRequestStatus,
    getTeamMembers,
    getPendingApprovals
  }), [currentUser, users, requests, loading, isDemoMode, switchUser, addRequest, updateRequestStatus, getTeamMembers, getPendingApprovals]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};