// src/components/StudentDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  Search,
  Filter,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../hooks/Auth";
import type { AppPage } from "../types/Auth";
import type { Course } from "../types/course";
import { courseAPI } from "../services/courseAPI";
import { paymentAPI } from "../services/payment";

interface StudentDashboardProps {
  onNavigate: (page: AppPage, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"browse" | "my-courses">("browse");
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
  ];

  const handleLogout = () => {
    logout();
    onNavigate("landing");
  };

  const loadAllCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const filters = {
        ...(selectedCategory && { category: selectedCategory }),
        status: "published",
      };
      const data = await courseAPI.getAllCourses(filters);
      setCourses(data.courses);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await courseAPI.getUserCourses();
      setMyCourses(data.courses);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "browse") {
      loadAllCourses();
    } else {
      loadMyCourses();
    }
  }, [activeTab, selectedCategory]);

  const handlePurchaseCourse = async (courseId: string) => {
    try {
      setErrorMessage(null);
      // const paymentData = await paymentAPI.createCheckoutSession({
      //   courseId,
      //   successUrl: `${window.location.origin}/payment-success`,
      //   cancelUrl: `${window.location.origin}/payment-cancel`,
      // });

      const paymentData = await paymentAPI.createCheckoutSession({
        courseId,
        successUrl: `${window.location.origin}?payment=success&courseId=${courseId}`,
        cancelUrl: `${window.location.origin}?payment=cancel`,
      });

      if (paymentData?.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        setErrorMessage("No checkout URL returned from payment service.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to initiate payment. Please try again."
      );
    }
  };

  // Clear errors on tab or filter/search change
  const handleTabChange = (tab: "browse" | "my-courses") => {
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setErrorMessage(null);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setErrorMessage(null);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Student Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName}
              </span>
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
        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange("browse")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "browse"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Browse Courses
            </button>
            <button
              onClick={() => handleTabChange("my-courses")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "my-courses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Courses
            </button>
          </nav>
        </div>

        {activeTab === "browse" && (
          <div>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                          {course.category}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {course.currency} {course.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            onNavigate("course-detail", { courseId: course.id })
                          }
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handlePurchaseCourse(course.id)}
                          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "my-courses" && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by purchasing your first course!
                </p>
                <button
                  onClick={() => handleTabChange("browse")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                          {course.category}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Enrolled
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onNavigate("course-detail", { courseId: course.id })
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Access Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
