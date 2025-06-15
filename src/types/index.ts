// API统一响应格式
export interface ApiResponse<T = any> {
  code: number;        // 业务状态码，0表示成功
  message: string;     // 响应消息
  data: T | null;      // 数据载荷
}

// 根据API文档定义的数据模型

// 事项 (Item) - 对应API文档中的Task模型
export interface Item {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  category_id: number; // 1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索
  project_id?: string;
  start_time?: string; // ISO 8601 格式
  end_time?: string; // ISO 8601 格式
  estimated_duration?: number; // 分钟
  time_slot_id?: number; // 1:上午, 2:中午, 3:下午, 4:晚上, 5:随时
  priority: number; // 1-5, 5为最高
  status_id: number; // 1:pending, 2:in_progress, 3:completed, 4:cancelled
  is_overdue: boolean;
  sub_tasks?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// 项目 (Project)
export interface Project {
  id: string;
  title: string;
  description?: string;
  category_id: number;
  emoji?: string;
  color?: string;
  progress?: number; // 0.0-1.0
  start_date?: string;
  end_date?: string;
  notes?: string;
  task_count: number;
  completed_task_count: number;
  created_at: string;
  updated_at: string;
  // 为了兼容性，添加旧的字段
  category?: TaskCategory; // 兼容旧代码
  taskCount?: number; // 兼容旧代码
  dueDate?: string; // 兼容旧代码  
  hasProgress?: boolean; // 兼容旧代码
  icon?: string; // 兼容旧代码
  order?: number; // 兼容旧代码
}

// 专注会话 (FocusSession)
export interface FocusSession {
  id: string;
  task_id: string;
  start_time: string;
  end_time?: string;
  planned_duration: number; // 秒
  actual_duration?: number; // 秒
  mode_id: number; // 1:pomodoro, 2:free
  completed: boolean;
  interruptions?: number;
}

// 用户 (User) - 根据API文档更新
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
  personal_tags?: string[];
  long_term_goals?: string[];
  recent_focus?: string[];
  daily_plan_time?: string; // HH:MM
  daily_review_time?: string; // HH:MM
  timezone?: string;
  created_at: string;
  nickname?: string; // 兼容旧代码
  gender?: 'male' | 'female' | 'other'; // 兼容旧代码
  age?: number; // 兼容旧代码
  createdAt?: string; // 兼容旧代码
}

// AI推荐响应
export interface RecommendationResponse {
  recommendations: {
    item: {
      id: string;
      title: string;
      category_id: number;
    };
    reason: string;
    confidence_score?: number;
  }[];
  message?: string;
}

// AI智能推荐响应
export interface AiRecommendationResponse {
  recommendations: {
    task: Item;
    reason: string;
    confidence: number;
  }[];
  total_available: number;
}

// 事项分页响应
export interface ItemListResponse {
  items: Item[];
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
}

// 原有的兼容性类型定义
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

// 兼容性类型定义 - 保持现有代码可用
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  category?: TaskCategory;
  project?: string; // 关联的项目标题
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
  projects: Project[]; // 添加项目列表
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
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string };

// 添加主题类型定义
export type ThemeType = 'default' | 'sunset' | 'forest' | 'dark'; 