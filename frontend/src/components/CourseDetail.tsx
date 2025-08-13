// src/components/CourseDetail.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, Clock, Download, Play, ShoppingCart, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/Auth';
import type { AppPage } from '../types/Auth';
import type { Course, CourseMaterial, EnrollmentStatus } from '../types/course';
import { courseAPI } from '../services/courseAPI';
import { paymentAPI } from '../services/payment';

interface CourseDetailProps {
  onNavigate: (page: AppPage) => void;
  params?: { courseId: string; isInstructor?: boolean };
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ onNavigate, params }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<unknown>('');

  const courseId = params?.courseId || '';
  const isInstructorView = params?.isInstructor || false;

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  // ...existing code...
const loadCourseData = async () => {
  try {
    setLoading(true);
    setError('');

    // Load course details
    const courseData = await courseAPI.getCourseById(courseId);
    setCourse(courseData.course);

    // Check enrollment status (for students)
    if (user?.role === 'student' && !isInstructorView) {
      const statusData = await courseAPI.checkEnrollmentStatus(courseId);

      console.log("StatusData:",statusData)

      // If API returns an error, display it
      if ('error' in statusData) {
        setError(statusData.error);
        setEnrollmentStatus(statusData); // Optionally set status
        return;
      }

      setEnrollmentStatus(statusData);

      // Load materials if user has access
      if (statusData.hasAccess) {
        const materialsData = await courseAPI.getCourseMaterials(courseId);
        setMaterials(materialsData.materials);
      }
    } else if (user?.role === 'instructor' || isInstructorView) {
      // Instructors can always see materials
      const materialsData = await courseAPI.getCourseMaterials(courseId);
      setMaterials(materialsData.materials);
    }
  } catch (err: any) {
    setError(err.message || 'Failed to load course data');
  } finally {
    setLoading(false);
  }
};
// ...existing code...

  const handlePurchaseCourse = async () => {
    if (!course) return;

    try {
      setPurchasing(true);
      const paymentData = await paymentAPI.createCheckoutSession({
        courseId: course.id,
        successUrl: `${window.location.origin}?payment=success&courseId=${course.id}`,
        cancelUrl: `${window.location.origin}?payment=cancel`,
      });
      
      // Redirect to Stripe checkout
      window.location.href = paymentData.url;
      setError(paymentData.error)
    } catch (error) {
    setError(error)
      console.error('Error creating payment session:', error);
    //   alert('Failed to initiate payment. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownloadMaterial = (material: CourseMaterial) => {
    if (material.signed_url) {
      const link = document.createElement('a');
      link.href = material.signed_url;
      link.download = material.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/')) return <Play className="h-5 w-5 text-blue-500" />;
    if (fileType.startsWith('image/')) return <BookOpen className="h-5 w-5 text-green-500" />;
    return <Download className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
          <p className="mt-2 text-gray-600">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => onNavigate(user?.role === 'instructor' ? 'instructor-dashboard' : 'student-dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasAccess = enrollmentStatus?.hasAccess || isInstructorView || user?.role === 'instructor';
  const isOwnCourse = user?.id === course.instructor_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate(user?.role === 'instructor' ? 'instructor-dashboard' : 'student-dashboard')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Course Details</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Course Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Course Header */}
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-16 w-16 text-gray-400" />
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>

                <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.category}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Max {course.max_students} students
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this course</h3>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {course.instructor_name && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructor</h3>
                    <p className="text-gray-700">{course.instructor_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Materials */}
            {hasAccess && materials.length > 0 && (
              <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Course Materials</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          {getFileIcon(material.file_type)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{material.original_filename}</p>
                            <p className="text-xs text-gray-500">
                              {(material.file_size / (1024 * 1024)).toFixed(2)} MB • 
                              {material.file_type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadMaterial(material)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm flex items-center"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purchase/Access Sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {course.currency} {course.price}
                </div>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>

              {user?.role === 'student' && !isOwnCourse && (
                <div className="space-y-4">
                  {enrollmentStatus?.hasAccess ? (
                    <div className="text-center">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                      <p className="text-green-800 font-medium">You have access to this course!</p>
                      <p className="text-sm text-gray-600 mt-2">
                        You can now access all course materials and content.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePurchaseCourse}
                      disabled={purchasing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {purchasing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      {purchasing ? 'Processing...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              )}

              {isOwnCourse && (
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                  <p className="text-blue-800 font-medium">This is your course</p>
                  <p className="text-sm text-gray-600 mt-2">
                    You can manage this course from your instructor dashboard.
                  </p>
                  <button
                    onClick={() => onNavigate('create-course', { courseId: course.id, mode: 'edit' })}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Course
                  </button>
                </div>
              )}

              {/* Course Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Course Includes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Lifetime access to materials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Download all resources
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Live streaming sessions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Certificate of completion
                  </li>
                </ul>
              </div>

              {!hasAccess && user?.role === 'student' && !isOwnCourse && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Course materials will be available after successful enrollment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};