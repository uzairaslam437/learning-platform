import React from 'react';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import type { AppPage } from "../types/Auth";

interface LandingPageProps {
  onNavigate: (page: AppPage, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LearnHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('auth')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Learn from the</span>
            <span className="block text-blue-600">best instructors</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Join live online courses taught by expert instructors. Access premium content and interactive learning experiences.
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <button 
              onClick={() => onNavigate('auth', { role: 'student' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center"
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Join as Student
            </button>
            <button 
              onClick={() => onNavigate('auth', { role: 'instructor' })}
              className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center"
            >
              <Users className="mr-2 h-5 w-5" />
              Teach on LearnHub
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Premium Content</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Access high-quality course materials, videos, and resources from expert instructors.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Live Classes</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Join interactive live streaming sessions with real-time Q&A and discussions.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Expert Instructors</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Learn from industry professionals and subject matter experts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};