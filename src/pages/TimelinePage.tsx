/**
 * 时间轴页面，按日期展示有明确时间安排的任务，支持日期切换和任务状态管理
 * 注意：过滤掉"随时"任务（time_slot_id=5），这类任务只在项目页面显示
 */
import { useState, useEffect, useRef } from 'react';
import { useTimelineTasks } from '../hooks/useItemData';
import { updateItem, deleteItem } from '../api/items';
import { Check, ChevronDown, ChevronRight, Calendar, ChevronLeft, Trash2 } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Task } from '../types';
import ItemDetailModal from '../components/ItemDetailModal';
import { adaptItemToTask } from '../utils/itemAdapters';



const TimelinePage = () => {
  // 使用新的时间轴数据hook
  const {
    selectedDate,
    incompleteTasks: apiIncompleteTasks,
    completedTasks: apiCompletedTasks,
    isLoading: timelineLoading,
    error: timelineError,
    updateSelectedDate,
    loadTasksByDate,
    refreshFromCache
  } = useTimelineTasks();
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'completed'>('timeline');
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('expanded');
  const [isWeekViewOpen, setIsWeekViewOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    上午: true,
    中午: true,
    下午: true,
    晚上: true,
  });

  // 左滑删除相关状态
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [swipePosition, setSwipePosition] = useState<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // 转换API数据为Task格式，并过滤掉"随时"任务（time_slot_id === 5）
  // 时间轴页面只显示有明确时间安排的任务，"随时"任务只在项目页面显示
  const incompleteTasks = apiIncompleteTasks
    .filter(apiItem => apiItem.time_slot_id !== 5) // 过滤掉随时任务
    .map(adaptItemToTask);
  const completedTasks = apiCompletedTasks
    .filter(apiItem => apiItem.time_slot_id !== 5) // 过滤掉随时任务
    .map(adaptItemToTask);
  const allTasks = [...incompleteTasks, ...completedTasks];

  // 页面初始化时的数据获取策略
  useEffect(() => {
    console.log('📅 TimelinePage: 初始化，检查是否需要清理缓存');
    
    // 检查是否需要清理缓存（用户刚登录）
    const needClearCache = localStorage.getItem('clearCacheOnNextLoad');
    if (needClearCache) {
      console.log('🧹 TimelinePage: 检测到需要清理缓存标记，清理旧缓存数据');
      // 清理可能的旧缓存数据，防止数据泄露
      sessionStorage.removeItem('timeline-cache-metadata');
      sessionStorage.removeItem('project-cache-metadata');
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('timeline-tasks-') || 
            key.startsWith('project-category-tasks-') || 
            key.includes('task') || 
            key.includes('item') || 
            key.includes('cache')) {
          sessionStorage.removeItem(key);
        }
      });
      // 移除标记，避免重复清理
      localStorage.removeItem('clearCacheOnNextLoad');
      console.log('✅ TimelinePage: 旧缓存清理完成，强制从后端加载');
      loadTasksByDate(selectedDate, true); // 强制重新加载
    } else {
      console.log('📅 TimelinePage: 正常页面访问，使用缓存优化加载当天任务');
      loadTasksByDate(selectedDate); // 正常加载，会自动检查缓存
    }
  }, [loadTasksByDate]);

  // 监听页面焦点，返回页面时刷新缓存数据
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ TimelinePage: 页面重新获得焦点，尝试刷新缓存');
      const refreshed = refreshFromCache();
      if (!refreshed) {
        console.log('📡 TimelinePage: 缓存刷新失败，重新加载数据');
        loadTasksByDate(selectedDate);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 TimelinePage: 页面变为可见，尝试刷新缓存');
        const refreshed = refreshFromCache();
        if (!refreshed) {
          console.log('📡 TimelinePage: 缓存刷新失败，重新加载数据');
          loadTasksByDate(selectedDate);
        }
      }
    };

    // 监听任务缓存更新事件
    const handleTaskCacheUpdated = (event: CustomEvent) => {
      console.log('📢 TimelinePage: 收到任务缓存更新事件', event.detail);
      const refreshed = refreshFromCache();
      if (!refreshed) {
        console.log('📡 TimelinePage: 缓存刷新失败，重新加载数据');
        loadTasksByDate(selectedDate);
      }
    };

    // 点击页面其他地方时重置滑动状态
    const handleClickOutside = () => {
      if (swipedTaskId) {
        resetSwipe();
      }
    };

    // 键盘事件处理（ESC键取消删除状态）
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && swipedTaskId) {
        resetSwipe();
        console.log('⌨️ TimelinePage: ESC键取消删除状态');
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('taskCacheUpdated', handleTaskCacheUpdated as EventListener);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('taskCacheUpdated', handleTaskCacheUpdated as EventListener);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refreshFromCache, loadTasksByDate, selectedDate, swipedTaskId]);

  // 时间段配置 - 移除"随时"选项，时间轴页面只显示有明确时间安排的任务
  const timeSlots = [
    { id: '上午', label: '上午', emoji: '🌅' },
    { id: '中午', label: '中午', emoji: '🌞' },
    { id: '下午', label: '下午', emoji: '☀️' },
    { id: '晚上', label: '晚上', emoji: '🌙' },
  ];

  // 根据事项分组
  const groupedTasks = incompleteTasks.reduce((groups, task) => {
    const timeOfDay = getTimeOfDay(task.startTime);
    if (!groups[timeOfDay]) {
      groups[timeOfDay] = [];
    }
    groups[timeOfDay].push(task);
    return groups;
  }, {} as Record<string, typeof incompleteTasks>);

  // 按时间排序的所有任务（用于展开模式的平铺显示）
  const sortedTasks = incompleteTasks.sort((a, b) => {
    const timeA = parseTime(a.startTime);
    const timeB = parseTime(b.startTime);
    return timeA - timeB;
  });

  // 解析时间为数字，用于排序
  function parseTime(startTime?: string): number {
    if (!startTime) return 2400; // 没有时间信息的任务放在最后
    
    let hour = 0;
    
    // 处理多种时间格式
    if (startTime.includes('上午')) {
      const match = startTime.match(/上午\s*(\d{1,2})/);
      if (match) {
        hour = parseInt(match[1]);
        if (hour === 12) hour = 0; // 上午12点 = 0点
      }
    } else if (startTime.includes('下午')) {
      const match = startTime.match(/下午\s*(\d{1,2})/);
      if (match) {
        hour = parseInt(match[1]);
        if (hour !== 12) hour += 12; // 下午1点-11点加12
      }
    } else if (startTime.includes('中午')) {
      hour = 12;
    } else if (startTime.includes('晚上')) {
      const match = startTime.match(/晚上\s*(\d{1,2})/);
      if (match) {
        const h = parseInt(match[1]);
        hour = h >= 6 ? h + 12 : h;
      }
    } else {
      // 直接是数字格式
      const match = startTime.match(/^(\d{1,2})/);
      if (match) {
        hour = parseInt(match[1]);
      }
    }
    
    // 提取分钟
    const minuteMatch = startTime.match(/:(\d{2})/);
    const minute = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return hour * 100 + minute; // 转换为HHMM格式的数字
  }

  // 获取本周日期
  const getWeekDates = () => {
    const startOfThisWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }); // 周一开始
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfThisWeek, i));
    }
    return dates;
  };

  const weekDates = getWeekDates();

  function getTimeOfDay(startTime?: string): string {
    if (!startTime) return '晚上'; // 没有时间信息的任务默认归到晚上
    
    // 处理多种时间格式
    let hourStr = '';
    
    // 匹配 "上午 10:00" 或 "上午10:00" 格式
    if (startTime.includes('上午')) {
      const match = startTime.match(/上午\s*(\d{1,2})/);
      if (match) {
        hourStr = match[1];
      }
    }
    // 匹配 "下午 2:00" 或 "下午2:00" 格式  
    else if (startTime.includes('下午')) {
      const match = startTime.match(/下午\s*(\d{1,2})/);
      if (match) {
        const hour = parseInt(match[1]);
        hourStr = (hour === 12 ? 12 : hour + 12).toString(); // 下午12点仍为12，其他加12
      }
    }
    // 匹配 "中午 12:00" 格式
    else if (startTime.includes('中午')) {
      hourStr = '12';
    }
    // 匹配 "晚上 8:00" 格式
    else if (startTime.includes('晚上')) {
      const match = startTime.match(/晚上\s*(\d{1,2})/);
      if (match) {
        const hour = parseInt(match[1]);
        hourStr = (hour >= 6 ? hour + 12 : hour).toString(); // 晚上6点后加12，晚上1-5点不加
      }
    }
    // 直接是 "10:00" 或 "10" 格式
    else {
      const match = startTime.match(/^(\d{1,2})/);
      if (match) {
        hourStr = match[1];
      }
    }
    
    if (!hourStr) {
      console.log('无法解析时间格式:', startTime);
      return '晚上'; // 默认归到晚上
    }
    
    const hour = parseInt(hourStr);
    console.log(`解析时间: "${startTime}" -> 小时: ${hour}`);
    
    if (hour >= 6 && hour < 12) return '上午';
    if (hour >= 12 && hour < 14) return '中午';  
    if (hour >= 14 && hour < 18) return '下午';
    if (hour >= 18 || hour < 6) return '晚上';
    return '晚上'; // 默认情况
  }

  const handlePrevDay = () => {
    const prevDay = subDays(selectedDate, 1);
    updateSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    updateSelectedDate(nextDay);
  };

  const handleToday = () => {
    updateSelectedDate(new Date());
  };

  const toggleWeekView = () => {
    setIsWeekViewOpen(!isWeekViewOpen);
  };

  const selectDate = (date: Date) => {
    updateSelectedDate(date);
    setIsWeekViewOpen(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 切换视图模式
  const handleViewModeChange = () => {
    const newMode = viewMode === 'compact' ? 'expanded' : 'compact';
    setViewMode(newMode);
    
    // 如果切换到紧凑模式，收起所有区域（仅在紧凑模式下使用分组）
    if (newMode === 'compact') {
      setExpandedSections({
        上午: false,
        中午: false,
        下午: false,
        晚上: false,
      });
    } else {
      // 展开模式下不需要区域展开状态，因为直接平铺显示
      setExpandedSections({
        上午: true,
        中午: true,
        下午: true,
        晚上: true,
      });
    }
  };

  // 专门用于时间轴页面的任务完成函数
  const toggleTaskCompletionForTimeline = async (taskId: string, currentCompleted: boolean) => {
    console.log('🎯 toggleTaskCompletionForTimeline 被调用:', { taskId, currentCompleted });
    
    try {
      console.log('🚀 准备调用 updateItem API...');
      
      // 调用API更新事项状态 - 切换到相反的状态
      const updateData = {
        status_id: currentCompleted ? 1 : 3, // 如果当前已完成，则设为pending(1)；如果当前未完成，则设为completed(3)
      };
      
      console.log('📋 updateItem 请求数据:', updateData);
      
      const result = await updateItem(taskId, updateData);
      
      console.log('✅ updateItem API 调用成功:', result);
      
      return result;
    } catch (error) {
      console.error('❌ 更新事项状态失败:', error);
      throw error;
    }
  };

  const handleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    console.log('📅 TimelinePage: handleComplete 被调用', { id });

    // 找到当前任务
    const task = incompleteTasks.find(t => t.id === id) || completedTasks.find(t => t.id === id);
    if (!task) {
      console.error('❌ TimelinePage: 未找到任务', { id });
      return;
    }

    // 如果任务未完成，显示烟花特效
    if (!task.completed) {
      // 烟花特效
      const button = e.currentTarget as HTMLElement;
      for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#E040FB'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.className = 'absolute rounded-full';
        particle.style.backgroundColor = color;
        particle.style.width = `${2 + Math.random() * 3}px`;
        particle.style.height = `${2 + Math.random() * 3}px`;
        button.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
          duration: 800 + Math.random() * 700,
          easing: 'cubic-bezier(0, .9, .57, 1)'
        });

        setTimeout(() => particle.remove(), 1500);
      }
    }

    try {
      // 使用专门的任务完成函数调用API
      await toggleTaskCompletionForTimeline(id, task.completed);
      
      // API调用成功后，直接更新本地缓存和状态
      const currentAllTasks = [...apiIncompleteTasks, ...apiCompletedTasks];
      const updatedTasks = currentAllTasks.map(apiTask => {
        if (apiTask.id === id) {
          // 切换任务完成状态：如果当前已完成(status_id=3)，改为未完成(status_id=1)；反之亦然
          return {
            ...apiTask,
            status_id: apiTask.status_id === 3 ? 1 : 3
          };
        }
        return apiTask;
      });
      
      // 更新缓存数据
      try {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const timestamp = Date.now();
        
        // 更新sessionStorage缓存
        sessionStorage.setItem(`timeline-tasks-${dateKey}`, JSON.stringify(updatedTasks));
        
        // 更新缓存元数据
        const metadata = (() => {
          try {
            const existing = sessionStorage.getItem('timeline-cache-metadata');
            return existing ? JSON.parse(existing) : {};
          } catch {
            return {};
          }
        })();
        metadata[dateKey] = timestamp;
        sessionStorage.setItem('timeline-cache-metadata', JSON.stringify(metadata));
        
        console.log('💾 TimelinePage: 任务完成状态缓存已更新', { 
          taskId: id,
          dateKey,
          taskCount: updatedTasks.length
        });
      } catch (cacheError) {
        console.error('更新任务完成状态缓存失败:', cacheError);
      }
      
      // 强制刷新页面数据从缓存
      const refreshed = refreshFromCache();
      if (!refreshed) {
        // 如果缓存刷新失败，强制重新加载
        console.log('📡 TimelinePage: 缓存刷新失败，强制重新加载数据');
        await loadTasksByDate(selectedDate);
      }
      
      console.log('✅ TimelinePage: 任务完成状态更新成功');
    } catch (error) {
      console.error('❌ TimelinePage: 更新任务完成状态失败', error);
      // 如果API调用失败，不更新缓存，保持原状态
    }
  };

  // 处理左滑删除（移动端）
  const handleTouchStart = (e: React.TouchEvent, _taskId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent, taskId: string) => {
    if (swipedTaskId && swipedTaskId !== taskId) {
      // 如果有其他任务正在滑动，先重置它
      setSwipedTaskId(null);
      setSwipePosition(0);
    }

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchStartX.current - touchX;
    const deltaY = Math.abs(touchStartY.current - touchY);

    // 如果垂直滑动距离大于水平滑动距离，不触发左滑
    if (deltaY > Math.abs(deltaX)) {
      return;
    }

    // 只处理向左滑动
    if (deltaX > 10) {
      isDragging.current = true;
      e.preventDefault(); // 防止页面滚动
      
      const maxSwipe = 80; // 最大滑动距离
      const swipeDistance = Math.min(deltaX, maxSwipe);
      
      setSwipedTaskId(taskId);
      setSwipePosition(swipeDistance);
    }
  };

  const handleTouchEnd = (_e: React.TouchEvent, _taskId: string) => {
    if (isDragging.current) {
      // 如果滑动距离超过阈值，保持显示删除按钮
      if (swipePosition > 40) {
        setSwipePosition(80); // 完全显示删除按钮
      } else {
        // 否则回弹
        setSwipedTaskId(null);
        setSwipePosition(0);
      }
    }
    isDragging.current = false;
  };

  // 处理鼠标右键（PC端）
  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault(); // 阻止默认的右键菜单
    
    // 如果有其他任务正在显示删除按钮，先重置
    if (swipedTaskId && swipedTaskId !== taskId) {
      setSwipedTaskId(null);
      setSwipePosition(0);
    }
    
    // 如果当前任务已经显示删除按钮，则隐藏；否则显示
    if (swipedTaskId === taskId) {
      setSwipedTaskId(null);
      setSwipePosition(0);
    } else {
      setSwipedTaskId(taskId);
      setSwipePosition(80); // 直接完全显示删除按钮
    }
    
    console.log('🖱️ TimelinePage: 鼠标右键显示删除按钮', { taskId });
  };

  // 重置滑动状态
  const resetSwipe = () => {
    setSwipedTaskId(null);
    setSwipePosition(0);
  };

  // 删除事项
  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      console.log('🗑️ TimelinePage: 开始删除事项', { taskId });
      
      // 调用删除API
      await deleteItem(taskId);
      console.log('✅ TimelinePage: 删除事项API调用成功');
      
      // 更新本地缓存
      const currentAllTasks = [...apiIncompleteTasks, ...apiCompletedTasks];
      const updatedTasks = currentAllTasks.filter(task => task.id !== taskId);
      
      // 更新sessionStorage缓存
      try {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const timestamp = Date.now();
        
        sessionStorage.setItem(`timeline-tasks-${dateKey}`, JSON.stringify(updatedTasks));
        
        // 更新缓存元数据
        const metadata = (() => {
          try {
            const existing = sessionStorage.getItem('timeline-cache-metadata');
            return existing ? JSON.parse(existing) : {};
          } catch {
            return {};
          }
        })();
        metadata[dateKey] = timestamp;
        sessionStorage.setItem('timeline-cache-metadata', JSON.stringify(metadata));
        
        console.log('💾 TimelinePage: 删除事项缓存已更新', { 
          taskId,
          dateKey,
          taskCount: updatedTasks.length
        });
      } catch (cacheError) {
        console.error('更新删除事项缓存失败:', cacheError);
      }
      
      // 发送全局事件通知其他页面
      window.dispatchEvent(new CustomEvent('taskCacheUpdated', {
        detail: { action: 'delete', taskId }
      }));
      
      // 重置滑动状态
      resetSwipe();
      
      // 强制刷新页面数据从缓存
      const refreshed = refreshFromCache();
      if (!refreshed) {
        console.log('📡 TimelinePage: 缓存刷新失败，强制重新加载数据');
        await loadTasksByDate(selectedDate);
      }
      
      console.log('✅ TimelinePage: 事项删除完成');
    } catch (error) {
      console.error('❌ TimelinePage: 删除事项失败', error);
      // 删除失败时重置滑动状态
      resetSwipe();
    }
  };

  const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
    // 如果当前有滑动状态，点击重置
    if (swipedTaskId) {
      resetSwipe();
      return;
    }
    
    // 不要在点击完成按钮或删除按钮时打开模态框
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // 查找选中的任务数据
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setSelectedTask(task);
    }
  };

  const isToday = isSameDay(selectedDate, new Date());

  // 判断当前视图模式
  const isCurrentlyExpanded = viewMode === 'expanded';

  // 使用新的loading和error状态
  const isLoading = timelineLoading;
  const error = timelineError;

  const renderHeader = () => (
    <div className="py-4 space-y-4">
      {/* 日期导航 - 优化布局防止换行 */}
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center flex-shrink-0">
          <button 
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target no-tap-highlight"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button 
            onClick={toggleWeekView}
            className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors touch-target no-tap-highlight min-w-0 flex-shrink-0"
          >
            <span className="text-sm sm:text-base whitespace-nowrap">{format(selectedDate, 'MM月dd日 EEEE', { locale: zhCN })}</span>
            <Calendar className="h-4 w-4 ml-1 flex-shrink-0" />
          </button>

          <button 
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target no-tap-highlight"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {!isToday && (
            <button 
              onClick={handleToday}
              className="px-2 py-1 border border-gray-300 rounded-lg text-xs whitespace-nowrap hover:bg-gray-50 transition-colors touch-target no-tap-highlight"
            >
              今日
            </button>
          )}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 whitespace-nowrap">
              {isCurrentlyExpanded ? '紧凑' : '展开'}
            </label>
            <button
              onClick={handleViewModeChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out touch-target no-tap-highlight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isCurrentlyExpanded 
                  ? 'bg-blue-500 shadow-md' 
                  : 'bg-gray-300 shadow-sm'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-lg ${
                  isCurrentlyExpanded ? 'translate-x-6 scale-110' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 周视图 */}
      {isWeekViewOpen && (
        <div className="flex justify-between items-center bg-white rounded-lg p-2 border overflow-x-auto custom-scrollbar">
          {weekDates.map(date => {
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentDay = isSameDay(date, new Date());

            return (
              <button
                key={date.toString()}
                onClick={() => selectDate(date)}
                className={`flex flex-col items-center min-w-[3rem] px-2 py-1 rounded-lg transition-colors touch-target no-tap-highlight ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : isCurrentDay 
                    ? 'border border-blue-600 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xs">{format(date, 'EEE', { locale: zhCN })}</span>
                <span className="text-lg font-semibold">
                  {format(date, 'dd')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 标签页 */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors touch-target no-tap-highlight ${
            activeTab === 'timeline'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          时间轴
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors touch-target no-tap-highlight ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          已完成
        </button>
      </div>
      
      {/* 操作提示 */}
      {(incompleteTasks.length > 0 || completedTasks.length > 0) && (
        <div className="text-xs text-gray-500 text-center py-1">
          <span className="hidden sm:inline">右键单击事项可删除，或在移动设备上左滑删除</span>
          <span className="sm:hidden">左滑事项可删除</span>
        </div>
      )}
    </div>
  );

  const renderCompactView = () => (
    <div className="py-2 space-y-3">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          正在加载任务...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>加载任务失败: {error}</p>
          <button 
            onClick={() => loadTasksByDate(selectedDate)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      ) : incompleteTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">暂无已安排时间的事项</div>
          <div className="text-sm text-gray-400">
            提示：时间轴只显示有明确时间安排的事项<br/>
            "随时"事项请在项目页面查看
          </div>
        </div>
      ) : (
        timeSlots.map(slot => {
          const sectionTasks = groupedTasks[slot.id] || [];
          
          return (
            <div key={slot.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors touch-target no-tap-highlight border-b"
                onClick={() => toggleSection(slot.id)}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{slot.emoji}</span>
                  <h3 className="font-medium text-gray-700">{slot.label}</h3>
                  <span className="ml-2 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {sectionTasks.length}
                  </span>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-200 transition-colors touch-target">
                  {expandedSections[slot.id] ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>

              {expandedSections[slot.id] && (
                <div className="space-y-1">
                  {sectionTasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">暂无事项</div>
                  ) : (
                    sectionTasks.map(task => (
                      <div
                        key={task.id}
                        className="relative overflow-hidden border-b border-gray-100 last:border-b-0"
                      >
                        <div
                          className="p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 no-tap-highlight"
                          style={{
                            transform: swipedTaskId === task.id ? `translateX(-${swipePosition}px)` : 'translateX(0)',
                          }}
                          onClick={(e) => handleTaskClick(task.id, e)}
                          onTouchStart={(e) => handleTouchStart(e, task.id)}
                          onTouchMove={(e) => handleTouchMove(e, task.id)}
                          onTouchEnd={(e) => handleTouchEnd(e, task.id)}
                          onContextMenu={(e) => handleContextMenu(e, task.id)}
                        >
                          <div className="flex items-center">
                            <button
                              onClick={(e) => handleComplete(task.id, e)}
                              className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center mr-3 relative hover:bg-gray-50 touch-target no-tap-highlight"
                            >
                              <Check className="h-2 w-2" />
                            </button>

                            <div className="flex-grow min-w-0">
                              <div className="font-medium truncate">{task.title}</div>
                              {task.startTime && (
                                <div className="text-sm text-gray-500">{task.startTime}</div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {task.icon && <div className="text-lg">{task.icon}</div>}
                              {task.duration && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {task.duration}
                                </span>
                              )}
                              {task.category && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {task.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 删除按钮 */}
                        {swipedTaskId === task.id && (
                          <div 
                            className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center"
                            style={{
                              transform: `translateX(${80 - swipePosition}px)`,
                            }}
                          >
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-red-600 transition-colors touch-target group"
                              title="删除事项"
                            >
                              <Trash2 className="h-4 w-4 mb-0.5" />
                              <span className="text-xs hidden sm:block">删除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderExpandedView = () => (
    <div className="py-2 space-y-2">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          正在加载任务...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>加载任务失败: {error}</p>
          <button 
            onClick={() => loadTasksByDate(selectedDate)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      ) : incompleteTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">暂无已安排时间的事项</div>
          <div className="text-sm text-gray-400">
            提示：时间轴只显示有明确时间安排的事项<br/>
            "随时"事项请在项目页面查看
          </div>
        </div>
      ) : (
        sortedTasks.map(task => (
          <div
            key={task.id}
            className="relative overflow-hidden bg-white rounded-lg border"
          >
            <div
              className="p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 no-tap-highlight"
              style={{
                transform: swipedTaskId === task.id ? `translateX(-${swipePosition}px)` : 'translateX(0)',
              }}
              onClick={(e) => handleTaskClick(task.id, e)}
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchMove={(e) => handleTouchMove(e, task.id)}
              onTouchEnd={(e) => handleTouchEnd(e, task.id)}
              onContextMenu={(e) => handleContextMenu(e, task.id)}
            >
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <button
                    onClick={(e) => handleComplete(task.id, e)}
                    className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center relative hover:bg-gray-50 touch-target no-tap-highlight flex-shrink-0 mr-2"
                  >
                    <Check className="h-2 w-2" />
                  </button>
                  {task.startTime && (
                    <div className="text-sm text-gray-500 whitespace-nowrap">{task.startTime}</div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="font-medium truncate">{task.title}</div>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {task.icon && <div className="text-lg">{task.icon}</div>}
                  {task.duration && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs whitespace-nowrap">
                      {task.duration}
                    </span>
                  )}
                  {task.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs whitespace-nowrap">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 删除按钮 */}
            {swipedTaskId === task.id && (
              <div 
                className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center rounded-r-lg"
                style={{
                  transform: `translateX(${80 - swipePosition}px)`,
                }}
              >
                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-red-600 transition-colors touch-target rounded-r-lg group"
                  title="删除事项"
                >
                  <Trash2 className="h-4 w-4 mb-0.5" />
                  <span className="text-xs hidden sm:block">删除</span>
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderCompletedView = () => (
    <div className="py-2 space-y-2">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          正在加载已完成任务...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>加载任务失败: {error}</p>
          <button 
            onClick={() => loadTasksByDate(selectedDate)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      ) : completedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">暂无已完成的事项</div>
          <div className="text-sm text-gray-400">
            提示：时间轴只显示有明确时间安排的事项<br/>
            "随时"事项请在项目页面查看
          </div>
        </div>
      ) : (
        completedTasks.map(task => (
          <div
            key={task.id}
            className="relative overflow-hidden bg-white rounded-lg shadow-sm border opacity-75"
          >
            <div
              className="p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50"
              style={{
                transform: swipedTaskId === task.id ? `translateX(-${swipePosition}px)` : 'translateX(0)',
              }}
              onClick={(e) => handleTaskClick(task.id, e)}
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchMove={(e) => handleTouchMove(e, task.id)}
              onTouchEnd={(e) => handleTouchEnd(e, task.id)}
              onContextMenu={(e) => handleContextMenu(e, task.id)}
            >
              <div className="flex items-center">
                <button
                  onClick={(e) => handleComplete(task.id, e)}
                  className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mr-3 relative hover:bg-green-600 touch-target no-tap-highlight transition-colors"
                  title="点击取消完成"
                >
                  <Check className="h-3 w-3 text-white" />
                </button>

                <div className="flex-grow">
                  <div className="font-medium line-through text-gray-500">{task.title}</div>
                  {task.startTime && (
                    <div className="text-sm text-gray-400">{task.startTime}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {task.icon && <div className="text-lg opacity-50">{task.icon}</div>}
                  {task.duration && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                      {task.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 删除按钮 */}
            {swipedTaskId === task.id && (
              <div 
                className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center rounded-r-lg"
                style={{
                  transform: `translateX(${80 - swipePosition}px)`,
                }}
              >
                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-red-600 transition-colors touch-target rounded-r-lg group"
                  title="删除事项"
                >
                  <Trash2 className="h-4 w-4 mb-0.5" />
                  <span className="text-xs hidden sm:block">删除</span>
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <div className="page-content safe-area-top">
        {renderHeader()}
        
        {activeTab === 'timeline' ? (
          viewMode === 'compact' ? renderCompactView() : renderExpandedView()
        ) : (
          renderCompletedView()
        )}
      </div>
      
      {selectedTaskId && selectedTask && (
        <ItemDetailModal 
          task={selectedTask}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedTask(null);
          }}
        />
      )}
      

    </>
  );
};

export default TimelinePage; 