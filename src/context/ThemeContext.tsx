import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 定义支持的主题类型
export type ThemeType = 'default' | 'ocean' | 'sunset' | 'forest' | 'dark';

// 定义主题上下文的类型
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

// 主题提供组件的 props 类型
interface ThemeProviderProps {
  children: ReactNode;
}

// 定义支持的主题类名
const THEME_CLASSES: Record<ThemeType, string> = {
  default: 'theme-default',
  ocean: 'theme-ocean',
  sunset: 'theme-sunset',
  forest: 'theme-forest',
  dark: 'theme-dark',
};

// 主题提供组件
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 从本地存储读取主题设置或使用默认主题
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'ocean';
  });

  // 当主题变化时更新文档类和本地存储
  useEffect(() => {
    // 移除所有主题类
    Object.values(THEME_CLASSES).forEach(className => {
      document.documentElement.classList.remove(className);
    });
    
    // 添加当前主题类
    document.documentElement.classList.add(THEME_CLASSES[theme]);
    
    // 保存选择到本地存储
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的自定义 Hook
export const useTheme = () => useContext(ThemeContext); 