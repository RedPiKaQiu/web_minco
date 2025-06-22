import { Task } from '../types';
import { Check } from 'lucide-react';
import { useTaskCompletion } from '../hooks/useTaskCompletion';

interface CompletedTaskItemProps {
  task: Task;
}

const CompletedTaskItem = ({ task }: CompletedTaskItemProps) => {
  const { toggleTaskCompletion } = useTaskCompletion();

  const handleComplete = () => {
    toggleTaskCompletion(task.id, task.completed);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-[var(--color-completed-item-bg)]">
      <div className="flex-1">
        <h3 className="text-[var(--color-completed-item-text)] line-through text-sm">{task.title}</h3>
      </div>
      <button 
        onClick={handleComplete}
        className="w-5 h-5 rounded-full bg-primary-light/30 border-primary-light/30 flex items-center justify-center"
      >
        <Check size={12} className="text-primary-dark" />
      </button>
    </div>
  );
};

export default CompletedTaskItem; 