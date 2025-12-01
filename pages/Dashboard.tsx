import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { Briefcase, CalendarClock, Palmtree, AlertCircle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { RequestStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { currentUser, requests, getPendingApprovals } = useApp();

  const myPendingRequests = requests.filter(r => r.userId === currentUser.id && r.status === RequestStatus.PENDING).length;
  const pendingApprovals = getPendingApprovals().length;
  const remainingAllowance = currentUser.annualLeaveEntitlement - currentUser.takenLeave;

  const upcomingLeave = requests
    .filter(r => r.userId === currentUser.id && r.status === RequestStatus.APPROVED && new Date(r.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {currentUser.name.split(' ')[0]}</h2>
          <p className="text-slate-500">Here's what's happening with your leave today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Annual Allowance" 
          value={`${remainingAllowance} days`} 
          subtitle={`of ${currentUser.annualLeaveEntitlement} days total`}
          icon={Palmtree}
          color="green"
        />
        <StatCard 
          title="Pending Requests" 
          value={myPendingRequests} 
          subtitle="Awaiting manager approval"
          icon={CalendarClock}
          color="amber"
        />
        {pendingApprovals > 0 && (
           <StatCard 
           title="Needs Approval" 
           value={pendingApprovals} 
           subtitle="Team requests pending"
           icon={AlertCircle}
           color="red"
         />
        )}
        <StatCard 
          title="Upcoming Bank Holiday" 
          value="Dec 25" 
          subtitle="Christmas Day"
          icon={Briefcase}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Upcoming Leave</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Calendar</button>
            </div>
            {upcomingLeave.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingLeave.map(req => (
                  <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold text-center w-14">
                        <span className="block text-xs uppercase">{format(new Date(req.startDate), 'MMM')}</span>
                        <span className="block text-xl">{format(new Date(req.startDate), 'dd')}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{req.type}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(req.startDate), 'EEE dd MMM')} - {format(new Date(req.endDate), 'EEE dd MMM')}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No upcoming leave booked. Time for a break?
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Work a Bank Holiday?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Opt-in to work an upcoming bank holiday and receive a day in lieu added to your allowance.
              </p>
              <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors w-full">
                View Opportunities
              </button>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Who's Off Today?</h3>
            {/* Mock "Who's off" logic */}
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">JD</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">John Doe</p>
                    <p className="text-xs text-slate-500">Sick Leave</p>
                  </div>
               </div>
               <p className="text-xs text-slate-400 italic pt-2">Rest of the team is present.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
