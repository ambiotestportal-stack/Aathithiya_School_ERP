export type UserRole = 'SUPER_ADMIN' | 'STUDENT' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Student extends User {
  role: 'STUDENT';
  grade: string;
  enrollmentDate: string;
  guardianName?: string;
}

export interface Teacher extends User {
  role: 'TEACHER';
  department: string;
  joinDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  credits: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
