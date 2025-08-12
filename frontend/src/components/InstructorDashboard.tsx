import React from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useAuth } from '../hooks/Auth';
import type { AppPage } from '../types/Auth';

interface InstructorDashboardProps {
  onNavigate: (page: AppPage) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Instructor Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses created</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first course to start teaching!
              </p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};