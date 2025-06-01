// 事项分类枚举
export enum TaskCategory {
  LIFE = '生活',
  HEALTH = '健康', 
  WORK = '工作',
  STUDY = '学习',
  RELAX = '放松',
  EXPLORE = '探索'
}

// 事项分类配置接口
export interface TaskCategoryConfig {
  id: keyof typeof TaskCategory;
  label: TaskCategory;
  emoji: string;
}

// 预定义的事项分类配置
export const TASK_CATEGORIES: TaskCategoryConfig[] = [
  { id: 'LIFE', label: TaskCategory.LIFE, emoji: '🏠' },
  { id: 'HEALTH', label: TaskCategory.HEALTH, emoji: '💪' },
  { id: 'WORK', label: TaskCategory.WORK, emoji: '💼' },
  { id: 'STUDY', label: TaskCategory.STUDY, emoji: '📚' },
  { id: 'RELAX', label: TaskCategory.RELAX, emoji: '🎮' },
  { id: 'EXPLORE', label: TaskCategory.EXPLORE, emoji: '🔍' },
];

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  category?: TaskCategory;
  type?: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
  isAnytime?: boolean;
  postponedToTomorrow?: boolean;
  subtasks?: {id: string, title: string, completed: boolean}[];
}

export interface Ticket {
  id: string;
  title: string;
  date: string;
  image?: string;
}

// 收集物接口
export interface Collection {
  id: string;
  title: string;
  description: string;
  icon: string;
  acquiredDate: string; // 获取日期
}

export interface AppState {
  tasks: Task[];
  tickets: Ticket[];
  focusMode: boolean;
  collections: Collection[]; // 用户的收集物列表
}

export type AppAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'CLEAR_ALL_TASKS' }
  | { type: 'POSTPONE_TASKS_TO_TOMORROW'; payload: string[] }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'LOAD_TASKS'; payload: Task[] };

export interface User {
  id: string;        // UUID
  nickname: string;  // 用户昵称
  gender: 'male' | 'female' | 'other'; // 性别
  age: number;       // 年龄
  avatar?: string;   // 头像（可选）
  createdAt: string; // 创建时间
}

// 添加主题类型定义
export type ThemeType = 'default' | 'sunset' | 'forest' | 'dark'; 