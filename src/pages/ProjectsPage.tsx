/**
 * 项目页面，按分类展示项目列表和项目下的任务，支持项目管理操作
 */
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useProjectTasks } from '../hooks/useTaskData';
import { Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ItemCategory, ITEM_CATEGORIES, Project, Task, Item } from '../types';
import QuickAddProject from '../components/QuickAddProject';
import ProjectDetailModal from '../components/ProjectDetailModal';

// API Item 到 Task 的转换函数
const convertApiItemToTask = (apiItem: Item): Task => {
  return {
    id: apiItem.id,
    title: apiItem.title,
    completed: apiItem.status_id === 3, // 3表示已完成
    dueDate: apiItem.start_time ? apiItem.start_time.split('T')[0] : undefined,
    startTime: apiItem.start_time ? apiItem.start_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
    endTime: apiItem.end_time ? apiItem.end_time.split('T')[1]?.split(':').slice(0, 2).join(':') : undefined,
    priority: (apiItem.priority >= 4 ? 'high' : apiItem.priority >= 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    // 正确映射TaskCategory枚举
    category: apiItem.category_id === 1 ? ItemCategory.LIFE : 
              apiItem.category_id === 2 ? ItemCategory.HEALTH :
              apiItem.category_id === 3 ? ItemCategory.WORK :
              apiItem.category_id === 4 ? ItemCategory.STUDY :
              apiItem.category_id === 5 ? ItemCategory.RELAX :
              apiItem.category_id === 6 ? ItemCategory.EXPLORE : undefined,
    isAnytime: !apiItem.start_time,
    icon: apiItem.emoji,
    duration: apiItem.estimated_duration ? `${apiItem.estimated_duration}分钟` : undefined,
    project: apiItem.project_id // 添加项目关联
  };
};

// TaskCategory 到 category_id 的映射
const getCategoryId = (category: ItemCategory): number => {
  switch (category) {
    case ItemCategory.LIFE: return 1;
    case ItemCategory.HEALTH: return 2;
    case ItemCategory.WORK: return 3;
    case ItemCategory.STUDY: return 4;
    case ItemCategory.RELAX: return 5;
    case ItemCategory.EXPLORE: return 6;
    default: return 1;
  }
};

const ProjectsPage = () => {
  const { state, dispatch } = useAppContext();
  
  // 使用新的项目任务数据hook
  const {
    categoryTasks: apiCategoryTasks,
    isLoading: projectsLoading,
    error: projectsError,
    loadCategoryTasks,
    setSelectedCategoryId,
    refreshFromCache
  } = useProjectTasks();
  
  const [activeCategory, setActiveCategory] = useState<ItemCategory>(ItemCategory.LIFE);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    tasks: true,
  });
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 使用统一的分类配置
  const categories = ITEM_CATEGORIES.map(category => ({
    id: category.label,
    label: category.label,
    emoji: category.emoji
  }));

  // 转换API数据为Task格式
  const categoryTasks = apiCategoryTasks.map(convertApiItemToTask);

  // 页面初始化时加载默认分类的任务
  useEffect(() => {
    const categoryId = getCategoryId(activeCategory);
    console.log('📂 ProjectsPage: 初始化，加载分类任务', { activeCategory, categoryId });
    loadCategoryTasks(categoryId);
  }, []); // 只在组件挂载时执行一次

  // 使用useRef来追踪当前分类，避免闭包问题
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  // 监听页面焦点，返回页面时刷新缓存数据
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ ProjectsPage: 页面重新获得焦点，尝试刷新缓存');
      const refreshed = refreshFromCache();
      if (!refreshed) {
        console.log('📡 ProjectsPage: 缓存刷新失败，重新加载数据');
        const categoryId = getCategoryId(activeCategoryRef.current);
        loadCategoryTasks(categoryId);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 ProjectsPage: 页面变为可见，尝试刷新缓存');
        const refreshed = refreshFromCache();
        if (!refreshed) {
          console.log('📡 ProjectsPage: 缓存刷新失败，重新加载数据');
          const categoryId = getCategoryId(activeCategoryRef.current);
          loadCategoryTasks(categoryId);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // 只在组件挂载时添加监听器

  // 根据分类筛选项目（这部分暂时保持从全局状态获取，因为项目数据暂时还在AppContext中）
  const categoryProjects = (state.projects || []).filter(project => project.category === activeCategory);

  const completedTasks = categoryTasks.filter(task => task.completed);
  const incompleteTasks = categoryTasks.filter(task => !task.completed);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'COMPLETE_TASK', payload: id });
  };

  const handleAddProject = () => {
    setIsAddProjectOpen(true);
  };

  const handleProjectAdded = () => {
    console.log('📂 ProjectsPage: 项目添加成功，刷新当前分类数据');
    // 强制刷新当前分类的数据
    const categoryId = getCategoryId(activeCategory);
    loadCategoryTasks(categoryId, true); // 强制刷新
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  // 切换分类
  const handleCategoryChange = async (categoryLabel: ItemCategory) => {
    console.log('📂 ProjectsPage: 切换分类', { from: activeCategory, to: categoryLabel });
    
    setActiveCategory(categoryLabel);
    const categoryId = getCategoryId(categoryLabel);
    setSelectedCategoryId(categoryId);
    
    // 加载新分类的任务
    try {
      await loadCategoryTasks(categoryId);
    } catch (error) {
      console.error('加载分类任务失败:', error);
    }
  };

  const calculateProgress = (project: Project): number => {
    const projectTasks = (state.tasks || []).filter(task => task.project === project.title);
    if (projectTasks.length === 0) return 0;
    const completedCount = projectTasks.filter(task => task.completed).length;
    return Math.round((completedCount / projectTasks.length) * 100);
  };

  // 更新项目的事项计数和进度
  const getUpdatedProject = (project: Project): Project => {
    const projectTasks = (state.tasks || []).filter(task => task.project === project.title);
    const progress = calculateProgress(project);
    return {
      ...project,
      taskCount: projectTasks.length,
      progress: progress
    };
  };

  // 使用新的loading和error状态
  const isLoading = projectsLoading;
  const error = projectsError;

  return (
    <div className="page-content safe-area-top bg-gray-50">
      {/* Tab 标签栏 */}
      <div className="px-4 mb-6 pt-4">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <div className="grid grid-cols-6 gap-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.label as ItemCategory)}
                disabled={isLoading}
                className={`py-3 px-1 text-xs rounded-md transition-colors disabled:opacity-50 ${
                  activeCategory === category.label
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">{category.emoji}</span>
                  <span>{category.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 加载状态指示器 */}
        {isLoading && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              正在加载{activeCategory}数据...
            </div>
          </div>
        )}
        
        {/* 错误状态 */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">加载失败: {error}</p>
              <button 
                onClick={() => loadCategoryTasks(getCategoryId(activeCategory))}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {/* 项目部分 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('projects')}
              className="flex items-center text-left"
            >
              <span className="text-sm font-medium text-gray-600">项目 ({categoryProjects.length})</span>
              <div className="ml-2">
                {expandedSections.projects ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
            <button 
              onClick={handleAddProject}
              className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {expandedSections.projects && (
            <div className="grid grid-cols-1 gap-3">
              {categoryProjects.length > 0 ? (
                categoryProjects.map((project) => {
                  const updatedProject = getUpdatedProject(project);
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                      onClick={() => handleProjectClick(updatedProject)}
                      style={{ borderLeft: `4px solid ${project.color || "#e5e7eb"}` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start">
                          <div className="text-2xl mr-3">{project.icon || "📁"}</div>
                          <div>
                            <h3 className="font-medium text-lg">{project.title}</h3>
                            <p className="text-gray-500 text-sm">{project.description}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          {project.category}
                        </span>
                      </div>

                      {project.hasProgress && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">进度</span>
                            <span className="font-medium">{updatedProject.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${updatedProject.progress}%`,
                                backgroundColor: project.color || '#3b82f6'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <div>{updatedProject.taskCount} 个事项</div>
                        {project.dueDate && <div>截止: {project.dueDate}</div>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-gray-500 mb-2">暂无{activeCategory}项目</p>
                  <button 
                    onClick={handleAddProject}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    创建第一个项目
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 事项部分 */}
        {!isLoading && incompleteTasks.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('tasks')}
              className="flex items-center w-full justify-start"
            >
              <span className="text-sm font-medium text-gray-600">未分配事项 ({incompleteTasks.length})</span>
              <div className="ml-2">
                {expandedSections.tasks ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.tasks && (
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-lg mr-2">{task.icon || "📌"}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {task.startTime && (
                            <p className="text-xs text-gray-500 mt-1">{task.startTime}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.duration && (
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                            {task.duration}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleComplete(task.id, e)}
                          className="h-6 w-6 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center"
                        >
                          {task.completed && <Check className="h-3 w-3 text-green-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 已完成事项部分 */}
        {!isLoading && completedTasks.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('completed')}
              className="flex items-center w-full justify-start"
            >
              <span className="text-sm font-medium text-gray-600">已完成 ({completedTasks.length})</span>
              <div className="ml-2">
                {expandedSections.completed ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.completed && (
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-3 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-lg mr-2">{task.icon || "📌"}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-through">{task.title}</h4>
                          {task.startTime && (
                            <p className="text-xs text-gray-500 mt-1">{task.startTime}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleComplete(task.id, e)}
                        className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && categoryProjects.length === 0 && incompleteTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p className="mb-4">暂无{activeCategory}相关的项目或事项</p>
            <button 
              onClick={handleAddProject}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              创建第一个项目
            </button>
          </div>
        )}
      </div>

      {/* 添加项目弹框 */}
      {isAddProjectOpen && (
        <QuickAddProject
          category={activeCategory}
          onClose={() => setIsAddProjectOpen(false)}
          onProjectAdded={handleProjectAdded}
        />
      )}

      {/* 项目详情弹框 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage; 