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

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  duration?: string;
  isAnytime?: boolean;
}

export type AppAction = 
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'TOGGLE_FOCUS_MODE' }; 