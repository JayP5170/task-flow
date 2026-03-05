export type Role = "admin" | "member";

export interface Project {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assigned_to: string | null;
  created_at: string;
}
