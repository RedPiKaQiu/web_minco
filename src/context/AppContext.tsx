import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppAction } from '../types';

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
    tasks: [
      {
        id: '1',
        title: '完成PPT制作',
        completed: false,
        startTime: '上午9:00',
        endTime: '下午5:30',
        duration: '2小时',
      },
      {
        id: '2',
        title: '和团队开会',
        completed: false,
        startTime: '上午10:00',
        endTime: '上午11:30',
        duration: '1小时30分',
      },
      {
        id: '3',
        title: '中午和Sarah吃饭',
        completed: false,
        startTime: '上午12:00',
        endTime: '下午1:00',
        duration: '1小时',
      },
      {
        id: '4',
        title: '下班后锻炼小时',
        completed: false,
        startTime: '下午6:00之后',
        duration: '1小时',
      },
      {
        id: '5',
        title: '给妈妈挑生日礼物',
        completed: false,
        isAnytime: true,
      }
    ],
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
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 当状态改变时保存到localStorage
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 