import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppAction, TaskCategory } from '../types';
import { getTasks } from '../api/task';

// 从localStorage加载初始状态
const loadInitialState = (): AppState => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      // 确保状态包含所有必需的字段（向后兼容性）
      return {
        tasks: parsedState.tasks || [],
        projects: parsedState.projects || [], // 添加默认值以防旧状态没有projects字段
        tickets: parsedState.tickets || [],
        focusMode: parsedState.focusMode || false,
        collections: parsedState.collections || []
      };
    } catch (error) {
      console.error('Failed to parse saved state:', error);
    }
  }
  
  // 如果没有保存的状态或解析失败，返回默认状态
  return {
    tasks: [
      {
        id: '1',
        title: '完成项目报告',
        completed: false,
        icon: '📊',
        type: 'work',
        duration: '2 小时',
        startTime: '上午 9:00',
        dueDate: '2024-01-15'
      },
      {
        id: '2', 
        title: '健身锻炼',
        completed: false,
        icon: '💪',
        type: 'health',
        duration: '1 小时',
        startTime: '下午 6:00'
      },
      {
        id: '3',
        title: '阅读技术书籍',
        completed: false,
        icon: '📚',
        type: 'study',
        duration: '45 分钟',
        isAnytime: true
      },
      {
        id: '4',
        title: '整理房间',
        completed: false,
        icon: '🏠',
        type: 'life',
        duration: '30 分钟',
        isAnytime: true
      },
      {
        id: '5',
        title: '学习新技能',
        completed: false,
        icon: '🎯',
        type: 'explore',
        duration: '1.5 小时',
        startTime: '晚上 8:00'
      }
    ],
    projects: [
      {
        id: '1',
        title: '家庭整理',
        description: '整理家居空间，提高生活品质',
        category: TaskCategory.LIFE,
        taskCount: 4,
        hasProgress: true,
        progress: 25,
        icon: '🏠',
        color: '#4CAF50',
        notes: '每周末花1-2小时进行整理，重点关注客厅和厨房区域。'
      },
      {
        id: '2',
        title: '健身计划',
        description: '每周三次锻炼，提高体能',
        category: TaskCategory.HEALTH,
        taskCount: 3,
        hasProgress: true,
        progress: 33,
        icon: '💪',
        color: '#E91E63',
        notes: '周一、周三、周五进行力量训练，周末进行有氧运动。'
      },
      {
        id: '3',
        title: '季度报告',
        description: '准备第二季度业绩报告',
        category: TaskCategory.WORK,
        taskCount: 4,
        dueDate: '2024-06-30',
        hasProgress: true,
        progress: 25,
        icon: '📊',
        color: '#9C27B0',
        notes: '重点分析销售增长点和成本控制措施，准备详细的数据支持。'
      }
    ],
    tickets: [],
    focusMode: false,
    collections: []
  };
};

// 每天检查是否有postponedToTomorrow的事项需要恢复
const checkPostponedTasks = (state: AppState): AppState => {
  const today = new Date().toISOString().split('T')[0]; // 获取今天的日期（YYYY-MM-DD格式）
  const lastCheck = localStorage.getItem('lastPostponedCheck');
  
  // 如果今天已经检查过了，不再重复检查
  if (lastCheck === today) return state;
  
  // 更新最后检查日期
  localStorage.setItem('lastPostponedCheck', today);
  
  // 检查是否有被移至今天的事项
  const updatedTasks = state.tasks.map(task => {
    if (task.postponedToTomorrow) {
      return { ...task, postponedToTomorrow: false };
    }
    return task;
  });
  
  return {
    ...state,
    tasks: updatedTasks
  };
};

const initialState = checkPostponedTasks(loadInitialState());

const appReducer = (state: AppState, action: AppAction): AppState => {
  let newState;
  
  switch (action.type) {
    case 'ADD_TASK':
      newState = {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
      break;
    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
      break;
    case 'COMPLETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        ),
      };
      break;
    case 'DELETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
      break;
    case 'ADD_PROJECT':
      newState = {
        ...state,
        projects: [...state.projects, action.payload],
      };
      break;
    case 'UPDATE_PROJECT':
      newState = {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id 
            ? { ...project, ...action.payload.updates } 
            : project
        ),
      };
      break;
    case 'DELETE_PROJECT':
      newState = {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
      break;
    case 'ADD_TICKET':
      newState = {
        ...state,
        tickets: [...state.tickets, action.payload],
      };
      break;
    case 'TOGGLE_FOCUS_MODE':
      newState = {
        ...state,
        focusMode: !state.focusMode,
      };
      break;
    case 'CLEAR_ALL_TASKS':
      newState = {
        ...state,
        tasks: [],
      };
      break;
    case 'POSTPONE_TASKS_TO_TOMORROW':
      newState = {
        ...state,
        tasks: state.tasks.map(task => 
          action.payload.includes(task.id) 
            ? { ...task, postponedToTomorrow: true } 
            : task
        ),
      };
      break;
    case 'ADD_COLLECTION':
      newState = {
        ...state,
        collections: [...state.collections, action.payload]
      };
      break;
    case 'LOAD_TASKS':
      newState = {
        ...state,
        tasks: action.payload,
      };
      break;
    default:
      return state;
  }
  
  // 保存状态到localStorage
  localStorage.setItem('appState', JSON.stringify(newState));
  return newState;
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshTasks: () => Promise<void>;
  isLoading: boolean;
}>({
  state: initialState,
  dispatch: () => null,
  refreshTasks: async () => {},
  isLoading: false,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  // 加载事项列表
  const loadTasks = async () => {
    // 检查是否有token，如果有才请求事项
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const tasksFromApi = await getTasks();
      
      // 转换API事项格式为应用内部格式
      const formattedTasks = tasksFromApi.map(apiTask => {
        // 映射API的type字段到我们的TaskCategory枚举
        let mappedCategory: TaskCategory | undefined;
        switch (apiTask.type) {
          case 'study':
            mappedCategory = TaskCategory.STUDY;
            break;
          case 'career':
            mappedCategory = TaskCategory.WORK;
            break;
          case 'health':
            mappedCategory = TaskCategory.HEALTH;
            break;
          case 'art':
            mappedCategory = TaskCategory.RELAX;
            break;
          case 'other':
          default:
            mappedCategory = TaskCategory.LIFE;
            break;
        }
        
        return {
          id: apiTask.id?.toString() || '',
          title: apiTask.title,
          completed: apiTask.completed || false,
          dueDate: apiTask.day,
          startTime: apiTask.start_time,
          endTime: apiTask.end_time,
          priority: apiTask.priority as any,
          category: mappedCategory,
          isAnytime: !apiTask.start_time, // 如果没有开始时间，则视为"随时可做"
        };
      });
      
      // 更新状态
      dispatch({
        type: 'LOAD_TASKS',
        payload: formattedTasks
      });
    } catch (error) {
      console.error('加载事项失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 当应用初始化时加载事项
  useEffect(() => {
    loadTasks();
  }, []);
  
  // 当状态改变时保存到localStorage
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, refreshTasks: loadTasks, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 