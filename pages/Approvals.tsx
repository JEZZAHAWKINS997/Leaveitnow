import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus } from '../types';
import { format, differenceInDays } from 'date-fns';
import { Check, X, Clock, AlertOctagon, Loader2 } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { getPendingApprovals, updateRequestStatus, users } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const pending = getPendingApprovals();

  const handleAction = async (id: string, approve: boolean) => {
    setProcessingId(id);
    await updateRequestStatus(
      id, 
      approve ? RequestStatus.APPROVED : RequestStatus.REJECTED,
      approve ? undefined : 'Manager declined request due to coverage.'
    );
    setProcessingId(null);
  };

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Check className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">All Caught Up!</h3>
        <p className="text-slate-500 mt-2">You have no pending leave requests to review.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        Pending Approvals
        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{pending.length}</span>
      </h2>

      <div className="space-y-4">
        {pending.map(req => {
          const requester = users.find(u => u.id === req.userId);
          const days = differenceInDays(new Date(req.endDate), new Date(req.startDate)) + 1;
          const isProcessing = processingId === req.id;

          return (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* User Info Section */}
              <div className="p-6 md:w-1/4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center justify-center text-center">
                <img src={requester?.avatar} alt={requester?.name} className="w-16 h-16 rounded-full mb-3 shadow-sm border-2 border-white" />
                <h3 className="font-bold text-slate-800">{requester?.name}</h3>
                <p className="text-sm text-slate-500">{requester?.role}</p>
                <div className="mt-4 text-xs font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                  Allowance: {requester ? requester.annualLeaveEntitlement - requester.takenLeave : 0} days left
                </div>
              </div>

              {/* Request Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <h4 className="text-lg font-bold text-slate-800 mb-1">{req.type}</h4>
                       <div className="flex items-center gap-2 text-slate-500 text-sm">
                         <Clock className="w-4 h-4" />
                         <span>{days} Day{days > 1 ? 's' : ''}</span>
                         <span>•</span>
                         <span>{format(new Date(req.startDate), 'EEE, dd MMM')} — {format(new Date(req.endDate), 'EEE, dd MMM')}</span>
                       </div>
                    </div>
                    {req.isBankHolidayWorkRequest && (
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded border border-purple-200">
                        Bank Holiday Opt-in
                      </span>
                    )}
                  </div>

                  {req.notes && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                      <p className="text-sm text-slate-600 italic">"{req.notes}"</p>
                    </div>
                  )}
                  
                  {/* Conflict Warning Mock */}
                  {Math.random() > 0.8 && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-4">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Warning: 2 other team members off this week.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-2">
                  <button 
                    onClick={() => handleAction(req.id, true)}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} 
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, false)}
                    disabled={isProcessing}
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />} 
                    Deny
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};