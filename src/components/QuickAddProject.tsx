import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TaskCategory, Project } from '../types';

interface QuickAddProjectProps {
  onClose: () => void;
  category: TaskCategory;
}

const QuickAddProject = ({ onClose, category }: QuickAddProjectProps) => {
  const { dispatch } = useAppContext();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (projectName.trim() === '') return;

    setIsLoading(true);
    
    // 模拟异步操作
    setTimeout(() => {
      const newProject: Project = {
        id: Date.now().toString(),
        title: projectName.trim(),
        description: description.trim(),
        category_id: category === TaskCategory.LIFE ? 1 : 
                     category === TaskCategory.HEALTH ? 2 :
                     category === TaskCategory.WORK ? 3 :
                     category === TaskCategory.STUDY ? 4 :
                     category === TaskCategory.RELAX ? 5 : 6,
        task_count: 0,
        completed_task_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // 兼容性字段
        category: category,
        taskCount: 0,
        hasProgress: true,
        progress: 0,
        icon: getDefaultIcon(category),
        color: getDefaultColor(category),
      };

      dispatch({
        type: 'ADD_PROJECT',
        payload: newProject,
      });

      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getDefaultIcon = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.LIFE: return '🏠';
      case TaskCategory.HEALTH: return '💪';
      case TaskCategory.WORK: return '💼';
      case TaskCategory.STUDY: return '📚';
      case TaskCategory.RELAX: return '🎮';
      case TaskCategory.EXPLORE: return '🔍';
      default: return '📁';
    }
  };

  const getDefaultColor = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.LIFE: return '#4CAF50';
      case TaskCategory.HEALTH: return '#E91E63';
      case TaskCategory.WORK: return '#2196F3';
      case TaskCategory.STUDY: return '#FF9800';
      case TaskCategory.RELAX: return '#9C27B0';
      case TaskCategory.EXPLORE: return '#607D8B';
      default: return '#757575';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-t-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">添加项目</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-target no-tap-highlight"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目名称
            </label>
            <input
              type="text"
              placeholder="输入项目名称..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目描述（可选）
            </label>
            <textarea
              placeholder="简要描述这个项目..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            将在 <span className="font-medium text-gray-700">{category}</span> 分类下创建项目
          </div>

          <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target no-tap-highlight"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={projectName.trim() === '' || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center touch-target no-tap-highlight"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建项目'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddProject; 