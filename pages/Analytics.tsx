import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { RequestStatus, LeaveType } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const { requests, users } = useApp();

  const approved = requests.filter(r => r.status === RequestStatus.APPROVED);

  // Data for Absence by Month
  const absenceByMonth = [0,1,2,3,4,5,6,7,8,9,10,11].map(monthIdx => {
    const monthName = new Date(2023, monthIdx, 1).toLocaleString('default', { month: 'short' });
    const count = approved.filter(r => new Date(r.startDate).getMonth() === monthIdx).length;
    return { name: monthName, requests: count };
  });

  // Data for Leave Type Distribution
  const typeData = Object.values(LeaveType).map(type => {
    return {
      name: type,
      value: approved.filter(r => r.type === type).length
    };
  }).filter(d => d.value > 0);

  // Bradford Factor Calculation (Simplified)
  // B = S^2 x D (S = Spells, D = Total Days)
  const calculateBradford = (userId: string) => {
    const userRequests = approved.filter(r => r.userId === userId && r.type === LeaveType.SICK);
    const spells = userRequests.length;
    let totalDays = 0;
    // Simple approximate duration
    userRequests.forEach(r => totalDays += 1); 
    
    return spells * spells * totalDays;
  };

  const bradfordScores = users.map(u => ({
    name: u.name,
    score: calculateBradford(u.id)
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Absence Trends */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Absence Trends (Yearly)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenceByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Leave Type Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bradford Factor Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Bradford Factor Scores</h3>
            <p className="text-sm text-slate-500">Monitoring short-term absence frequency (Score = Spells² × Total Days)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3 text-right">Score</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bradfordScores.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-right">{item.score}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.score > 50 ? 'bg-red-100 text-red-700' :
                      item.score > 20 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.score > 50 ? 'Concern' : item.score > 20 ? 'Monitor' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
