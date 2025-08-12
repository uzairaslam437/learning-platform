export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor";
}

export interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    role: "student" | "instructor"
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "student" | "instructor"
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export type AppPage =
  | "landing"
  | "auth"
  | "student-dashboard"
  | "instructor-dashboard"
  | "unauthorized";
