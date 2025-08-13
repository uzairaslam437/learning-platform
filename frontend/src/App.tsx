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
  const [pageParams, setPageParams] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [hasInitialAuthCheck, setHasInitialAuthCheck] = useState(false);
  
  const { user, loading, isValidToken, accessToken } = useAuth();

  const handleNavigate = (page: AppPage, params?: any) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  useEffect(() => {
    const checkToken = async () => {
      if (accessToken) {
        try {
          const valid = await isValidToken();
          setIsValid(valid);
        } catch (error) {
          console.error("Token validation error:", error);
          setIsValid(false);
        }
      } else {
        setIsValid(false);
      }
      setHasInitialAuthCheck(true);
    };
    
    if (!loading) {
      checkToken();
    }
  }, [accessToken, isValidToken, loading]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const courseId = urlParams.get("courseId");

    if (paymentStatus === "success" && courseId) {
      alert("Payment successful! You now have access to the course.");
      setCurrentPage("course-detail");
      setPageParams({ courseId });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancel") {
      alert("Payment was cancelled.");
      setCurrentPage("student-dashboard");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (hasInitialAuthCheck && (user || isValid) && currentPage === "landing") {
      const targetPage = user?.role === "student" ? "student-dashboard" : "instructor-dashboard";
      setCurrentPage(targetPage);
    }
  }, [user, isValid, currentPage, hasInitialAuthCheck]);

  if (loading || !hasInitialAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAuthenticated = user !== null || isValid;

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
      (currentPage === "instructor-dashboard" || currentPage === "create-course") &&
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
        return <CreateCourse onNavigate={handleNavigate} params={pageParams} />;
      case "course-detail":
        return <CourseDetail onNavigate={handleNavigate} params={pageParams} />;
      case "unauthorized":
        return <UnauthorizedPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return renderPage();
};

export default App;