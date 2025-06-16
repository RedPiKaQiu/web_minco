import { Plus, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  onCreateTask: () => void;
}

const EmptyState = ({ onCreateTask }: EmptyStateProps) => {

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Lightbulb className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        还没有事项
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        创建您的第一个事项，开始规划美好的一天吧！
      </p>
      
      <button
        onClick={onCreateTask}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        创建事项
      </button>
    </div>
  );
};

export default EmptyState; 