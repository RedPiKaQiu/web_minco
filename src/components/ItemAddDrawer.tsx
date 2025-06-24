/**
 * 任务添加抽屉组件，提供完整的任务创建表单，支持设置时间、优先级、分类等属性
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plus, Calendar, Clock, MoreHorizontal, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createItem } from '../api/interceptor';

interface ItemAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ItemAddDrawer = ({ isOpen, onClose }: ItemAddDrawerProps) => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [itemTitle, setItemTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('今天');
  const [selectedTimeZone, setSelectedTimeZone] = useState<string | null>(null);
  const [showTimeZones, setShowTimeZones] = useState(true);
  const [isTimeZoneConfirmed, setIsTimeZoneConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 拖拽相关状态
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // 日历相关状态
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  
  // 处理拖拽开始
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };
  
  // 处理拖拽移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
    
    // 计算拖动距离
    const deltaY = e.touches[0].clientY - startY;
    
    // 只有向下拖动才应用变换
    if (deltaY > 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };
  
  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
    
    // 计算拖动距离
    const deltaY = e.clientY - startY;
    
    // 只有向下拖动才应用变换
    if (deltaY > 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };
  
  // 处理拖拽结束
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    // 如果拖动距离超过阈值，关闭抽屉
    if (deltaY > 100) {
      onClose();
    } else if (drawerRef.current) {
      // 否则恢复原位
      drawerRef.current.style.transform = 'translateY(0)';
    }
    
    setIsDragging(false);
  };
  
  // 处理鼠标松开
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    // 如果拖动距离超过阈值，关闭抽屉
    if (deltaY > 100) {
      onClose();
    } else if (drawerRef.current) {
      // 否则恢复原位
      drawerRef.current.style.transform = 'translateY(0)';
    }
    
    setIsDragging(false);
  };
  
  // 重置抽屉位置和事项标题
  useEffect(() => {
    if (!isOpen) {
      // 清空事项标题
      setItemTitle('');
      // 重置日期选择
      setSelectedDate('今天');
      // 重置时间区域选择
      setSelectedTimeZone(null);
      // 更新是否显示时间区域
      setShowTimeZones(true);
      // 重置时间区域确认状态
      setIsTimeZoneConfirmed(false);
      // 隐藏日历
      setShowCalendar(false);
      // 重置抽屉位置
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(0)';
      }
    }
  }, [isOpen]);
  
  const handleAddItem = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (itemTitle.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        // 根据日期选择设置事项day属性
        const today = new Date();
        let itemDay: string | undefined;
        let itemStartTime: string | undefined;
        
        switch (selectedDate) {
          case '今天':
            itemDay = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
            break;
          case '明天':
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            itemDay = tomorrow.toISOString().split('T')[0];
            break;
          case '随时':
            // 不设置特定日期
            itemDay = undefined;
            break;
          default:
            // 处理自定义日期，如"5月6日"格式
            if (selectedDate && selectedCalendarDate) {
              itemDay = selectedCalendarDate.toISOString().split('T')[0];
            } else if (selectedDate) {
              // 尝试解析自定义日期格式 (如 "5月6日")
              const match = selectedDate.match(/(\d+)月(\d+)日/);
              if (match) {
                const month = parseInt(match[1]) - 1; // 月份从0开始
                const day = parseInt(match[2]);
                const customDate = new Date(today.getFullYear(), month, day);
                
                // 如果日期已经过去，可能是指下一年
                if (customDate < today && month < today.getMonth()) {
                  customDate.setFullYear(today.getFullYear() + 1);
                }
                
                itemDay = customDate.toISOString().split('T')[0];
              } else {
                // 默认使用今天日期
                itemDay = today.toISOString().split('T')[0];
              }
            }
        }
        
        // 根据时间区域设置开始时间
        if (selectedTimeZone && itemDay) {
          const timeMap: Record<string, string> = {
            '上午': '09:00',
            '中午': '12:00',
            '下午': '14:00',
            '晚上': '19:00'
          };
          
          if (timeMap[selectedTimeZone]) {
            itemStartTime = timeMap[selectedTimeZone];
          }
        }
        
        // 根据时间区域设置时间段ID
        const getTimeSlotId = (timeZone: string | null): number => {
          if (!timeZone) return 5; // 随时
          
          const timeZoneMap: Record<string, number> = {
            '上午': 1,
            '中午': 2,
            '下午': 3,
            '晚上': 4
          };
          
          return timeZoneMap[timeZone] || 5;
        };
        
        const timeSlotId = getTimeSlotId(selectedTimeZone);
        const startTimeISO = itemStartTime && itemDay ? `${itemDay}T${itemStartTime}:00` : undefined;
        
        // 输出详细的事项创建信息日志
        console.log('🎯 ItemAddDrawer: 准备创建新事项', {
          title: itemTitle,
          selectedDate,
          selectedTimeZone,
          itemDay,
          itemStartTime,
          startTimeISO,
          timeSlotId,
          isAnytime: !startTimeISO
        });
        
        // 调用API创建事项
        const createData = {
          title: itemTitle,
          description: '',
          category_id: 1, // 默认分类：生活
          start_time: startTimeISO,
          priority: 3, // 默认优先级：中等
          time_slot_id: timeSlotId,
        };
        
        console.log('📤 ItemAddDrawer: 发送创建事项请求', createData);
        const result = await createItem(createData);
        console.log('✅ ItemAddDrawer: 收到服务器响应', result);
        
        // 创建成功后，更新本地状态
        const newTask = {
          id: result.id?.toString() || Date.now().toString(),
          title: result.title,
          completed: result.status_id === 3, // 3表示已完成
          isAnytime: !result.start_time,
          dueDate: result.start_time ? result.start_time.split('T')[0] : itemDay,
          startTime: result.start_time ? result.start_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
          endTime: result.end_time ? result.end_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
          priority: result.priority, // 直接使用数字priority
        };
        
        console.log('🏪 ItemAddDrawer: 更新本地状态', newTask);
        dispatch({
          type: 'ADD_TASK',
          payload: newTask,
        });
        
        // 完整更新所有相关缓存
        try {
          // 1. 更新时间轴缓存（主页和时间轴页面共享）
          const updateTimelineCache = (targetDate: string) => {
            const cacheKey = `timeline-tasks-${targetDate}`;
            const existingCache = sessionStorage.getItem(cacheKey);
            
            if (existingCache) {
              try {
                const cachedTasks = JSON.parse(existingCache);
                const updatedTasks = [...cachedTasks, result];
                sessionStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
                
                console.log(`✅ ItemAddDrawer: 已将新任务添加到时间轴缓存 [${targetDate}]`, { 
                  taskId: result.id, 
                  taskTitle: result.title,
                  totalTasks: updatedTasks.length 
                });
                return true;
              } catch (parseError) {
                console.error(`缓存解析失败 [${targetDate}]:`, parseError);
                return false;
              }
            }
            return false;
          };
          
          // 根据事项的实际日期更新对应的缓存
          let targetDate = new Date().toISOString().split('T')[0]; // 默认今天
          
          // 如果有start_time，使用start_time的日期
          if (result.start_time) {
            targetDate = result.start_time.split('T')[0];
          } else if (selectedDate === '明天') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDate = tomorrow.toISOString().split('T')[0];
          } else if (selectedCalendarDate) {
            targetDate = selectedCalendarDate.toISOString().split('T')[0];
          }
          
          const cacheUpdated = updateTimelineCache(targetDate);
          
          // 2. 更新时间轴缓存元数据
          const metadataKey = 'timeline-cache-metadata';
          let metadata = sessionStorage.getItem(metadataKey);
          let metadataObj: Record<string, number> = {};
          
          try {
            metadataObj = metadata ? JSON.parse(metadata) : {};
          } catch (error) {
            console.error('缓存元数据解析失败:', error);
            metadataObj = {};
          }
          
          metadataObj[targetDate] = Date.now();
          sessionStorage.setItem(metadataKey, JSON.stringify(metadataObj));
          
          // 3. 更新项目页面相关缓存（如果新任务有分类）
          if (result.category_id) {
            const projectCacheKey = `project-category-tasks-${result.category_id}`;
            const projectCache = sessionStorage.getItem(projectCacheKey);
            
            if (projectCache) {
              try {
                const projectTasks = JSON.parse(projectCache);
                const updatedProjectTasks = [...projectTasks, result];
                sessionStorage.setItem(projectCacheKey, JSON.stringify(updatedProjectTasks));
                
                                 // 更新项目缓存元数据
                 const projectMetadataKey = 'project-cache-metadata';
                 let projectMetadata = sessionStorage.getItem(projectMetadataKey);
                 let projectMetadataObj: Record<number, number> = {};
                 
                 try {
                   projectMetadataObj = projectMetadata ? JSON.parse(projectMetadata) : {};
                 } catch (error) {
                   projectMetadataObj = {};
                 }
                 
                 projectMetadataObj[result.category_id] = Date.now();
                sessionStorage.setItem(projectMetadataKey, JSON.stringify(projectMetadataObj));
                
                console.log('✅ ItemAddDrawer: 已将新任务添加到项目缓存', { 
                  categoryId: result.category_id,
                  taskId: result.id 
                });
              } catch (error) {
                console.error('更新项目缓存失败:', error);
              }
            }
          }
          
          // 4. 发送全局事件通知所有页面刷新
          console.log('📢 ItemAddDrawer: 发送缓存更新事件');
          window.dispatchEvent(new CustomEvent('taskCacheUpdated', {
            detail: { 
              action: 'add', 
              taskId: result.id, 
              taskTitle: result.title,
              categoryId: result.category_id,
              targetDate: targetDate,
              cacheUpdated: cacheUpdated
            }
          }));
          
          if (!cacheUpdated) {
            console.log('💾 ItemAddDrawer: 时间轴缓存不存在，新任务将在下次加载时显示');
          }
          
        } catch (error) {
          console.error('ItemAddDrawer: 更新缓存失败:', error);
        }
        
        // 重置所有状态
        setItemTitle('');
        setShowCalendar(false);
        onClose();
      } catch (error) {
        console.error('添加事项失败:', error);
        alert('添加事项失败，请重试');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const openNewTaskPage = () => {
    navigate('/new-task');
    onClose();
  };
  
  const handleDateSelect = (date: string) => {
    if (selectedDate === date) {
      // 如果点击已选中的日期，则取消选中
      setSelectedDate('');
      setShowTimeZones(false);
      setSelectedTimeZone(null);
      setIsTimeZoneConfirmed(false);
    } else {
      setSelectedDate(date);
      // 只有今天和明天显示时间区域选项
      const shouldShowTimeZones = date === '今天' || date === '明天';
      setShowTimeZones(shouldShowTimeZones);
      // 如果切换日期，重置时间区域选择
      if (isTimeZoneConfirmed) {
        setSelectedTimeZone(null);
        setIsTimeZoneConfirmed(false);
      }
    }
  };

  const handleClearDate = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    if (selectedDate === date) {
      setSelectedDate('');
      setShowTimeZones(false);
      setSelectedTimeZone(null);
      setIsTimeZoneConfirmed(false);
    }
  };

  const handleTimeZoneSelect = (timeZone: string) => {
    setSelectedTimeZone(timeZone);
    setIsTimeZoneConfirmed(true);
  };
  
  const handleClearTimeZone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTimeZone(null);
    setIsTimeZoneConfirmed(false);
    // 如果当前选择的是今天或明天，重新显示时间区域选项
    setShowTimeZones(selectedDate === '今天' || selectedDate === '明天');
  };
  
  const handleCalendarButtonClick = () => {
    // 显示或隐藏日历
    setShowCalendar(!showCalendar);
    
    // 重置日期选择
    if (!showCalendar) {
      setSelectedDate('');
      setShowTimeZones(false);
      setSelectedTimeZone(null);
      setIsTimeZoneConfirmed(false);
      
      // 设置当前月份为今天所在的月份
      setCurrentMonth(new Date());
    }
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // 格式化日期为 YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    const formattedToday = today.toISOString().split('T')[0];
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];
    
    // 如果选择的是今天或明天，设置预定义选项，否则设置自定义日期
    if (formattedDate === formattedToday) {
      setSelectedDate('今天');
    } else if (formattedDate === formattedTomorrow) {
      setSelectedDate('明天');
    } else {
      // 格式化为 M月D日 的形式
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setSelectedDate(`${month}月${day}日`);
    }
    
    // 隐藏日历
    setShowCalendar(false);
  };
  
  // 生成日历网格
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 获取当月第一天
    const firstDayOfMonth = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几（0 表示星期日，6 表示星期六）
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // 获取当月总天数
    const daysInMonth = lastDayOfMonth.getDate();
    
    // 添加上个月的日期填充第一周
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month - 1, prevMonthLastDay - firstDayOfWeek + i + 1);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false
      });
    }
    
    // 添加当月的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.getTime() === today.getTime();
      
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // 添加下个月的日期填充最后一周
    const daysNeeded = 42 - days.length; // 6行7列 = 42个日期单元格
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false
      });
    }
    
    return days;
  };
  
  if (!isOpen) return null;
  
  // 日期选项
  const dateOptions = ['今天', '明天', '随时'];
  
  // 时间区域选项
  const timeZoneOptions = ['上午', '中午', '下午', '晚上'];
  
  // 星期标题
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="fixed inset-0 bg-black/30 z-[9999]" onClick={onClose}>
      <div 
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-card rounded-t-2xl p-4 z-[10000] transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '85vh', 
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0)',
          width: '100%',
          overflow: 'auto'
        }}
      >
        {/* 顶部拖动条 */}
        <div 
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        ></div>
        
        {/* 输入框 */}
        <div className="mb-6">
          <input
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="准备做什么？"
            className="w-full text-lg px-2 py-3 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 bg-transparent text-app"
            autoFocus
          />
        </div>
        
        {/* 时间区域选择器 - 未确认时显示 */}
        {showTimeZones && !isTimeZoneConfirmed && !showCalendar && (
          <div className="flex overflow-x-auto py-2 space-x-2 mb-4">
            {timeZoneOptions.map((timeZone) => (
              <button 
                key={timeZone}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
                  selectedTimeZone === timeZone 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleTimeZoneSelect(timeZone)}
              >
                {timeZone}
              </button>
            ))}
          </div>
        )}
        
        {/* 日期选择器 */}
        {!showCalendar && (
          <div className="flex overflow-x-auto py-2 space-x-2 mb-4">
            {/* 显示选中的日期 */}
            {selectedDate && (
              <button 
                className="px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 bg-blue-100 text-blue-700 font-medium flex items-center"
              >
                <span 
                  onClick={(e) => handleClearDate(e, selectedDate)} 
                  className="mr-1 inline-flex items-center justify-center hover:bg-blue-200 rounded-full"
                >
                  <X size={14} />
                </span>
                {selectedDate}
                
                {/* 如果时间区域已确认，显示在日期右侧 */}
                {isTimeZoneConfirmed && selectedTimeZone && (
                  <span className="ml-1 flex items-center">
                    <span className="mx-1 text-gray-400">·</span>
                    <span 
                      onClick={(e) => handleClearTimeZone(e)} 
                      className="mr-1 inline-flex items-center justify-center hover:bg-blue-200 rounded-full"
                    >
                      <X size={14} />
                    </span>
                    {selectedTimeZone}
                  </span>
                )}
              </button>
            )}
            
            {/* 显示未选中的日期选项 */}
            {!isTimeZoneConfirmed && dateOptions.map((date) => (
              selectedDate !== date && (
                <button 
                  key={date}
                  className="px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 bg-gray-100 text-gray-700"
                  onClick={() => handleDateSelect(date)}
                >
                  {date}
                </button>
              )
            ))}
          </div>
        )}
        
        {/* 日历选择器 */}
        {showCalendar && (
          <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
            {/* 日历头部 - 月份和导航 */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h2 className="text-xl font-bold">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </h2>
              <div className="flex">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 mx-1 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 mx-1 text-gray-500 hover:text-gray-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            {/* 星期标题 */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {weekdays.map((day) => (
                <div 
                  key={day} 
                  className="text-gray-500 text-center py-2 text-sm font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日期网格 */}
            <div className="grid grid-cols-7">
              {generateCalendarDays().map((dayObj, index) => {
                const isSelected = selectedCalendarDate && 
                  dayObj.date.getDate() === selectedCalendarDate.getDate() && 
                  dayObj.date.getMonth() === selectedCalendarDate.getMonth() && 
                  dayObj.date.getFullYear() === selectedCalendarDate.getFullYear();
                
                return (
                  <button
                    key={index}
                    onClick={() => handleCalendarDateSelect(dayObj.date)}
                    className={`py-3 relative ${
                      dayObj.isCurrentMonth 
                        ? dayObj.isToday 
                          ? 'text-white' 
                          : 'text-gray-900' 
                        : 'text-gray-400'
                    } hover:bg-gray-100`}
                  >
                    <div className={`relative z-10 ${
                      dayObj.isToday ? 'font-bold' : ''
                    } ${
                      isSelected ? 'font-bold text-white' : ''
                    }`}>
                      {dayObj.day}
                    </div>
                    {/* 今天的圆形背景 */}
                    {dayObj.isToday && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full absolute z-0"></div>
                      </div>
                    )}
                    {/* 选中日期的圆形背景 */}
                    {isSelected && !dayObj.isToday && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full absolute z-0"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 底部工具栏 */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <button 
              onClick={handleCalendarButtonClick}
              className={`w-10 h-10 flex items-center justify-center ${showCalendar ? 'text-blue-500' : 'text-gray-500'}`} 
              aria-label="日历"
            >
              <Calendar size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-gray-500" aria-label="时钟">
              <Clock size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-gray-500" aria-label="拆分">
              <List size={20} />
            </button>
            <button 
              onClick={openNewTaskPage} 
              className="w-10 h-10 flex items-center justify-center text-gray-500"
              aria-label="更多选项"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => handleAddItem()} 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500'}`}
            disabled={!itemTitle.trim() || isSubmitting}
            aria-label="添加事项"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemAddDrawer; 