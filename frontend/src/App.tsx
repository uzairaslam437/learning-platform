import React, { useState, useEffect } from "react";
import { useAuth } from "./hooks/Auth";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { InstructorDashboard } from "./components/InstructorDashboard";
import { UnauthorizedPage } from "./components/UnauthorizedPage";
import { CreateCourse } from "./components/CreateCourse";
import { CourseDetail } from "./components/CourseDetail";
import type { AppPage } from "./types/Auth";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>("landing");
  const [pageParams, setPageParams] = useState<{ courseId?: string; mode?: "create" | "edit"; isInstructor?: boolean } | null>(null);

  const { user, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  const handleNavigate = (page: AppPage, params?: { courseId?: string; mode?: "create" | "edit"; isInstructor?: boolean }) => {
    setCurrentPage(page);
    setPageParams(params || null);
  };

  useEffect(() => {
    const checkPaymentStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("payment");
      const courseId = urlParams.get("courseId");

      if (paymentStatus === "success" && courseId) {
        alert("Payment successful! You now have access to the course.");
        setCurrentPage("course-detail");
        setPageParams({ courseId });
      } else if (paymentStatus === "cancel") {
        alert("Payment was cancelled.");
        setCurrentPage("student-dashboard");
      }

      // Remove params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    checkPaymentStatus();
    window.addEventListener("popstate", checkPaymentStatus);

    return () => {
      window.removeEventListener("popstate", checkPaymentStatus);
    };
  }, []);

  useEffect(() => {
    if (user && currentPage === "landing") {
      const targetPage =
        user?.role === "student" ? "student-dashboard" : "instructor-dashboard";
      setCurrentPage(targetPage);
    }
  }, [user]); // Removed currentPage dependency to prevent infinite loops

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if loading times out
  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-red-400 mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Timeout</h2>
          <p className="text-gray-600 mb-4">The application is taking longer than expected to load.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const isAuthenticated = user !== null;

  const protectedPages: AppPage[] = [
    "student-dashboard",
    "instructor-dashboard",
    "create-course",
    "course-detail",
  ];

  if (protectedPages.includes(currentPage) && !isAuthenticated) {
    return <AuthPage onNavigate={handleNavigate} params={pageParams} />;
  }

  if (isAuthenticated && user) {
    if (
      (currentPage === "instructor-dashboard" ||
        currentPage === "create-course") &&
      user.role !== "instructor"
    ) {
      return <UnauthorizedPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "student-dashboard" && user.role !== "student") {
      return <UnauthorizedPage onNavigate={handleNavigate} />;
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />;
      case "auth":
        return <AuthPage onNavigate={handleNavigate} params={pageParams} />;
      case "student-dashboard":
        return <StudentDashboard onNavigate={handleNavigate} />;
      case "instructor-dashboard":
        return <InstructorDashboard onNavigate={handleNavigate} />;
      case "create-course":
        return <CreateCourse onNavigate={handleNavigate} params={pageParams || undefined} />;
      case "course-detail":
        if (!pageParams?.courseId) {
          return <UnauthorizedPage onNavigate={handleNavigate} />;
        }
        return <CourseDetail onNavigate={handleNavigate} params={{ courseId: pageParams.courseId, isInstructor: pageParams.isInstructor }} />;
      case "unauthorized":
        return <UnauthorizedPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return renderPage();
};

export default App;
