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
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT':
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