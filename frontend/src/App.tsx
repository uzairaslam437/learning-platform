import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/Auth';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import type { AppPage } from './types/Auth';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [pageParams, setPageParams] = useState<any>(null);
  const { user, loading } = useAuth();

  const handleNavigate = (page: AppPage, params?: any) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  // Redirect authenticated users
  useEffect(() => {
    if (user && currentPage === 'landing') {
      setCurrentPage(user.role === 'student' ? 'student-dashboard' : 'instructor-dashboard');
    }
  }, [user, currentPage]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Route protection logic
  if ((currentPage === 'student-dashboard' || currentPage === 'instructor-dashboard') && !user) {
    setCurrentPage('auth');
  }

  if (currentPage === 'student-dashboard' && user?.role !== 'student') {
    setCurrentPage('unauthorized');
  }

  if (currentPage === 'instructor-dashboard' && user?.role !== 'instructor') {
    setCurrentPage('unauthorized');
  }

  // Render current page
  switch (currentPage) {
    case 'landing':
      return <LandingPage onNavigate={handleNavigate} />;
    case 'auth':
      return <AuthPage onNavigate={handleNavigate} params={pageParams} />;
    case 'student-dashboard':
      return <StudentDashboard onNavigate={handleNavigate} />;
    case 'instructor-dashboard':
      return <InstructorDashboard onNavigate={handleNavigate} />;
    case 'unauthorized':
      return <UnauthorizedPage onNavigate={handleNavigate} />;
    default:
      return <LandingPage onNavigate={handleNavigate} />;
  }
};

export default App;