export interface UserProfile {
  userId: number;
  userEmail: string;
  userName: string;
  role: "admin" | "hr" | "interviewer";
  createdAt: string;
}
