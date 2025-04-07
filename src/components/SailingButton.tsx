import { useNavigate } from 'react-router-dom';
import { Ship } from 'lucide-react';
import { Task } from '../types';

interface SailingButtonProps {
  text: string;
  task?: Task;
}

const SailingButton = ({ text, task }: SailingButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sailing', { state: { task } });
  };

  return (
    <button
      onClick={handleClick}
      className="
        bg-[var(--color-button-primary)]
        rounded-[var(--button-radius)]
        h-[var(--button-height)]
        px-4
        flex items-center justify-center
        shadow-[var(--button-shadow)]
        transition-all duration-[var(--transition-normal)]
        hover:bg-[var(--color-button-primary-hover)]
      "
    >
      <Ship className="text-[var(--color-button-text)] mr-1" size={16} />
      <span className="text-sm font-medium text-[var(--color-button-text)]">{text}</span>
    </button>
  );
};

export default SailingButton; 