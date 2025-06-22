/**
 * 测试用户模拟API接口，为测试用户提供本地数据存储和模拟API响应
 */
// 测试用户模拟API接口 - 不与后端通信
import { Item, ItemListResponse, Project, TaskCategory } from '../types';
import { CreateItemRequest, UpdateItemRequest, GetItemsQuery } from './items';
import { v4 as uuidv4 } from 'uuid';

// 模拟延迟
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 获取测试用户的模拟任务数据
const getMockTasks = (): Item[] => {
  return [
    {
      id: 'task-1',
      title: 'test完成项目报告',
      description: '准备详细的项目进度报告',
      emoji: '📊',
      category_id: 3,
      priority: 4,
      status_id: 1,
      time_slot_id: 1,
      estimated_duration: 120,
      start_time: '09:00',
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'test健身锻炼',
      description: '进行有氧运动和力量训练',
      emoji: '💪',
      category_id: 2,
      priority: 3,
      status_id: 1,
      time_slot_id: 3,
      estimated_duration: 60,
      start_time: '18:00',
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'test阅读技术书籍',
      description: '学习最新的技术知识',
      emoji: '📚',
      category_id: 4,
      priority: 2,
      status_id: 1,
      time_slot_id: 5,
      estimated_duration: 45,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'test整理房间',
      description: '清理和整理生活空间',
      emoji: '🏠',
      category_id: 1,
      priority: 2,
      status_id: 1,
      time_slot_id: 5,
      estimated_duration: 30,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-5',
      title: 'test学习新技能',
      description: '探索新的兴趣和技能',
      emoji: '🎯',
      category_id: 6,
      priority: 3,
      status_id: 1,
      time_slot_id: 4,
      estimated_duration: 90,
      start_time: '20:00',
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

// 获取测试用户的模拟项目数据
const getMockProjects = (): Project[] => {
  return [
    {
      id: 'project-1',
      title: 'test家庭整理',
      description: '整理家居空间，提高生活品质',
      category_id: 1, // 生活
      task_count: 4,
      completed_task_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // 兼容性字段
      category: TaskCategory.LIFE,
      taskCount: 4,
      hasProgress: true,
      progress: 25,
      icon: '🏠',
      color: '#4CAF50',
      notes: '每周末花1-2小时进行整理，重点关注客厅和厨房区域。'
    },
    {
      id: 'project-2',
      title: 'test健身计划',
      description: '每周三次锻炼，提高体能',
      category_id: 2, // 健康
      task_count: 3,
      completed_task_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // 兼容性字段
      category: TaskCategory.HEALTH,
      taskCount: 3,
      hasProgress: true,
      progress: 33,
      icon: '💪',
      color: '#E91E63',
      notes: '周一、周三、周五进行力量训练，周末进行有氧运动。'
    },
    {
      id: 'project-3',
      title: 'test季度报告',
      description: '准备第二季度业绩报告',
      category_id: 3, // 工作
      task_count: 4,
      completed_task_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // 兼容性字段
      category: TaskCategory.WORK,
      taskCount: 4,
      dueDate: '2024-06-30',
      hasProgress: true,
      progress: 25,
      icon: '📊',
      color: '#9C27B0',
      notes: '重点分析销售增长点和成本控制措施，准备详细的数据支持。'
    }
  ];
};

// 本地存储键名
const MOCK_TASKS_KEY = 'mock_tasks';
const MOCK_PROJECTS_KEY = 'mock_projects';

// 从本地存储获取或初始化任务数据
const getStoredTasks = (): Item[] => {
  const stored = localStorage.getItem(MOCK_TASKS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('解析存储的任务数据失败:', error);
    }
  }
  // 如果没有存储数据，返回默认测试数据
  const defaultTasks = getMockTasks();
  localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(defaultTasks));
  return defaultTasks;
};

// 从本地存储获取或初始化项目数据
const getStoredProjects = (): Project[] => {
  const stored = localStorage.getItem(MOCK_PROJECTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('解析存储的项目数据失败:', error);
    }
  }
  // 如果没有存储数据，返回默认测试数据
  const defaultProjects = getMockProjects();
  localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(defaultProjects));
  return defaultProjects;
};

// 保存任务到本地存储
const saveTasksToStorage = (tasks: Item[]) => {
  localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(tasks));
};

// 保存项目到本地存储
const saveProjectsToStorage = (projects: Project[]) => {
  localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
};

/**
 * 模拟获取事项列表
 */
export async function mockGetItems(query: GetItemsQuery = {}): Promise<ItemListResponse> {
  await mockDelay();
  
  let tasks = getStoredTasks();
  
  // 应用过滤器
  if (query.category_id) {
    tasks = tasks.filter(task => task.category_id === query.category_id);
  }
  
  if (query.is_completed !== undefined) {
    // status_id: 3 表示已完成
    const isCompleted = query.is_completed;
    tasks = tasks.filter(task => isCompleted ? task.status_id === 3 : task.status_id !== 3);
  }
  
  if (query.priority) {
    tasks = tasks.filter(task => task.priority === query.priority);
  }
  
  if (query.time_slot_id) {
    tasks = tasks.filter(task => task.time_slot_id === query.time_slot_id);
  }
  
  // 排序
  if (query.sort_by) {
    tasks.sort((a, b) => {
      const order = query.order === 'desc' ? -1 : 1;
      const aValue = a[query.sort_by as keyof Item];
      const bValue = b[query.sort_by as keyof Item];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1 * order;
      if (bValue === undefined) return -1 * order;
      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }
  
  // 分页
  const page = query.page || 1;
  const limit = query.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedTasks = tasks.slice(start, end);
  
  return {
    items: pagedTasks,
    pagination: {
      total_items: tasks.length,
      total_pages: Math.ceil(tasks.length / limit),
      current_page: page,
      limit
    }
  };
}

/**
 * 模拟创建事项
 */
export async function mockCreateItem(itemData: CreateItemRequest): Promise<Item> {
  await mockDelay();
  
  const tasks = getStoredTasks();
  
  const newTask: Item = {
    id: uuidv4(),
    title: itemData.title.startsWith('test') ? itemData.title : `test${itemData.title}`,
    description: itemData.description,
    emoji: itemData.emoji,
    category_id: itemData.category_id,
    project_id: itemData.project_id,
    start_time: itemData.start_time,
    end_time: itemData.end_time,
    estimated_duration: itemData.estimated_duration,
    time_slot_id: itemData.time_slot_id,
    priority: itemData.priority,
    status_id: itemData.status_id || 1,
    sub_tasks: itemData.sub_tasks,
    is_overdue: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  
  return newTask;
}

/**
 * 模拟更新事项
 */
export async function mockUpdateItem(itemId: string, itemData: UpdateItemRequest): Promise<{ id: string; title: string; updated_at: string }> {
  await mockDelay();
  
  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex(task => task.id === itemId);
  
  if (taskIndex === -1) {
    throw new Error(`任务 ${itemId} 不存在`);
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...itemData,
    updated_at: new Date().toISOString()
  };
  
  // 确保标题有test前缀
  if (itemData.title && !itemData.title.startsWith('test')) {
    updatedTask.title = `test${itemData.title}`;
  }
  
  tasks[taskIndex] = updatedTask;
  saveTasksToStorage(tasks);
  
  return {
    id: updatedTask.id,
    title: updatedTask.title,
    updated_at: updatedTask.updated_at
  };
}

/**
 * 模拟删除事项
 */
export async function mockDeleteItem(itemId: string): Promise<void> {
  await mockDelay();
  
  const tasks = getStoredTasks();
  const filteredTasks = tasks.filter(task => task.id !== itemId);
  
  if (filteredTasks.length === tasks.length) {
    throw new Error(`任务 ${itemId} 不存在`);
  }
  
  saveTasksToStorage(filteredTasks);
}

/**
 * 模拟获取单个事项
 */
export async function mockGetItem(itemId: string): Promise<Item> {
  await mockDelay();
  
  const tasks = getStoredTasks();
  const task = tasks.find(task => task.id === itemId);
  
  if (!task) {
    throw new Error(`任务 ${itemId} 不存在`);
  }
  
  return task;
}

/**
 * 模拟获取项目列表
 */
export async function mockGetProjects(): Promise<Project[]> {
  await mockDelay();
  return getStoredProjects();
}

/**
 * 模拟创建项目
 */
export async function mockCreateProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  await mockDelay();
  
  const projects = getStoredProjects();
  
  const newProject: Project = {
    ...projectData,
    id: uuidv4(),
    title: projectData.title.startsWith('test') ? projectData.title : `test${projectData.title}`,
    task_count: projectData.task_count || 0,
    completed_task_count: projectData.completed_task_count || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.push(newProject);
  saveProjectsToStorage(projects);
  
  return newProject;
}

/**
 * 模拟更新项目
 */
export async function mockUpdateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
  await mockDelay();
  
  const projects = getStoredProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) {
    throw new Error(`项目 ${projectId} 不存在`);
  }
  
  const updatedProject = {
    ...projects[projectIndex],
    ...projectData,
    updated_at: new Date().toISOString()
  };
  
  // 确保标题有test前缀
  if (projectData.title && !projectData.title.startsWith('test')) {
    updatedProject.title = `test${projectData.title}`;
  }
  
  projects[projectIndex] = updatedProject;
  saveProjectsToStorage(projects);
  
  return updatedProject;
}

/**
 * 模拟删除项目
 */
export async function mockDeleteProject(projectId: string): Promise<void> {
  await mockDelay();
  
  const projects = getStoredProjects();
  const filteredProjects = projects.filter(project => project.id !== projectId);
  
  if (filteredProjects.length === projects.length) {
    throw new Error(`项目 ${projectId} 不存在`);
  }
  
  saveProjectsToStorage(filteredProjects);
}

/**
 * 获取AppContext兼容的测试数据格式
 */
export const getMockDataForAppContext = () => {
  const tasks = getStoredTasks();
  const projects = getStoredProjects();
  
  // 转换为AppContext期望的格式
  const formattedTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    completed: task.status_id === 3, // 3表示已完成
    icon: task.emoji || '📌',
    type: getCategoryType(task.category_id),
    duration: task.estimated_duration ? `${Math.floor(task.estimated_duration / 60)} 小时 ${task.estimated_duration % 60} 分钟` : undefined,
    startTime: task.start_time,
    dueDate: task.start_time ? task.start_time.split('T')[0] : undefined,
    category: getCategoryEnum(task.category_id),
    isAnytime: !task.start_time,
    priority: task.priority >= 4 ? 'high' : task.priority >= 3 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
  }));
  
  return {
    tasks: formattedTasks,
    projects: projects
  };
};

// 辅助函数：根据category_id获取类型字符串
const getCategoryType = (categoryId: number): string => {
  const typeMap: Record<number, string> = {
    1: 'life',
    2: 'health', 
    3: 'work',
    4: 'study',
    5: 'relax',
    6: 'explore'
  };
  return typeMap[categoryId] || 'life';
};

// 辅助函数：根据category_id获取TaskCategory枚举
const getCategoryEnum = (categoryId: number): TaskCategory => {
  const categoryMap: Record<number, TaskCategory> = {
    1: TaskCategory.LIFE,
    2: TaskCategory.HEALTH,
    3: TaskCategory.WORK,
    4: TaskCategory.STUDY,
    5: TaskCategory.RELAX,
    6: TaskCategory.EXPLORE
  };
  return categoryMap[categoryId] || TaskCategory.LIFE;
};

/**
 * 检查是否为测试用户
 */
export const isTestUser = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) {
    return false;
  }
  
  try {
    const userData = JSON.parse(user);
    // 检查用户名是否为Shell或包含test
    return userData.username === 'Shell' || 
           userData.email === 'shell@test.com' ||
           userData.username?.includes('test') ||
           userData.id?.toString().includes('user-'); // 测试用户ID格式
  } catch (error) {
    console.error('解析用户数据失败:', error);
    return false;
  }
};

/**
 * 重置测试数据
 */
export const resetMockData = (): void => {
  const defaultTasks = getMockTasks();
  const defaultProjects = getMockProjects();
  localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(defaultTasks));
  localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(defaultProjects));
  
  // 同时清理AppContext的localStorage缓存
  localStorage.removeItem('appState');
  
  console.log('✅ 测试数据已重置，请刷新页面');
}; 