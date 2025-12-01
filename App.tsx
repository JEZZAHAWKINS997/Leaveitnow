import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LeaveRequestPage } from './pages/LeaveRequest';
import { TeamCalendar } from './pages/TeamCalendar';
import { ApprovalsPage } from './pages/Approvals';
import { AnalyticsPage } from './pages/Analytics';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'request': return <LeaveRequestPage />;
      case 'calendar': return <TeamCalendar />;
      case 'approvals': return <ApprovalsPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AppProvider>
  );
}

export default App;
