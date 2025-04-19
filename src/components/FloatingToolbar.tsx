import { MessageCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingToolbarProps {
  onAddTask: () => void;
}

const FloatingToolbar = ({ onAddTask }: FloatingToolbarProps) => {
  const navigate = useNavigate();
  
  const openAiChat = () => {
    navigate('/ai-chat');
  };
  
  return (
    <div className="fixed bottom-20 left-0 right-0 z-[100] pointer-events-none flex justify-center">
      <div className="w-[375px] max-w-full px-4 pointer-events-none flex justify-end">
        <div className="pointer-events-auto">
          <div className="bg-card rounded-full shadow-lg flex overflow-hidden">
            {/* 聊天按钮 */}
            <button 
              onClick={openAiChat} 
              className="h-12 w-12 flex items-center justify-center border-r border-app-border"
              aria-label="打开聊天"
            >
              <MessageCircle className="text-primary" size={20} />
            </button>
            
            {/* 竖线分隔符 */}
            <div className="w-[1px] bg-app-border"></div>
            
            {/* 添加任务按钮 */}
            <button 
              onClick={onAddTask} 
              className="h-12 w-12 flex items-center justify-center"
              aria-label="添加任务"
            >
              <Plus className="text-primary" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar; 