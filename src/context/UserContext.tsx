/**
 * 用户上下文管理，管理用户登录状态和用户信息
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';

// 定义上下文状态
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

// 定义可能的操作
type UserAction = 
  | { type: 'LOGIN', payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER', payload: Partial<User> };

// 初始状态
const initialState: UserState = {
  user: null,
  isAuthenticated: false
};

// 创建上下文
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// 定义 reducer
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOGIN':
      // 用户登录成功，设置标记以便下次页面访问时清理旧缓存
      // 这样既不影响当前的access_token，又能防止数据泄露
      localStorage.setItem('clearCacheOnNextLoad', 'true');
      console.log('🔑 UserContext: 用户登录成功，已设置清理缓存标记');
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT':
      // 用户退出时清理所有缓存，包括AI聊天数据
      clearAllUserCache();
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    default:
      return state;
  }
};

// 清理所有用户相关缓存的函数
const clearAllUserCache = () => {
  try {
    console.log('🧹 清理所有用户相关缓存');
    
    // 清理localStorage中的用户数据
    localStorage.removeItem('user');
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('appState');
    localStorage.removeItem('clearCacheOnNextLoad'); // 清理缓存标记
    
    // 清理AI聊天相关数据
    localStorage.removeItem('user-mood');
    localStorage.removeItem('available-time');
    
    // 清理测试用户数据
    localStorage.removeItem('mock_tasks');
    localStorage.removeItem('mock_projects');
    
    // 清理sessionStorage中的所有事项相关缓存
    clearSessionStorageCache();
    
    console.log('✅ 用户缓存清理完成');
  } catch (error) {
    console.error('❌ 清理用户缓存失败:', error);
  }
};

// 清理sessionStorage中的缓存数据
const clearSessionStorageCache = () => {
  // 1. 清理时间轴任务缓存
  sessionStorage.removeItem('timeline-cache-metadata');
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('timeline-tasks-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // 2. 清理项目任务缓存
  sessionStorage.removeItem('project-cache-metadata');
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('project-category-tasks-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // 3. 清理AI聊天相关的会话缓存
  sessionStorage.removeItem('recent-task-ids');
  sessionStorage.removeItem('current-project-ids');
  
  // 4. 清理其他可能的缓存
  Object.keys(sessionStorage).forEach(key => {
    // 清理所有task相关的缓存
    if (key.includes('task') || key.includes('item') || key.includes('cache')) {
      sessionStorage.removeItem(key);
    }
  });
};

// 创建 Provider 组件
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 从本地存储中恢复状态
  const [state, dispatch] = useReducer(userReducer, initialState, () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return {
          user: parsedUser,
          isAuthenticated: true
        };
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
    return initialState;
  });

  // 当状态改变时，更新本地存储
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);

  // 在UserProvider中添加全局事件监听
  useEffect(() => {
    const handleGlobalLogout = () => {
      dispatch({ type: 'LOGOUT' });
      // 可选：重定向到登录页
      window.location.href = '/login';
    };

    window.addEventListener('auth:logout', handleGlobalLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, [dispatch]);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// 创建自定义钩子
export const useUser = () => useContext(UserContext); 