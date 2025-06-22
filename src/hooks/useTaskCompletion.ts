import { useAppContext } from '../context/AppContext';
import { updateItem } from '../api/items';

export const useTaskCompletion = () => {
  const { dispatch, isTestUser } = useAppContext();

  const toggleTaskCompletion = async (taskId: string, currentCompleted: boolean) => {
    console.log('🎯 toggleTaskCompletion 被调用:', { taskId, currentCompleted, isTestUser });
    
    // 检查是否为测试用户
    if (isTestUser) {
      console.log('🧪 toggleTaskCompletion: 检测到测试用户，使用mock操作');
      
      try {
        // 使用mock API更新事项状态
        const { mockUpdateItem } = await import('../api/mock');
        const updateData = {
          status_id: currentCompleted ? 1 : 3, // 如果当前已完成，则设为pending(1)；如果当前未完成，则设为completed(3)
        };
        
        console.log('📋 mockUpdateItem 请求数据:', updateData);
        
        const result = await mockUpdateItem(taskId, updateData);
        
        console.log('✅ mockUpdateItem 调用成功:', result);

        // 更新本地状态
        dispatch({ type: 'COMPLETE_TASK', payload: taskId });
        
        console.log('✅ 本地状态已更新');
      } catch (error) {
        console.error('❌ 更新mock事项状态失败:', error);
        // 即使mock API失败，也更新本地状态以保持用户体验
        dispatch({ type: 'COMPLETE_TASK', payload: taskId });
        console.log('⚠️ 尽管mock API调用失败，仍更新了本地状态');
      }
      return;
    }
    
    try {
      console.log('🚀 准备调用 updateItem API...');
      
      // 调用API更新事项状态 - 切换到相反的状态
      const updateData = {
        status_id: currentCompleted ? 1 : 3, // 如果当前已完成，则设为pending(1)；如果当前未完成，则设为completed(3)
      };
      
      console.log('📋 updateItem 请求数据:', updateData);
      
      const result = await updateItem(taskId, updateData);
      
      console.log('✅ updateItem API 调用成功:', result);

      // 更新本地状态
      dispatch({ type: 'COMPLETE_TASK', payload: taskId });
      
      console.log('✅ 本地状态已更新');
    } catch (error) {
      console.error('❌ 更新事项状态失败:', error);
      // 这里可以添加错误提示，但暂时仍更新本地状态以保持用户体验
      dispatch({ type: 'COMPLETE_TASK', payload: taskId });
      console.log('⚠️ 尽管API调用失败，仍更新了本地状态');
    }
  };

  return { toggleTaskCompletion };
}; 