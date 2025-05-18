import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppAction } from '../types';
import { getTasks } from '../api/task';

// 从localStorage加载初始状态
const loadInitialState = (): AppState => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error('Failed to parse saved state:', error);
    }
  }
  
  // 如果没有保存的状态或解析失败，返回默认状态
  return {
    tasks: [],
    tickets: [
      {
        id: '1',
        title: 'Manager 1:1 会议',
        date: '2023-03-08',
      },
      {
        id: '2',
        title: '洗衣服',
        date: '2023-03-08',
      },
      {
        id: '3',
        title: '报税',
        date: '2023-03-08',
      }
    ],
    focusMode: false,
    collections: [] // 初始化为空数组
  };
};

// 每天检查是否有postponedToTomorrow的任务需要恢复
const checkPostponedTasks = (state: AppState): AppState => {
  const today = new Date().toISOString().split('T')[0]; // 获取今天的日期（YYYY-MM-DD格式）
  const lastCheck = localStorage.getItem('lastPostponedCheck');
  
  // 如果今天已经检查过了，不再重复检查
  if (lastCheck === today) return state;
  
  // 更新最后检查日期
  localStorage.setItem('lastPostponedCheck', today);
  
  // 检查是否有被移至今天的任务
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
  
  // 加载任务列表
  const loadTasks = async () => {
    // 检查是否有token，如果有才请求任务
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const tasksFromApi = await getTasks();
      
      // 转换API任务格式为应用内部格式
      const formattedTasks = tasksFromApi.map(apiTask => ({
        id: apiTask.id?.toString() || '',
        title: apiTask.title,
        completed: apiTask.completed || false,
        dueDate: apiTask.day,
        startTime: apiTask.start_time,
        endTime: apiTask.end_time,
        priority: apiTask.priority as any,
        category: apiTask.type,
        isAnytime: !apiTask.start_time, // 如果没有开始时间，则视为"随时可做"
      }));
      
      // 更新状态
      dispatch({
        type: 'LOAD_TASKS',
        payload: formattedTasks
      });
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 当应用初始化时加载任务
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