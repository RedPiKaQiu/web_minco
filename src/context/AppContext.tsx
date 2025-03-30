import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppAction, Task } from '../types';

const initialState: AppState = {
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
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload ? { ...task, completed: true } : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [...state.tickets, action.payload],
      };
    case 'TOGGLE_FOCUS_MODE':
      return {
        ...state,
        focusMode: !state.focusMode,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  addTask: async () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化时获取任务列表
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        console.log('Initial tasks loaded:', tasks);
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // 添加任务时调用 API
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      const newTask = await response.json();
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addTask }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 