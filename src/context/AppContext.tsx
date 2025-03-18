import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, Task } from '../types';

const initialState: AppState = {
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
    default:
      return state;
  }
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 