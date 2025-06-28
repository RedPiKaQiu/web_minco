/**
 * 任务完成状态管理Hook，处理任务完成/未完成状态的切换
 */
import { useAppContext } from '../context/AppContext';
import { updateItem } from '../api/items';
import { format } from 'date-fns';

export const useTaskCompletion = () => {
  const { dispatch, isTestUser, state } = useAppContext();

  // 更新任务相关的缓存
  const updateTaskCaches = (taskId: string, newStatusId: number) => {
    try {
      // 找到任务以获取日期信息
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) {
        console.log('⚠️ useTaskCompletion: 未找到任务，跳过缓存更新', { taskId });
        return;
      }

      // 确定任务的日期
      let taskDate: string;
      if (task.dueDate) {
        taskDate = task.dueDate;
      } else {
        // 如果没有具体日期，使用今天的日期
        taskDate = format(new Date(), 'yyyy-MM-dd');
      }

      console.log('🔄 useTaskCompletion: 更新任务缓存', { taskId, taskDate, newStatusId });

      // 更新timeline缓存（主要的缓存）
      const timelineCacheKey = `timeline-tasks-${taskDate}`;
      const timelineCacheData = sessionStorage.getItem(timelineCacheKey);
      
      if (timelineCacheData) {
        try {
          const tasks = JSON.parse(timelineCacheData);
          const updatedTasks = tasks.map((cacheTask: any) => {
            if (cacheTask.id === taskId) {
              return {
                ...cacheTask,
                status_id: newStatusId
              };
            }
            return cacheTask;
          });
          
          // 更新缓存数据
          sessionStorage.setItem(timelineCacheKey, JSON.stringify(updatedTasks));
          
          // 更新缓存元数据
          const metadata = (() => {
            try {
              const existing = sessionStorage.getItem('timeline-cache-metadata');
              return existing ? JSON.parse(existing) : {};
            } catch {
              return {};
            }
          })();
          metadata[taskDate] = Date.now();
          sessionStorage.setItem('timeline-cache-metadata', JSON.stringify(metadata));
          
          console.log('✅ useTaskCompletion: timeline缓存已更新', { taskDate, taskCount: updatedTasks.length });
        } catch (parseError) {
          console.error('❌ useTaskCompletion: 解析timeline缓存失败', parseError);
        }
      }

      // 触发缓存更新事件，通知其他页面
      const event = new CustomEvent('taskCacheUpdated', {
        detail: { taskId, taskDate, newStatusId, source: 'useTaskCompletion' }
      });
      window.dispatchEvent(event);
      
      console.log('📢 useTaskCompletion: 已触发缓存更新事件', { taskId, taskDate });

    } catch (error) {
      console.error('❌ useTaskCompletion: 更新缓存失败', error);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentCompleted: boolean) => {
    console.log('🎯 toggleTaskCompletion 被调用:', { taskId, currentCompleted, isTestUser });
    
    // 计算新的状态ID
    const newStatusId = currentCompleted ? 1 : 3; // 如果当前已完成，则设为pending(1)；如果当前未完成，则设为completed(3)
    
    // 检查是否为测试用户
    if (isTestUser) {
      console.log('🧪 toggleTaskCompletion: 检测到测试用户，使用mock操作');
      
      try {
        // 使用mock API更新事项状态
        const { mockUpdateItem } = await import('../api/mock');
        const updateData = {
          status_id: newStatusId,
        };
        
        console.log('📋 mockUpdateItem 请求数据:', updateData);
        
        const result = await mockUpdateItem(taskId, updateData);
        
        console.log('✅ mockUpdateItem 调用成功:', result);

        // 更新本地状态
        dispatch({ type: 'COMPLETE_TASK', payload: taskId });
        
        // 更新缓存
        updateTaskCaches(taskId, newStatusId);
        
        console.log('✅ 本地状态和缓存已更新');
      } catch (error) {
        console.error('❌ 更新mock事项状态失败:', error);
        // 即使mock API失败，也更新本地状态以保持用户体验
        dispatch({ type: 'COMPLETE_TASK', payload: taskId });
        updateTaskCaches(taskId, newStatusId);
        console.log('⚠️ 尽管mock API调用失败，仍更新了本地状态和缓存');
      }
      return;
    }
    
    try {
      console.log('🚀 准备调用 updateItem API...');
      
      // 调用API更新事项状态 - 切换到相反的状态
      const updateData = {
        status_id: newStatusId,
      };
      
      console.log('📋 updateItem 请求数据:', updateData);
      
      const result = await updateItem(taskId, updateData);
      
      console.log('✅ updateItem API 调用成功:', result);

      // 更新本地状态
      dispatch({ type: 'COMPLETE_TASK', payload: taskId });
      
      // 更新缓存
      updateTaskCaches(taskId, newStatusId);
      
      console.log('✅ 本地状态和缓存已更新');
    } catch (error) {
      console.error('❌ 更新事项状态失败:', error);
      // 这里可以添加错误提示，但暂时仍更新本地状态以保持用户体验
      dispatch({ type: 'COMPLETE_TASK', payload: taskId });
      updateTaskCaches(taskId, newStatusId);
      console.log('⚠️ 尽管API调用失败，仍更新了本地状态和缓存');
    }
  };

  return { toggleTaskCompletion };
}; 