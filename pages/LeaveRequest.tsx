import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveType, RequestStatus } from '../types';
import { addDays, format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

export const LeaveRequestPage: React.FC = () => {
  const { currentUser, addRequest, requests, getTeamMembers } = useApp();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [type, setType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [conflicts, setConflicts] = useState<string[]>([]);

  if (!currentUser) return null;

  // Conflict Checker
  useEffect(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const team = getTeamMembers(currentUser.teamId);
    const teamIds = team.map(u => u.id).filter(id => id !== currentUser.id);

    const foundConflicts: string[] = [];

    requests.forEach(req => {
      if (req.status === RequestStatus.APPROVED && teamIds.includes(req.userId)) {
        // Check overlap
        const reqStart = new Date(req.startDate);
        const reqEnd = new Date(req.endDate);

        if (
          isWithinInterval(start, { start: reqStart, end: reqEnd }) ||
          isWithinInterval(end, { start: reqStart, end: reqEnd }) ||
          isWithinInterval(reqStart, { start, end })
        ) {
          const user = team.find(u => u.id === req.userId);
          if (user) foundConflicts.push(`${user.name} is off during this period.`);
        }
      }
    });

    setConflicts(foundConflicts);
  }, [startDate, endDate, requests, currentUser, getTeamMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addRequest({
      userId: currentUser.id,
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      type,
      notes
    });
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
        <p className="text-slate-500 max-w-md">
          Your leave request has been sent to your manager for approval. You'll be notified once a decision is made.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">New Leave Request</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-700">Entitlement Remaining</p>
            <p className="text-xs text-slate-500">
              You have {currentUser.annualLeaveEntitlement - currentUser.takenLeave} days of annual leave remaining this year.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input 
                type="date" 
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-white"
            >
              {Object.values(LeaveType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Family wedding, Doctor's appointment..."
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
            />
          </div>

          {/* Conflict Alerts */}
          {conflicts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Potential Schedule Conflicts</h4>
                  <ul className="mt-1 space-y-1">
                    {conflicts.map((c, i) => (
                      <li key={i} className="text-xs text-amber-700">• {c}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-amber-600">
                    You can still submit this request, but it may be rejected due to low coverage.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-4">
            <button type="button" className="text-slate-600 font-medium hover:text-slate-800">Cancel</button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};