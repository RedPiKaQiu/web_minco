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
      className="bg-white rounded-full py-1 px-4 flex items-center justify-center shadow-sm"
    >
      <Ship className="text-ocean-600 mr-1" size={16} />
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
};

export default SailingButton; 