import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeType } from '../types';

// 定义主题上下文的类型
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  userSelectedTheme: ThemeType;
  setUserSelectedTheme: (theme: ThemeType) => void;
  currentTime: string;
  setCurrentTime: (time: string) => void;
  isAutoThemeEnabled: boolean;
  setIsAutoThemeEnabled: (enabled: boolean) => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  userSelectedTheme: 'default',
  setUserSelectedTheme: () => {},
  currentTime: '12:00',
  setCurrentTime: () => {},
  isAutoThemeEnabled: true,
  setIsAutoThemeEnabled: () => {}
});

// 主题提供组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 当前实际应用的主题
  const [theme, setTheme] = useState<ThemeType>('default');
  // 用户选择的主题（非自动模式时使用）
  const [userSelectedTheme, setUserSelectedTheme] = useState<ThemeType>('default');
  // 当前时间设置
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  // 是否启用自动主题切换
  const [isAutoThemeEnabled, setIsAutoThemeEnabled] = useState(true);

  useEffect(() => {
    // 从本地存储加载设置
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    const savedUserTheme = localStorage.getItem('userSelectedTheme') as ThemeType;
    const savedTime = localStorage.getItem('currentTime');
    const savedAutoTheme = localStorage.getItem('autoThemeEnabled');
    
    if (savedUserTheme && ['default', 'sunset', 'forest', 'dark'].includes(savedUserTheme)) {
      setUserSelectedTheme(savedUserTheme);
    }
    
    if (savedTheme && ['default', 'sunset', 'forest', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    
    if (savedTime) {
      setCurrentTime(savedTime);
    } else {
      // 设置为当前时间
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    }
    
    if (savedAutoTheme !== null) {
      setIsAutoThemeEnabled(savedAutoTheme === 'true');
    }
  }, []);

  // 自动根据时间切换主题
  useEffect(() => {
    if (isAutoThemeEnabled) {
      const [hours] = currentTime.split(':').map(Number);
      // 晚上8点后自动切换到暗色主题
      if (hours >= 20 || hours < 6) {
        setTheme('dark');
      } else {
        // 白天使用用户选择的主题
        setTheme(userSelectedTheme);
      }
    } else {
      // 非自动模式直接使用用户选择的主题
      setTheme(userSelectedTheme);
    }
  }, [isAutoThemeEnabled, currentTime, userSelectedTheme]);

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('userSelectedTheme', userSelectedTheme);
    localStorage.setItem('currentTime', currentTime);
    localStorage.setItem('autoThemeEnabled', String(isAutoThemeEnabled));
    
    // 应用主题类到HTML元素
    document.documentElement.className = `theme-${theme}`;
  }, [theme, userSelectedTheme, currentTime, isAutoThemeEnabled]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        userSelectedTheme, 
        setUserSelectedTheme, 
        currentTime, 
        setCurrentTime, 
        isAutoThemeEnabled, 
        setIsAutoThemeEnabled 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的自定义 Hook
export const useTheme = () => useContext(ThemeContext); 