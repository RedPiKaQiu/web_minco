import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CompletedTaskItem from './CompletedTaskItem';

const CompletedTasks = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useAppContext();
  const completedTasks = state.tasks.filter(task => task.completed);

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <button
        className="flex items-center text-[var(--color-completed-text)] text-sm mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">已完成 ({completedTasks.length})</span>
        {isExpanded ? (
          <ChevronUp size={16} className="ml-1" />
        ) : (
          <ChevronDown size={16} className="ml-1" />
        )}
      </button>
      
      {isExpanded && (
        <div className="bg-[var(--color-completed-bg)] rounded-xl shadow-sm mb-4 border border-[var(--color-completed-border)]">
          <div className="divide-y divide-[var(--color-completed-border)]">
            {completedTasks.map(task => (
              <CompletedTaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedTasks; 