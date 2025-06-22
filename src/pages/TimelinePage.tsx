import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { Check, ChevronDown, ChevronRight, Calendar, ChevronLeft } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TaskDetailModal from '../components/TaskDetailModal';

const TimelinePage = () => {
  const { state } = useAppContext();
  const { toggleTaskCompletion } = useTaskCompletion();
  const [activeTab, setActiveTab] = useState<'timeline' | 'completed'>('timeline');
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('expanded');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isWeekViewOpen, setIsWeekViewOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    上午: true,
    中午: true,
    下午: true,
    晚上: true,
    随时: true,
  });

  // 过滤未完成的事项
  const incompleteTasks = state.tasks.filter(task => !task.completed);
  const completedTasks = state.tasks.filter(task => task.completed);

  // 时间段配置
  const timeSlots = [
    { id: '上午', label: '上午', emoji: '🌅' },
    { id: '中午', label: '中午', emoji: '🌞' },
    { id: '下午', label: '下午', emoji: '☀️' },
    { id: '晚上', label: '晚上', emoji: '🌙' },
    { id: '随时', label: '随时', emoji: '⏰' },
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
    if (!startTime || startTime === '随时') return 2400; // 随时放在最后
    
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
    if (!startTime || startTime === '随时') return '随时';
    
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
      return '随时';
    }
    
    const hour = parseInt(hourStr);
    console.log(`解析时间: "${startTime}" -> 小时: ${hour}`);
    
    if (hour >= 6 && hour < 12) return '上午';
    if (hour >= 12 && hour < 14) return '中午';  
    if (hour >= 14 && hour < 18) return '下午';
    if (hour >= 18 || hour < 6) return '晚上';
    return '随时';
  }

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const toggleWeekView = () => {
    setIsWeekViewOpen(!isWeekViewOpen);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
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
        随时: false,
      });
    } else {
      // 展开模式下不需要区域展开状态，因为直接平铺显示
      setExpandedSections({
        上午: true,
        中午: true,
        下午: true,
        晚上: true,
        随时: true,
      });
    }
  };

  const handleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    console.log('📅 TimelinePage: handleComplete 被调用', { id });

    // 找到当前任务
    const task = state.tasks.find(t => t.id === id);
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
      // 使用useTaskCompletion hook调用API
      await toggleTaskCompletion(id, task.completed);
      console.log('✅ TimelinePage: 任务完成状态更新成功');
    } catch (error) {
      console.error('❌ TimelinePage: 更新任务完成状态失败', error);
    }
  };

  const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
    // 不要在点击完成按钮时打开模态框
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedTaskId(taskId);
  };

  const isToday = isSameDay(selectedDate, new Date());

  // 判断当前视图模式
  const isCurrentlyExpanded = viewMode === 'expanded';

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
    </div>
  );

  const renderCompactView = () => (
    <div className="py-2 space-y-3">
      {incompleteTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无事项</div>
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
                        className="p-3 cursor-pointer transition-colors hover:bg-gray-50 no-tap-highlight border-b border-gray-100 last:border-b-0"
                        onClick={(e) => handleTaskClick(task.id, e)}
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
      {incompleteTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无事项</div>
      ) : (
        sortedTasks.map(task => (
          <div
            key={task.id}
            className="p-3 bg-white rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 no-tap-highlight"
            onClick={(e) => handleTaskClick(task.id, e)}
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
        ))
      )}
    </div>
  );

  const renderCompletedView = () => (
    <div className="py-2 space-y-2">
      {completedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无已完成事项</div>
      ) : (
        completedTasks.map(task => (
          <div
            key={task.id}
            className="p-3 bg-white rounded-lg shadow-sm border opacity-75 cursor-pointer transition-colors hover:bg-gray-50"
            onClick={(e) => handleTaskClick(task.id, e)}
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
      
      {selectedTaskId && (
        <TaskDetailModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </>
  );
};

export default TimelinePage; 