import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RequestStatus } from '../types';

export const TeamCalendar: React.FC = () => {
  const { users, requests, currentUser } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Filter requests for the visible month approx
  const relevantRequests = requests.filter(r => r.status === RequestStatus.APPROVED);

  const getDayEvents = (day: Date) => {
    return relevantRequests.filter(req => 
      isWithinInterval(day, { start: new Date(req.startDate), end: new Date(req.endDate) })
    ).map(req => {
      const user = users.find(u => u.id === req.userId);
      return { ...req, user };
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Team Calendar</h2>
        <div className="flex items-center gap-4 bg-white rounded-lg border border-slate-200 p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-700 w-32 text-center select-none">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const events = getDayEvents(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toISOString()} 
                className={`border-b border-r border-slate-100 p-2 min-h-[100px] flex flex-col gap-1 relative ${
                  !isCurrentMonth ? 'bg-slate-50/50' : ''
                } ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  isToday 
                    ? 'bg-blue-600 text-white' 
                    : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </span>

                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                  {events.map((evt, i) => (
                    evt.user && (
                      <div 
                        key={i} 
                        className="text-xs p-1.5 rounded bg-blue-100 text-blue-800 border border-blue-200 truncate flex items-center gap-1.5"
                        title={`${evt.user.name} - ${evt.type}`}
                      >
                         <img src={evt.user.avatar} className="w-4 h-4 rounded-full" alt="" />
                         <span className="truncate font-medium">{evt.user.name.split(' ')[0]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
