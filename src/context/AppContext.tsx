/**
 * 应用全局状态管理上下文，管理任务、项目、焦点模式等全局状态
 */
import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppAction, TaskCategory } from '../types';
import { getItems } from '../api/interceptor';
import { getMockDataForAppContext } from '../api/mock';
import { useUser } from './UserContext';

// 从localStorage加载初始状态
const loadInitialState = (): AppState => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      // 确保状态包含所有必需的字段（向后兼容性）
      return {
        tasks: parsedState.tasks || [],
        projects: parsedState.projects || [],
        tickets: parsedState.tickets || [],
        focusMode: parsedState.focusMode || false,
        collections: parsedState.collections || []
      };
    } catch (error) {
      console.error('Failed to parse saved state:', error);
    }
  }
  
  // 如果没有保存的状态或解析失败，返回空状态
  return {
    tasks: [],
    projects: [],
    tickets: [],
    focusMode: false,
    collections: []
  };
};

// 检查是否为测试用户
// 改为接受用户参数的函数，避免依赖localStorage的异步更新
const isTestUserByData = (userData: any): boolean => {
  if (!userData) {
    console.log('🔍 用户检测: 未找到用户信息');
    return false;
  }
  
  console.log('🔍 用户检测: 用户数据', { username: userData.username, email: userData.email, id: userData.id });
  
  // 检查用户名是否为Shell或包含test
  const isTest = userData.username === 'Shell' || 
         userData.email === 'shell@test.com' ||
         userData.username?.includes('test') ||
         userData.id?.toString().includes('user-'); // 测试用户ID格式
         
  console.log('🔍 用户检测: 是否为测试用户?', isTest);
  return isTest;
};

// 注释掉未使用的函数，保留用于其他地方的兼容性
// const isTestUser = (): boolean => {
//   const user = localStorage.getItem('user');
//   if (!user) {
//     return false;
//   }
//   
//   try {
//     const userData = JSON.parse(user);
//     return isTestUserByData(userData);
//   } catch (error) {
//     return false;
//   }
// };

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
    case 'CLEAR_ALL_PROJECTS':
      newState = {
        ...state,
        projects: [],
      };
      break;
    case 'LOAD_PROJECTS':
      newState = {
        ...state,
        projects: action.payload,
      };
      break;
    case 'RESET_STATE':
      newState = {
        tasks: [],
        projects: [],
        tickets: [],
        focusMode: false,
        collections: []
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
  error: string | null;
  isTestUser: boolean;
}>({
  state: initialState,
  dispatch: () => null,
  refreshTasks: async () => {},
  isLoading: false,
  error: null,
  isTestUser: false,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userIsTest, setUserIsTest] = useState(false);
  const [hasLoadedTestData, setHasLoadedTestData] = useState(false);
  const [hasLoadedApiData, setHasLoadedApiData] = useState(false); // 新增：API数据缓存标记
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // 获取用户上下文
  const { state: userState } = useUser();
  
  // 监听用户状态变化 - 只负责重置状态，不立即加载数据
  useEffect(() => {
    const newUserId = userState.user?.id || null;
    const hasUserChanged = currentUserId !== newUserId;
    
    console.log('👤 用户状态变化监听:', {
      旧用户ID: currentUserId,
      新用户ID: newUserId,
      用户是否变化: hasUserChanged,
      是否已认证: userState.isAuthenticated
    });
    
    if (hasUserChanged) {
      console.log('🔄 检测到用户变化，重置应用状态');
      
      // 重置所有状态
      dispatch({ type: 'RESET_STATE' });
      
      // 重置加载状态
      setHasLoadedTestData(false);
      setHasLoadedApiData(false);
      setError(null);
      setIsLoading(false);
      
      // 更新当前用户ID
      setCurrentUserId(newUserId);
      
      // 注意：这里不立即加载数据，等待用户类型确定后再加载
    }
  }, [userState.user?.id, userState.isAuthenticated]);
  
  // 检查用户类型 - 只设置用户类型，不加载数据
  useEffect(() => {
    // 只有在有用户数据时才进行检查
    if (!userState.user || !currentUserId || !userState.isAuthenticated) {
      console.log('🔄 用户信息不完整，跳过用户类型检查');
      return;
    }
    
    const newUserType = isTestUserByData(userState.user);
    const userTypeChanged = newUserType !== userIsTest;
    
    console.log('🔄 检查用户类型:', {
      新用户类型: newUserType ? '测试用户' : '普通用户',
      用户类型是否变化: userTypeChanged,
      当前用户ID: currentUserId,
      是否已认证: userState.isAuthenticated
    });
    
    // 只更新用户类型状态，不加载数据
    if (userTypeChanged) {
      setUserIsTest(newUserType);
      
      // 重置加载状态
      setHasLoadedTestData(false);
      setHasLoadedApiData(false);
      
      console.log('✅ 用户类型已更新，数据加载将由各页面处理');
    }
  }, [userState.user, currentUserId, userState.isAuthenticated]);
  
  // 加载测试用户数据
  const loadTestUserData = () => {
    if (hasLoadedTestData) {
      console.log('🧪 测试数据已加载，跳过重复加载');
      return;
    }
    
    console.log('🧪 检测到测试用户，加载默认数据');
    
    // 清除错误状态
    setError(null);
    setIsLoading(false);
    
    const testData = getMockDataForAppContext();
    
    // 先清空现有数据，再加载测试数据，避免重复
    dispatch({ type: 'CLEAR_ALL_TASKS' });
    dispatch({ type: 'CLEAR_ALL_PROJECTS' });
    
    // 批量加载测试事项
    dispatch({
      type: 'LOAD_TASKS',
      payload: testData.tasks
    });
    
    // 批量加载测试项目
    dispatch({
      type: 'LOAD_PROJECTS',
      payload: testData.projects
    });
    
    setHasLoadedTestData(true);
    console.log('✅ 测试用户数据加载完成');
  };
  
  // 加载事项列表
  const loadTasks = async () => {
    // 检查是否为测试用户（使用UserContext数据）
    const userIsTestUser = userState.user ? isTestUserByData(userState.user) : false;
    console.log('🔍 检查用户类型:', userIsTestUser ? '测试用户' : '普通用户');
    
    if (userIsTestUser) {
      console.log('🧪 检测到测试用户，加载测试数据');
      loadTestUserData();
      return;
    }
    
    // 普通用户需要检查token
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('🚫 普通用户未登录，不加载数据');
      return;
    }
    
    // 检查是否已经加载过API数据
    if (hasLoadedApiData) {
      console.log('💾 API数据已缓存，跳过重复加载');
      return;
    }
    
    // 普通用户：从API获取数据
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🌐 普通用户登录，从API获取数据');
      const response = await getItems();
      
      if (!response.items || !Array.isArray(response.items)) {
        throw new Error('API返回数据格式错误');
      }
      
      // 转换API事项格式为应用内部格式
      const formattedTasks = response.items.map((apiTask: any) => {
        // 映射API的category_id字段到我们的TaskCategory枚举
        let mappedCategory: TaskCategory | undefined;
        switch (apiTask.category_id) {
          case 1:
            mappedCategory = TaskCategory.LIFE;
            break;
          case 2:
            mappedCategory = TaskCategory.HEALTH;
            break;
          case 3:
            mappedCategory = TaskCategory.WORK;
            break;
          case 4:
            mappedCategory = TaskCategory.STUDY;
            break;
          case 5:
            mappedCategory = TaskCategory.RELAX;
            break;
          case 6:
            mappedCategory = TaskCategory.EXPLORE;
            break;
          default:
            mappedCategory = TaskCategory.LIFE;
            break;
        }
        
        return {
          id: apiTask.id?.toString() || '',
          title: apiTask.title,
          completed: apiTask.status_id === 3, // 3表示已完成
          dueDate: apiTask.start_time ? apiTask.start_time.split('T')[0] : undefined,
          startTime: apiTask.start_time ? apiTask.start_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
          endTime: apiTask.end_time ? apiTask.end_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
          priority: (apiTask.priority >= 4 ? 'high' : apiTask.priority >= 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          category: mappedCategory,
          isAnytime: !apiTask.start_time, // 如果没有开始时间，则视为"随时可做"
        };
      });
      
      console.log(`✅ 成功获取 ${formattedTasks.length} 个事项`);
      
      // 更新状态
      dispatch({
        type: 'LOAD_TASKS',
        payload: formattedTasks
      });
      
      // 设置API数据已加载标记
      setHasLoadedApiData(true);
      
    } catch (error) {
      console.error('❌ 加载事项失败:', error);
      const errorMessage = error instanceof Error ? error.message : '获取数据失败，请检查网络连接';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
      };

  // 当状态改变时保存到localStorage
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

      return (
      <AppContext.Provider value={{ 
        state, 
        dispatch, 
        refreshTasks: loadTasks, 
        isLoading, 
        error, 
        isTestUser: userIsTest 
      }}>
        {children}
      </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext); 