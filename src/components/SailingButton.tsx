import { Ship } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SailingButtonProps {
  text: string;
}

const SailingButton = ({ text }: SailingButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sailing');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center bg-white rounded-full px-6 py-2 shadow-sm border border-gray-100"
    >
      <Ship size={18} className="mr-2 text-ocean-600" />
      <span className="font-medium">{text}</span>
    </button>
  );
};

export default SailingButton; 