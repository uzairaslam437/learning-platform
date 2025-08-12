import React from 'react';
import { User } from 'lucide-react';
import type { AppPage } from '../types/Auth';

interface UnauthorizedPageProps {
  onNavigate: (page: AppPage) => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 text-red-500">
          <User className="h-full w-full" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Unauthorized Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-6">
          <button
            onClick={() => onNavigate('landing')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};