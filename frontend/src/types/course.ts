export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  max_students: number;
  thumbnail_url?: string;
  instructor_id: string;
  instructor_name?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  s3_key: string;
  upload_date: string;
  signed_url?: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  max_students: number;
  thumbnail_url?: string;
}

export interface EnrollmentStatus {
  hasAccess: boolean;
  isInstructor: boolean;
  enrollmentStatus: 'enrolled' | 'pending' | null;
}
