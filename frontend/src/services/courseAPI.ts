import type { CreateCoursePayload, Course, CourseMaterial, EnrollmentStatus } from '../types/course';
import { getAuthHeaders, handleResponse } from './api';
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000';

export const courseAPI = {
  // Create a new course (instructor only)
  createCourse: async (courseData: CreateCoursePayload): Promise<{ success: boolean; course: Course }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  // Get all courses with optional filters
  getAllCourses: async (filters?: { 
    category?: string; 
    instructor_id?: string; 
    status?: string; 
  }): Promise<{ success: boolean; courses: Course[] }> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.instructor_id) params.append('instructor_id', filters.instructor_id);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/api/courses?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get course by ID
  getCourseById: async (courseId: string): Promise<{ success: boolean; course: Course }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update course (instructor only)
  updateCourse: async (courseId: string, courseData: Partial<CreateCoursePayload>): Promise<{ success: boolean; course: Course }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  // Delete course (instructor only)
  deleteCourse: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Upload course materials (instructor only)
  uploadMaterials: async (courseId: string, files: FileList): Promise<{ success: boolean; materials: CourseMaterial[] }> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const token = window.localStorage?.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Get course materials
  getCourseMaterials: async (courseId: string): Promise<{ success: boolean; materials: CourseMaterial[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete course material (instructor only)
  deleteMaterial: async (courseId: string, materialId: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Check enrollment status
  checkEnrollmentStatus: async (courseId: string): Promise<{ success: boolean } & EnrollmentStatus> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollment-status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get instructor's courses or student's enrollments
  getUserCourses: async (): Promise<{ success: boolean; courses: Course[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/user/my-courses`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};