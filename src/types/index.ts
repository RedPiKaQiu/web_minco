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
  uuid?: string;
}

export type AppAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'CLEAR_ALL_TASKS' }
  | { type: 'SET_UUID'; payload: string }; 