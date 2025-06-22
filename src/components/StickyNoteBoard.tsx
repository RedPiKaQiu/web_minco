import { useState } from 'react';
import { Check, X, Play, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { getTaskIcon } from '../utils/taskIcons';

interface StickyNoteBoardProps {
  tasks: Task[];
  onComplete: (id: string, e: React.MouseEvent) => void;
  onSkip: (id: string) => void;
  onFocus: (id: string) => void;
  onGetMore: () => void;
  isLoading: boolean;
}

export const StickyNoteBoard = ({ 
  tasks, 
  onComplete, 
  onSkip, 
  onFocus, 
  onGetMore, 
  isLoading 
}: StickyNoteBoardProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 限制显示最多3个便利贴
  const displayTasks = tasks.slice(0, 3);

  // 便签纸颜色配置
  const stickyColors = [
    'bg-yellow-200 border-yellow-300', // 经典黄色
    'bg-pink-200 border-pink-300',     // 粉色
    'bg-blue-200 border-blue-300',     // 蓝色
    'bg-green-200 border-green-300',   // 绿色
    'bg-purple-200 border-purple-300', // 紫色
    'bg-orange-200 border-orange-300', // 橙色
  ];

  // 便签纸倾斜角度
  const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-3'];

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  const handleAction = (action: 'complete' | 'skip' | 'focus', taskId: string, e?: React.MouseEvent) => {
    setSelectedTaskId(null);
    switch (action) {
      case 'complete':
        if (e) onComplete(taskId, e);
        break;
      case 'skip':
        onSkip(taskId);
        break;
      case 'focus':
        onFocus(taskId);
        break;
    }
  };

  if (displayTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">便签纸白板空空如也</p>
        <button
          onClick={onGetMore}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300 flex items-center touch-target"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在思考...
            </>
          ) : (
            '换一批'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
      {/* 白板背景纹理 */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* 便签纸网格布局 - 根据任务数量动态调整 */}
      <div className={`relative grid gap-4 ${displayTasks.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {displayTasks.map((task, index) => {
          const colorClass = stickyColors[index % stickyColors.length];
          const rotationClass = rotations[index % rotations.length];
          const isSelected = selectedTaskId === task.id;

          return (
            <div key={`sticky-${index}-${task.id}`} className="relative">
              {/* 便签纸阴影 */}
              <div
                className={`absolute inset-0 bg-gray-400 rounded-sm opacity-20 blur-sm translate-x-1 translate-y-1 ${rotationClass}`}
              />

              {/* 便签纸主体 */}
              <div
                className={`relative p-4 rounded-sm border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 min-h-[140px] flex flex-col ${colorClass} ${rotationClass} ${
                  isSelected ? 'scale-110 z-20 shadow-lg' : ''
                }`}
                onClick={() => handleTaskClick(task.id)}
              >
                {/* 便签纸顶部的"胶带"效果 */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-300 opacity-60 rounded-sm" />

                {/* 便签内容 */}
                <div className="flex-1 flex flex-col">
                  <div className="text-2xl mb-2 text-center">{getTaskIcon(task)}</div>

                  <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-tight line-clamp-2">{task.title}</h3>

                  {task.duration && (
                    <div className="text-xs text-gray-600 mb-2 flex items-center justify-center">
                      <span>⏱️ {task.duration}</span>
                    </div>
                  )}

                  <div className="mt-auto">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      推荐给你
                    </p>
                  </div>
                </div>

                {/* 选中状态的操作按钮 */}
                {isSelected && (
                  <div className="absolute inset-0 bg-black/10 rounded-sm flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('complete', task.id, e);
                        }}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </button>

                      <button
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('focus', task.id);
                        }}
                      >
                        <Play className="h-4 w-4 text-blue-600" />
                      </button>

                      <button
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('skip', task.id);
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 换一批按钮 - 根据便利贴数量动态定位 */}
        <div className={`relative ${displayTasks.length === 3 ? 'col-start-2 row-start-2' : ''}`}>
          <div
            className={`relative p-4 rounded-sm border-2 border-dashed border-gray-400 cursor-pointer transition-all duration-200 hover:scale-105 bg-gray-100 hover:bg-gray-200 min-h-[140px] flex flex-col items-center justify-center ${
              rotations[3 % rotations.length]
            }`}
            onClick={onGetMore}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 mb-2" />
                <span className="text-xs text-gray-500">思考中...</span>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-xs text-gray-600 text-center">换一批</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">点击卡片查看操作选项</p>
      </div>
    </div>
  );
}; 