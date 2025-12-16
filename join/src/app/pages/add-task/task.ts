export type TaskStatus = 'todo' | 'in-progress' | 'awaiting-feedback' | 'done';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface AssigneeRef {
  uid: string; // Firestore user id or custom id
  name?: string;
  email?: string;
}

export interface Task {
  id?: string; // Firestore document id
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy?: AssigneeRef;
  assignees?: AssigneeRef[];
  category?: 'user-story' | 'technical-task';
  subtasks?: Subtask[];
  projectId?: string; // optional if you later add multi-project
}
