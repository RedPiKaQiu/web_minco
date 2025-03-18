import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TaskItem from './TaskItem';

const CompletedTasks = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useAppContext();
  const completedTasks = state.tasks.filter(task => task.completed);

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        className="flex items-center text-gray-500 text-sm mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>已完成 ({completedTasks.length})</span>
        {isExpanded ? (
          <ChevronUp size={16} className="ml-1" />
        ) : (
          <ChevronDown size={16} className="ml-1" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {completedTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedTasks; 