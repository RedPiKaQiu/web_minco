import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';

const ProjectsPage = () => {
  const { state, dispatch } = useAppContext();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    生活: true,
    健康: true,
    工作: true,
    学习: true,
    放松: true,
    探索: true,
  });

  const categories = [
    { id: '生活', label: '生活', emoji: '🏠', color: 'bg-blue-100 text-blue-700' },
    { id: '健康', label: '健康', emoji: '💪', color: 'bg-green-100 text-green-700' },
    { id: '工作', label: '工作', emoji: '💼', color: 'bg-purple-100 text-purple-700' },
    { id: '学习', label: '学习', emoji: '📚', color: 'bg-yellow-100 text-yellow-700' },
    { id: '放松', label: '放松', emoji: '🎮', color: 'bg-pink-100 text-pink-700' },
    { id: '探索', label: '探索', emoji: '🌟', color: 'bg-indigo-100 text-indigo-700' },
  ];

  // 按分类分组任务
  const groupedTasks = categories.reduce((acc, category) => {
    acc[category.id] = state.tasks.filter(task => 
      task.category === category.label || task.type === category.id
    );
    return acc;
  }, {} as Record<string, typeof state.tasks>);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 烟花特效
    const button = e.currentTarget as HTMLElement;
    const container = document.createElement('div');
    container.className = 'absolute inset-0 overflow-hidden pointer-events-none';
    button.style.position = 'relative';
    button.appendChild(container);

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 3;

      particle.className = 'absolute rounded-full';
      particle.style.backgroundColor = color;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      container.appendChild(particle);

      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';

      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 35;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 700 + Math.random() * 600,
        easing: 'cubic-bezier(0, .9, .57, 1)'
      });
    }

    setTimeout(() => {
      container.remove();
    }, 1300);

    dispatch({ type: 'COMPLETE_TASK', payload: id });
  };

  return (
    <div className="page-content safe-area-top">
      {/* 头部 */}
      <div className="py-6">
        <h1 className="text-2xl font-bold">项目</h1>
        <p className="text-gray-500 mt-1">按分类管理你的任务</p>
      </div>

      {/* 分类列表 */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryTasks = groupedTasks[category.id] || [];
          const completedCount = categoryTasks.filter(task => task.completed).length;
          const totalCount = categoryTasks.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors touch-target no-tap-highlight"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{category.emoji}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.label}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${category.color}`}>
                    {totalCount}
                  </span>
                  <button className="p-1 touch-target">
                    {expandedCategories[category.id] ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {expandedCategories[category.id] && (
                <div className="border-t border-gray-100">
                  {categoryTasks.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      暂无{category.label}任务
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {categoryTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 no-tap-highlight ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <button
                              onClick={(e) => handleComplete(task.id, e)}
                              className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 relative transition-colors touch-target no-tap-highlight ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {task.completed && <Check className="h-3 w-3" />}
                            </button>

                            <div className="flex-grow">
                              <div className={`font-medium ${
                                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </div>
                              {task.startTime && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {task.startTime}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {task.icon && <div className="text-lg">{task.icon}</div>}
                              {task.duration && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {task.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsPage; 