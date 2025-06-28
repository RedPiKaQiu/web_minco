/**
 * 新建任务页面，提供完整的任务创建表单和高级设置选项
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Flag, RefreshCw, Edit, ChevronRight, Check, AlarmClock } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { Task, ItemCategory, ITEM_CATEGORIES } from '../types';
import { createItem, updateItem, CreateItemRequest, UpdateItemRequest } from '../api/items';

// 事项类型选项
const taskNatureOptions = [
  { id: 'routine', icon: <RefreshCw size={22} />, label: '例行' },
  { id: 'chore', icon: <Edit size={22} />, label: '杂务' },
  { id: 'event', icon: <Calendar size={22} strokeWidth={1.5} />, label: '活动' },
  { id: 'idea', icon: <div className="text-2xl">💡</div>, label: '想法' },
];

// 使用统一的事项分类配置
const taskCategoryOptions = ITEM_CATEGORIES.map(category => ({
  id: category.id.toLowerCase(),
  icon: category.emoji,
  label: category.label
}));

// 优先级选项
const priorityOptions = [
  { id: 'low', color: 'bg-red-400 border-red-400', label: '' },
  { id: 'medium', color: 'bg-yellow-400 border-yellow-400', label: '' },
  { id: 'high', color: 'bg-blue-400 border-blue-400', label: '' },
];

// 预设时间选项
const timeOptions = [
  '5 分钟', 
  '15 分钟', 
  '30 分钟', 
  '45 分钟', 
  '1 小时', 
  '1.5 小时', 
  '2 小时', 
  '3 小时', 
  '4 小时',
  '全天',
  '自定义时长'
];

// 预设开始时间选项
const startTimeOptions = [
  '随时',
  '上午 8:00',
  '上午 9:00',
  '上午 10:00',
  '上午 11:00',
  '中午 12:00',
  '下午 1:00',
  '下午 2:00',
  '下午 3:00',
  '下午 4:00',
  '下午 5:00',
  '下午 6:00',
  '晚上 7:00',
  '晚上 8:00',
  '晚上 9:00',
  '自定义时间'
];

// 日期选择选项
const dateOptions = [
  '今天',
  '明天', 
  '随时'
];

interface LocationState {
  editTask?: Task;
}

const NewItemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAppContext();
  
  const locationState = location.state as LocationState;
  const editTask = locationState?.editTask;
  const isEditMode = !!editTask;
  
  // 状态管理
  const [title, setTitle] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [date, setDate] = useState('今天');
  const [startTime, setStartTime] = useState('随时');
  const [time, setTime] = useState('30 分钟');
  const [priority, setPriority] = useState('');
  const [showAiGeneration, setShowAiGeneration] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 自定义时间选择状态
  const [isCustomStartTimePickerOpen, setIsCustomStartTimePickerOpen] = useState(false);
  const [isCustomDurationPickerOpen, setIsCustomDurationPickerOpen] = useState(false);
  const [customStartHour, setCustomStartHour] = useState(9);
  const [customStartMinute, setCustomStartMinute] = useState(0);
  const [customDurationHour, setCustomDurationHour] = useState(0);
  const [customDurationMinute, setCustomDurationMinute] = useState(30);
  
  // 在编辑模式下预填充表单数据
  useEffect(() => {
    if (isEditMode && editTask) {
      setTitle(editTask.title);
      setStartTime(editTask.startTime || '随时');
      setTime(editTask.duration || '30 分钟');
      
      // 根据任务的日期设置日期选择
      if (editTask.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        if (editTask.dueDate === today) {
          setDate('今天');
        } else if (editTask.dueDate === tomorrowStr) {
          setDate('明天');
        } else {
          setDate('随时'); // 或者可以考虑添加自定义日期支持
        }
      } else {
        setDate('随时');
      }
      
      // 将数字priority转换为字符串显示
      if (editTask.priority) {
        if (editTask.priority >= 4) setPriority('high');
        else if (editTask.priority >= 3) setPriority('medium');
        else setPriority('low');
      } else {
        setPriority('');
      }
      
      // 根据category找到对应的分类ID
      if (editTask.category) {
        const categoryOption = taskCategoryOptions.find(opt => opt.label === editTask.category);
        if (categoryOption) {
          setSelectedCategory(categoryOption.id);
        }
      }
      
      // type字段已删除 - 不再设置性质
    }
  }, [isEditMode, editTask]);
  
  // 映射函数：将分类标签转换为category_id
  const getCategoryId = (categoryLabel: string): number => {
    const categoryMap: { [key: string]: number } = {
      '生活': 1,
      '健康': 2,
      '工作': 3,
      '学习': 4,
      '放松': 5,
      '探索': 6
    };
    return categoryMap[categoryLabel] || 1;
  };

  // 映射函数：将优先级字符串转换为数字
  const getPriorityNumber = (priorityStr: string): number => {
    const priorityMap: { [key: string]: number } = {
      'low': 2,
      'medium': 3,
      'high': 5
    };
    return priorityMap[priorityStr] || 3;
  };

  // 映射函数：将时间字符串转换为分钟数
  const getDurationInMinutes = (timeStr: string): number => {
    if (timeStr === '全天') return 480; // 8小时
    const match = timeStr.match(/(\d+(?:\.\d+)?)\s*(分钟|小时)/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2];
      return unit === '小时' ? num * 60 : num;
    }
    return 30; // 默认30分钟
  };

  // 映射函数：将开始时间转换为时间段ID
  const getTimeSlotId = (startTimeStr: string, dateStr: string): number => {
    // 如果开始时间是"随时"且日期也是"随时"，则为真正的随时事项
    if (startTimeStr === '随时' && dateStr === '随时') {
      return 5;
    }
    
    // 如果开始时间是"随时"但有具体日期，使用默认时间段（上午，对应上午9:00）
    if (startTimeStr === '随时') {
      console.log(`⏰ NewItemPage: 日期为${dateStr}但开始时间为随时，设置时间段为上午(1)`);
      return 1; // 上午
    }
    
    const hour = parseInt(startTimeStr.split(' ')[1]?.split(':')[0] || '0');
    if (hour >= 6 && hour < 12) return 1; // 上午
    if (hour >= 12 && hour < 14) return 2; // 中午
    if (hour >= 14 && hour < 18) return 3; // 下午
    if (hour >= 18 && hour < 24) return 4; // 晚上
    return 5; // 随时
  };

  // 映射函数：将开始时间转换为ISO格式
  const getStartTimeISO = (startTimeStr: string, dateStr: string): string | undefined => {
    // 如果开始时间是"随时"且日期也是"随时"，则返回undefined（真正的随时事项）
    if (startTimeStr === '随时' && dateStr === '随时') {
      return undefined;
    }
    
    // 根据dateStr构建正确的日期
    let targetDate: Date;
    if (dateStr === '今天') {
      targetDate = new Date();
    } else if (dateStr === '明天') {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (dateStr === '随时') {
      // 如果日期是随时但有具体开始时间，使用今天的日期
      targetDate = new Date();
    } else {
      // 默认使用今天
      targetDate = new Date();
    }
    
    // 如果开始时间是"随时"但有具体日期，设置为该日期的默认时间（上午9:00）
    if (startTimeStr === '随时') {
      targetDate.setHours(9, 0, 0, 0); // 默认上午9:00
      console.log(`⏰ NewItemPage: 日期为${dateStr}但开始时间为随时，设置默认时间为上午9:00`, {
        dateStr,
        targetDate: targetDate.toISOString()
      });
      return targetDate.toISOString();
    }
    
    // 处理具体的开始时间
    // 提取时间部分，例如 "上午 9:00" -> "9:00"
    const timeMatch = startTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      // 如果无法解析时间格式，使用默认时间
      targetDate.setHours(9, 0, 0, 0);
      return targetDate.toISOString();
    }
    
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    
    // 处理下午时间（除了12点）
    if (startTimeStr.includes('下午') && hour !== 12) {
      hour += 12;
    }
    
    // 设置时间
    targetDate.setHours(hour, minute, 0, 0);
    
    return targetDate.toISOString();
  };
  
  // 处理保存事项
  const handleSaveTask = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const selectedCategoryConfig = taskCategoryOptions.find(cat => cat.id === selectedCategory);
      const selectedCategoryValue = selectedCategoryConfig?.label as ItemCategory;
      
      // 生成处理后的数据
      const processedData = {
        title: title,
        category_id: selectedCategoryValue ? getCategoryId(selectedCategoryValue) : (isEditMode ? undefined : 1),
        priority: priority ? getPriorityNumber(priority) : (isEditMode ? undefined : 3),
        estimated_duration: getDurationInMinutes(time),
        time_slot_id: getTimeSlotId(startTime, date),
        start_time: getStartTimeISO(startTime, date),
      };
      
      console.log('🎯 NewItemPage: 准备保存事项', {
        mode: isEditMode ? '编辑' : '新建',
        originalData: {
          title,
          selectedCategory,
          priority,
          startTime,
          time,
          date
        },
        processedData,
        isAnytime: !processedData.start_time
      });
      
      if (isEditMode && editTask) {
        // 编辑模式：调用更新事项API
        const updateData: UpdateItemRequest = processedData;

        console.log('📤 NewItemPage: 发送更新事项请求', { itemId: editTask.id, updateData });
        const result = await updateItem(editTask.id, updateData);
        console.log('✅ NewItemPage: 收到更新响应', result);
        
        // 更新本地状态
        const updatedTask = {
          ...editTask,
          title: title,
          isAnytime: startTime === '随时' && date === '随时', // 只有当开始时间和日期都是"随时"时才是真正的随时事项
          startTime: startTime !== '随时' ? startTime : undefined,
          category: selectedCategoryValue,
          priority: priority ? getPriorityNumber(priority) : editTask.priority,
          duration: time,
        };
        
        console.log('🏪 NewItemPage: 更新本地状态', updatedTask);
        dispatch({
          type: 'UPDATE_TASK',
          payload: updatedTask,
        });
        
        // 完整更新编辑任务的相关缓存
        try {
          // 1. 更新时间轴缓存中的任务数据
          const updateTimelineCache = (targetDate: string) => {
            const cacheKey = `timeline-tasks-${targetDate}`;
            const existingCache = sessionStorage.getItem(cacheKey);
            
            if (existingCache) {
              try {
                const cachedTasks = JSON.parse(existingCache);
                const updatedTasks = cachedTasks.map((task: any) => 
                  task.id === editTask.id 
                    ? {
                        ...task,
                        title: title,
                        category_id: selectedCategoryValue ? getCategoryId(selectedCategoryValue) : task.category_id,
                        priority: priority ? getPriorityNumber(priority) : task.priority,
                        estimated_duration: getDurationInMinutes(time),
                        time_slot_id: getTimeSlotId(startTime, date),
                        start_time: getStartTimeISO(startTime, date),
                      }
                    : task
                );
                sessionStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
                
                console.log(`✅ NewItemPage: 已在时间轴缓存中更新任务 [${targetDate}]`, { 
                  taskId: editTask.id, 
                  taskTitle: title,
                  totalTasks: updatedTasks.length 
                });
                return true;
              } catch (parseError) {
                console.error(`编辑任务缓存解析失败 [${targetDate}]:`, parseError);
                return false;
              }
            }
            return false;
          };
          
          // 确定需要更新的缓存日期
          let targetDate = new Date().toISOString().split('T')[0]; // 默认今天
          
          // 如果有新的start_time，使用新的日期
          const newStartTime = getStartTimeISO(startTime, date);
          if (newStartTime) {
            targetDate = newStartTime.split('T')[0];
          } else if (date === '明天') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDate = tomorrow.toISOString().split('T')[0];
          }
          
          const cacheUpdated = updateTimelineCache(targetDate);
          
          // 如果任务的日期发生了变化，需要从原日期的缓存中移除
          if (editTask.dueDate && editTask.dueDate !== targetDate) {
            const oldCacheKey = `timeline-tasks-${editTask.dueDate}`;
            const oldCache = sessionStorage.getItem(oldCacheKey);
            if (oldCache) {
              try {
                const oldTasks = JSON.parse(oldCache);
                const filteredTasks = oldTasks.filter((task: any) => task.id !== editTask.id);
                sessionStorage.setItem(oldCacheKey, JSON.stringify(filteredTasks));
                console.log(`🔄 NewItemPage: 已从旧日期缓存中移除任务 [${editTask.dueDate}]`);
              } catch (error) {
                console.error('移除旧日期缓存失败:', error);
              }
            }
          }
          
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
          if (editTask.dueDate && editTask.dueDate !== targetDate) {
            metadataObj[editTask.dueDate] = Date.now(); // 也更新旧日期的元数据
          }
          sessionStorage.setItem(metadataKey, JSON.stringify(metadataObj));
          
          // 3. 更新项目页面相关缓存
          const newCategoryId = selectedCategoryValue ? getCategoryId(selectedCategoryValue) : null;
          const oldCategoryId = editTask.category ? getCategoryId(editTask.category as any) : null;
          
          // 如果分类发生变化，需要从旧分类缓存中移除，添加到新分类缓存
          if (newCategoryId && oldCategoryId && newCategoryId !== oldCategoryId) {
            // 从旧分类缓存中移除
            const oldProjectCacheKey = `project-category-tasks-${oldCategoryId}`;
            const oldProjectCache = sessionStorage.getItem(oldProjectCacheKey);
            if (oldProjectCache) {
              try {
                const oldProjectTasks = JSON.parse(oldProjectCache);
                const filteredProjectTasks = oldProjectTasks.filter((task: any) => task.id !== editTask.id);
                sessionStorage.setItem(oldProjectCacheKey, JSON.stringify(filteredProjectTasks));
                console.log(`🔄 NewItemPage: 已从旧分类缓存中移除任务 [category:${oldCategoryId}]`);
              } catch (error) {
                console.error('移除旧分类缓存失败:', error);
              }
            }
          }
          
          // 更新当前分类缓存
          const currentCategoryId = newCategoryId || oldCategoryId;
          if (currentCategoryId) {
            const projectCacheKey = `project-category-tasks-${currentCategoryId}`;
            const projectCache = sessionStorage.getItem(projectCacheKey);
            
            if (projectCache) {
              try {
                const projectTasks = JSON.parse(projectCache);
                const updatedProjectTasks = projectTasks.map((task: any) =>
                  task.id === editTask.id
                    ? {
                        ...task,
                        title: title,
                        category_id: currentCategoryId,
                        priority: priority ? getPriorityNumber(priority) : task.priority,
                        estimated_duration: getDurationInMinutes(time),
                        time_slot_id: getTimeSlotId(startTime, date),
                        start_time: getStartTimeISO(startTime, date),
                      }
                    : task
                );
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
                
                projectMetadataObj[currentCategoryId] = Date.now();
                if (oldCategoryId && oldCategoryId !== currentCategoryId) {
                  projectMetadataObj[oldCategoryId] = Date.now(); // 也更新旧分类的元数据
                }
                sessionStorage.setItem(projectMetadataKey, JSON.stringify(projectMetadataObj));
                
                console.log('✅ NewItemPage: 已在项目缓存中更新任务', { 
                  categoryId: currentCategoryId,
                  taskId: editTask.id 
                });
              } catch (error) {
                console.error('更新项目缓存失败:', error);
              }
            }
          }
          
          // 4. 发送全局事件通知所有页面刷新
          console.log('📢 NewItemPage: 发送缓存更新事件');
          window.dispatchEvent(new CustomEvent('taskCacheUpdated', {
            detail: { 
              action: 'update', 
              taskId: editTask.id, 
              taskTitle: title,
              oldCategoryId: oldCategoryId,
              newCategoryId: newCategoryId,
              targetDate: targetDate,
              oldDate: editTask.dueDate,
              cacheUpdated: cacheUpdated
            }
          }));
          
          if (!cacheUpdated) {
            console.log('💾 NewItemPage: 时间轴缓存不存在，更新的任务将在下次加载时显示');
          }
          
        } catch (error) {
          console.error('NewItemPage: 更新编辑任务缓存失败:', error);
        }
      } else {
        // 新建模式：调用创建事项API
        const createData: CreateItemRequest = processedData as CreateItemRequest;

        console.log('📤 NewItemPage: 发送创建事项请求', createData);
        const newItem = await createItem(createData);
        console.log('✅ NewItemPage: 收到服务器响应', newItem);
        
        // 更新本地状态
        const newTask = {
          id: newItem.id,
          title: title,
          completed: false,
          isAnytime: startTime === '随时' && date === '随时', // 只有当开始时间和日期都是"随时"时才是真正的随时事项
          startTime: startTime !== '随时' ? startTime : undefined,
          category: selectedCategoryValue,
          priority: priority ? getPriorityNumber(priority) : 3,
          duration: time,
        };
        
        console.log('🏪 NewItemPage: 更新本地状态', newTask);
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
                const updatedTasks = [...cachedTasks, newItem];
                sessionStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
                
                console.log(`✅ NewItemPage: 已将新任务添加到时间轴缓存 [${targetDate}]`, { 
                  taskId: newItem.id, 
                  taskTitle: newItem.title,
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
          if (newItem.start_time) {
            targetDate = newItem.start_time.split('T')[0];
          } else if (date === '明天') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDate = tomorrow.toISOString().split('T')[0];
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
          if (newItem.category_id) {
            const projectCacheKey = `project-category-tasks-${newItem.category_id}`;
            const projectCache = sessionStorage.getItem(projectCacheKey);
            
            if (projectCache) {
              try {
                const projectTasks = JSON.parse(projectCache);
                const updatedProjectTasks = [...projectTasks, newItem];
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
                
                projectMetadataObj[newItem.category_id] = Date.now();
                sessionStorage.setItem(projectMetadataKey, JSON.stringify(projectMetadataObj));
                
                console.log('✅ NewItemPage: 已将新任务添加到项目缓存', { 
                  categoryId: newItem.category_id,
                  taskId: newItem.id 
                });
              } catch (error) {
                console.error('更新项目缓存失败:', error);
              }
            }
          }
          
          // 4. 发送全局事件通知所有页面刷新
          console.log('📢 NewItemPage: 发送缓存更新事件');
          window.dispatchEvent(new CustomEvent('taskCacheUpdated', {
            detail: { 
              action: 'add', 
              taskId: newItem.id, 
              taskTitle: newItem.title,
              categoryId: newItem.category_id,
              targetDate: targetDate,
              cacheUpdated: cacheUpdated
            }
          }));
          
          if (!cacheUpdated) {
            console.log('💾 NewItemPage: 时间轴缓存不存在，新任务将在下次加载时显示');
          }
          
        } catch (error) {
          console.error('NewItemPage: 更新缓存失败:', error);
        }
      }
      
      // 成功保存后关闭页面，返回上一页
      // 由于已经通过dispatch更新了缓存，上一页会自动显示新任务
      navigate(-1);
    } catch (error) {
      console.error('保存事项失败:', error);
      // 这里可以添加错误提示UI
      alert('保存事项失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };
  
  // 处理切换重复
  const handleToggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };
  
  // 处理时间选择
  const handleSelectTime = (selectedTime: string) => {
    if (selectedTime === '自定义时长') {
      setIsTimePickerOpen(false);
      setIsCustomDurationPickerOpen(true);
    } else {
      setTime(selectedTime);
      setIsTimePickerOpen(false);
    }
  };
  
  // 处理开始时间选择
  const handleSelectStartTime = (selectedStartTime: string) => {
    if (selectedStartTime === '自定义时间') {
      setIsStartTimePickerOpen(false);
      setIsCustomStartTimePickerOpen(true);
    } else {
      setStartTime(selectedStartTime);
      setIsStartTimePickerOpen(false);
    }
  };

  // 处理日期选择
  const handleSelectDate = (selectedDate: string) => {
    setDate(selectedDate);
    setIsDatePickerOpen(false);
    
    console.log('📅 NewItemPage: 日期选择', {
      selectedDate,
      currentStartTime: startTime
    });
  };

  // 处理自定义开始时间确认
  const handleConfirmCustomStartTime = () => {
    const period = customStartHour < 12 ? '上午' : '下午';
    const displayHour = customStartHour === 0 ? 12 : (customStartHour > 12 ? customStartHour - 12 : customStartHour);
    const customTimeStr = `${period} ${displayHour}:${customStartMinute.toString().padStart(2, '0')}`;
    setStartTime(customTimeStr);
    setIsCustomStartTimePickerOpen(false);
  };

  // 处理自定义持续时间确认
  const handleConfirmCustomDuration = () => {
    let customDurationStr = '';
    if (customDurationHour > 0 && customDurationMinute > 0) {
      customDurationStr = `${customDurationHour} 小时 ${customDurationMinute} 分钟`;
    } else if (customDurationHour > 0) {
      customDurationStr = `${customDurationHour} 小时`;
    } else {
      customDurationStr = `${customDurationMinute} 分钟`;
    }
    setTime(customDurationStr);
    setIsCustomDurationPickerOpen(false);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* 顶部导航栏 - 固定不滚动 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10 flex-shrink-0">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium">{isEditMode ? '编辑事项' : '新建事项'}</h1>
        <button 
          onClick={handleSaveTask}
          className={`px-4 py-2 rounded-lg ${
            !title.trim() || isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white'
          }`}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
      
      {/* 可滚动的内容区域 */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden" 
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {/* 自定义滚动条样式 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              width: 6px;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `
        }} />
        
        {/* 事项标题输入 */}
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="添加标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg px-2 py-3 border-0 focus:outline-none focus:ring-0"
          />
        </div>
        
        {/* 事项性质选择 */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg mb-4">事项性质</h2>
          <div className="grid grid-cols-4 gap-4">
            {taskNatureOptions.map((option) => (
              <div 
                key={option.id}
                onClick={() => setSelectedNature(option.id)}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer ${
                  selectedNature === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="mb-2">{option.icon}</div>
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 事项分类 */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg mb-4">事项分类</h2>
          <div className="grid grid-cols-4 gap-4">
            {taskCategoryOptions.map((option) => (
              <div 
                key={option.id}
                onClick={() => setSelectedCategory(option.id)}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer ${
                  selectedCategory === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 重复设置 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw size={20} className="text-gray-500 mr-3" />
              <span>重复</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">{isRepeating ? '不重复' : '不重复'}</span>
              <button 
                onClick={handleToggleRepeat}
                className="w-10 h-6 bg-gray-200 rounded-full relative focus:outline-none"
              >
                <div className={`
                  absolute w-5 h-5 bg-white rounded-full shadow transition
                  ${isRepeating ? 'right-0.5 bg-blue-500' : 'left-0.5'}
                `}></div>
              </button>
            </div>
          </div>
        </div>
        
        {/* 日期设置 */}
        <div 
          className="p-4 border-b border-gray-100 cursor-pointer"
          onClick={() => setIsDatePickerOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-500 mr-3" />
              <span>日期</span>
            </div>
            <div className="flex items-center text-gray-500">
              <span>{date}</span>
              <ChevronRight size={18} className="ml-1" />
            </div>
          </div>
        </div>
        
        {/* 开始时间设置 */}
        <div 
          className="p-4 border-b border-gray-100 cursor-pointer"
          onClick={() => setIsStartTimePickerOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlarmClock size={20} className="text-gray-500 mr-3" />
              <span>开始时间</span>
            </div>
            <div className="flex items-center text-gray-500">
              <span>{startTime}</span>
              <ChevronRight size={18} className="ml-1" />
            </div>
          </div>
        </div>
        
        {/* 时间设置 */}
        <div 
          className="p-4 border-b border-gray-100 cursor-pointer"
          onClick={() => setIsTimePickerOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock size={20} className="text-gray-500 mr-3" />
              <span>估时</span>
            </div>
            <div className="flex items-center text-gray-500">
              <span>{time}</span>
              <ChevronRight size={18} className="ml-1" />
            </div>
          </div>
        </div>
        
        {/* 优先级设置 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Flag size={20} className="text-gray-500 mr-3" />
              <span>优先级</span>
            </div>
            <div className="flex items-center space-x-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPriority(option.id)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    priority === option.id ? option.color : 'border-gray-300 bg-white'
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 子事项 */}
        <div className="p-4 border-b border-gray-100 mb-6">
          <h2 className="text-lg mb-4">子事项</h2>
          
          {/* AI生成子事项按钮 */}
          <div 
            className="bg-blue-50 py-3 px-4 rounded-lg mb-4 flex items-center justify-center cursor-pointer"
            onClick={() => setShowAiGeneration(!showAiGeneration)}
          >
            <Edit size={18} className="text-blue-500 mr-2" />
            <span className="text-blue-500">AI 生成子事项</span>
          </div>
          
          {/* 手动添加子事项 */}
          <div className="flex items-center border border-gray-200 rounded-lg p-2">
            <input
              type="checkbox"
              className="rounded mr-3"
              disabled
            />
            <input
              type="text"
              placeholder="添加子事项"
              className="flex-1 border-0 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
      
      {/* 日期选择对话框 */}
      <Dialog
        open={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择日期
            </Dialog.Title>
            
            <div className="mb-4 max-h-80 overflow-y-auto">
              {dateOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectDate(option)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{option}</span>
                  {date === option && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* 时间选择对话框 */}
      <Dialog
        open={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择估计时间
            </Dialog.Title>
            
            <div className="mb-4 max-h-80 overflow-y-auto">
              {timeOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectTime(option)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{option}</span>
                  {time === option && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsTimePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* 开始时间选择对话框 */}
      <Dialog
        open={isStartTimePickerOpen}
        onClose={() => setIsStartTimePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择开始时间
            </Dialog.Title>
            
            <div className="mb-4 max-h-80 overflow-y-auto">
              {startTimeOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectStartTime(option)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{option}</span>
                  {startTime === option && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsStartTimePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* 自定义开始时间选择对话框 */}
      <Dialog
        open={isCustomStartTimePickerOpen}
        onClose={() => setIsCustomStartTimePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-6 text-center">
              自定义开始时间
            </Dialog.Title>
            
            <div className="flex items-center justify-center mb-6">
              {/* 小时选择器 */}
              <div className="flex flex-col items-center mr-8">
                <label className="text-sm text-gray-600 mb-2">小时</label>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCustomStartHour(Math.min(23, customStartHour + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                  <div className="w-16 h-12 flex items-center justify-center text-xl font-mono my-2">
                    {customStartHour.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setCustomStartHour(Math.max(0, customStartHour - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
              
              <div className="text-xl font-mono mx-2">:</div>
              
              {/* 分钟选择器 */}
              <div className="flex flex-col items-center ml-8">
                <label className="text-sm text-gray-600 mb-2">分钟</label>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCustomStartMinute((customStartMinute + 5) % 60)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                  <div className="w-16 h-12 flex items-center justify-center text-xl font-mono my-2">
                    {customStartMinute.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setCustomStartMinute((customStartMinute - 5 + 60) % 60)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setIsCustomStartTimePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCustomStartTime}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                确认
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* 自定义持续时间选择对话框 */}
      <Dialog
        open={isCustomDurationPickerOpen}
        onClose={() => setIsCustomDurationPickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-6 text-center">
              自定义持续时间
            </Dialog.Title>
            
            <div className="flex items-center justify-center mb-6">
              {/* 小时选择器 */}
              <div className="flex flex-col items-center mr-8">
                <label className="text-sm text-gray-600 mb-2">小时</label>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCustomDurationHour(Math.min(24, customDurationHour + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                  <div className="w-16 h-12 flex items-center justify-center text-xl font-mono my-2">
                    {customDurationHour}
                  </div>
                  <button
                    onClick={() => setCustomDurationHour(Math.max(0, customDurationHour - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
              
              <div className="text-xl font-mono mx-2">:</div>
              
              {/* 分钟选择器 */}
              <div className="flex flex-col items-center ml-8">
                <label className="text-sm text-gray-600 mb-2">分钟</label>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCustomDurationMinute(Math.min(59, customDurationMinute + 5))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                  <div className="w-16 h-12 flex items-center justify-center text-xl font-mono my-2">
                    {customDurationMinute.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setCustomDurationMinute(Math.max(5, customDurationMinute - 5))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setIsCustomDurationPickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCustomDuration}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                确认
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default NewItemPage; 