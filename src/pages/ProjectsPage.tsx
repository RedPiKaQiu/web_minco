import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TaskCategory, TASK_CATEGORIES, Project } from '../types';
import QuickAddProject from '../components/QuickAddProject';
import ProjectDetailModal from '../components/ProjectDetailModal';

const ProjectsPage = () => {
  const { state, dispatch } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<TaskCategory>(TaskCategory.LIFE);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    tasks: true,
  });
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 使用统一的分类配置
  const categories = TASK_CATEGORIES.map(category => ({
    id: category.label,
    label: category.label,
    emoji: category.emoji
  }));

  // 根据分类筛选项目
  const categoryProjects = (state.projects || []).filter(project => project.category === activeCategory);

  // 根据分类筛选事项（未分配给项目的事项）
  const categoryTasks = (state.tasks || []).filter(task => {
    if (!task.category) return false;
    return task.category === activeCategory && !task.project;
  });

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
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

  return (
    <div className="page-content safe-area-top bg-gray-50">
      {/* Tab 标签栏 */}
      <div className="px-4 mb-6 pt-4">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <div className="grid grid-cols-6 gap-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.label as TaskCategory)}
                className={`py-3 px-1 text-xs rounded-md transition-colors ${
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
        {incompleteTasks.length > 0 && (
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
        {completedTasks.length > 0 && (
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
        {categoryProjects.length === 0 && incompleteTasks.length === 0 && completedTasks.length === 0 && (
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