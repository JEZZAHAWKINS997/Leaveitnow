import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  Menu, 
  X,
  Users,
  Loader2,
  Database,
  CloudOff
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { currentUser, users, switchUser, loading, isDemoMode } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Connecting to Leaveboard...</p>
        </div>
      </div>
    );
  }

  // Fallback if somehow still null (should be handled by AppContext mock data)
  if (!currentUser) return null;

  const canApprove = [Role.MANAGER, Role.SITE_MANAGER, Role.ADMIN].includes(currentUser.role);
  const canViewAnalytics = [Role.MANAGER, Role.SITE_MANAGER, Role.ADMIN].includes(currentUser.role);

  const NavItem = ({ page, icon: Icon, label }: { page: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg ${
        currentPage === page 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 h-16 border-b border-slate-100">
            <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Leaveboard
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
              Main
            </div>
            <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem page="request" icon={PlusCircle} label="New Request" />
            <NavItem page="calendar" icon={Users} label="Team Calendar" />
            
            {(canApprove || canViewAnalytics) && (
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-4">
                Management
              </div>
            )}
            
            {canApprove && (
              <NavItem page="approvals" icon={CheckSquare} label="Approvals" />
            )}
            {canViewAnalytics && (
              <NavItem page="analytics" icon={BarChart3} label="Analytics & Reports" />
            )}
          </nav>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
              </div>
            </div>
            
            <label className="block text-xs font-medium text-slate-500 mb-1">Simulate Role:</label>
            <select 
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
            {isDemoMode ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <CloudOff className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Demo Mode (Local Data)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Database className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Connected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};