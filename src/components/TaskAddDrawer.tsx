import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plus, Calendar, Tag, RepeatIcon, MoreHorizontal, List, X } from 'lucide-react';
import { createTask } from '../api/task';

interface TaskAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskAddDrawer = ({ isOpen, onClose }: TaskAddDrawerProps) => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [taskTitle, setTaskTitle] = useState('');
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
  
  // 重置抽屉位置和任务标题
  useEffect(() => {
    if (!isOpen) {
      // 清空任务标题
      setTaskTitle('');
      // 重置日期选择
      setSelectedDate('今天');
      // 重置时间区域选择
      setSelectedTimeZone(null);
      // 更新是否显示时间区域
      setShowTimeZones(true);
      // 重置时间区域确认状态
      setIsTimeZoneConfirmed(false);
      // 重置抽屉位置
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(0)';
      }
    }
  }, [isOpen]);
  
  const handleAddTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (taskTitle.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        // 根据日期选择设置任务day属性
        let taskDay: string | undefined;
        let taskStartTime: string | undefined;
        const today = new Date();
        
        switch (selectedDate) {
          case '今天':
            taskDay = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
            break;
          case '明天':
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            taskDay = tomorrow.toISOString().split('T')[0];
            break;
          // 其他日期选项可以根据需要处理
          default:
            // 如果没有选择日期，则不设置taskDay
            if (selectedDate) {
              taskDay = today.toISOString().split('T')[0];
            }
        }
        
        // 根据时间区域设置开始时间
        if (selectedTimeZone && taskDay) {
          const timeMap: Record<string, string> = {
            '上午': '09:00',
            '中午': '12:00',
            '下午': '14:00',
            '晚上': '19:00'
          };
          
          if (timeMap[selectedTimeZone]) {
            taskStartTime = timeMap[selectedTimeZone];
          }
        }
        
        // 调用API创建任务
        const newTask = await createTask({
          title: taskTitle,
          day: taskDay,
          type: 'other', // 默认类型
          priority: 'medium', // 默认优先级
          completed: false,
          start_time: taskStartTime
        });
        
        // 创建成功后，更新本地状态
        dispatch({
          type: 'ADD_TASK',
          payload: {
            id: newTask.id?.toString() || Date.now().toString(),
            title: newTask.title,
            completed: newTask.completed || false,
            isAnytime: !newTask.start_time,
            dueDate: newTask.day,
            startTime: newTask.start_time,
            endTime: newTask.end_time,
            priority: newTask.priority as any,
          },
        });
        
        setTaskTitle('');
        onClose();
      } catch (error) {
        console.error('添加任务失败:', error);
        // 如果API调用失败，可以添加错误处理逻辑
        alert('添加任务失败，请重试');
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
  
  if (!isOpen) return null;
  
  // 日期选项
  const dateOptions = ['今天', '明天', '随时'];
  
  // 时间区域选项
  const timeZoneOptions = ['上午', '中午', '下午', '晚上'];

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
          width: '100%'
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
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="准备做什么？"
            className="w-full text-lg px-2 py-3 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 bg-transparent text-app"
            autoFocus
          />
        </div>
        
        {/* 时间区域选择器 - 未确认时显示 */}
        {showTimeZones && !isTimeZoneConfirmed && (
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
        
        {/* 底部工具栏 */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <button className="w-10 h-10 flex items-center justify-center text-gray-500" aria-label="时间设置">
              <Calendar size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-gray-500" aria-label="标签">
              <Tag size={20} />
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
            onClick={() => handleAddTask()} 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500'}`}
            disabled={!taskTitle.trim() || isSubmitting}
            aria-label="添加任务"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskAddDrawer; 