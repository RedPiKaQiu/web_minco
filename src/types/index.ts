export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isAnytime?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  date: string;
  image?: string;
}

export interface AppState {
  tasks: Task[];
  tickets: Ticket[];
  focusMode: boolean;
}

export type AppAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'CLEAR_ALL_TASKS' };

export interface User {
  id: string;        // UUID
  nickname: string;  // 用户昵称
  gender: 'male' | 'female' | 'other'; // 性别
  age: number;       // 年龄
  avatar?: string;   // 头像（可选）
  createdAt: string; // 创建时间
} 