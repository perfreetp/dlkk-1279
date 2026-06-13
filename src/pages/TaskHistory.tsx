import { useState } from 'react';
import { Search, Star, Clock, Filter, ChevronDown, ChevronUp, Check, FileText, TrendingUp, Calendar, Award, Sparkles, FolderOpen, Plus, Trash2, X, Edit3, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Task, CaseCollection } from '../data/types';

type StatusFilter = 'all' | 'pending' | 'running' | 'completed' | 'failed';

const caseCategories = ['全部', '写作', '配图', '翻译', '整理', '其他'];

export default function TaskHistory() {
  const { 
    tasks, 
    updateTaskScore, 
    addToOutstandingCases, 
    removeFromOutstandingCases, 
    outstandingCases,
    caseCollections,
    addCaseCollection,
    updateCaseCollection,
    deleteCaseCollection,
    addTaskToCollection,
    removeTaskFromCollection,
    getTasksInCollection,
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showOutstandingOnly, setShowOutstandingOnly] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [scoringTask, setScoringTask] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCaseCategory, setSelectedCaseCategory] = useState('全部');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showCollectionList, setShowCollectionList] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionCategory, setNewCollectionCategory] = useState('写作');
  const [selectedTasksForCollection, setSelectedTasksForCollection] = useState<string[]>([]);
  
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = searchQuery === '' || 
      task.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.input.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesOutstanding = !showOutstandingOnly || outstandingCases.includes(task.id);
    return matchesSearch && matchesStatus && matchesOutstanding;
  });
  
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const date = new Date(task.createdAt).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  const statusLabels: Record<Task['status'], string> = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
  };
  
  const statusColors: Record<Task['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  
  const handleSubmitScore = (taskId: string) => {
    if (score > 0) {
      updateTaskScore(taskId, score, comment);
      setScoringTask(null);
      setScore(0);
      setComment('');
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const avgScore = completedTasks.length > 0 
    ? (completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedTasks.length).toFixed(1)
    : '0';

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      addCaseCollection({
        name: newCollectionName,
        category: newCollectionCategory,
        description: '',
        taskIds: selectedTasksForCollection,
      });
      setNewCollectionName('');
      setSelectedTasksForCollection([]);
      setShowCollectionModal(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasksForCollection(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">任务记录</h1>
              <p className="text-sm text-gray-500">查看和管理您的任务历史</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">平均评分 {avgScore}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">优秀案例 {outstandingCases.length}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl">
                <FileText className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">共 {tasks.length} 个任务</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">{statusFilter === 'all' ? '全部状态' : statusLabels[statusFilter]}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="pending">等待中</option>
                <option value="running">执行中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
            </div>
            <button
              onClick={() => setShowOutstandingOnly(!showOutstandingOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showOutstandingOnly ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Award className={`w-5 h-5 ${showOutstandingOnly ? 'fill-current' : ''}`} />
              <span className="font-medium">优秀案例</span>
            </button>
            <button
              onClick={() => setShowCollectionList(!showCollectionList)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showCollectionList ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">案例集</span>
            </button>
          </div>
          
          {showCollectionList && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-blue-700">按分类查看:</span>
              {caseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCaseCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedCaseCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setShowCollectionModal(true)}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建案例集
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        {showCollectionList && caseCollections.length > 0 && (
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900">案例集</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseCollections
                .filter(c => selectedCaseCategory === '全部' || c.category === selectedCaseCategory)
                .map((collection) => {
                  const collectionTasks = getTasksInCollection(collection.id);
                  return (
                    <div key={collection.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{collection.name}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {collection.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{collectionTasks.length} 个案例</p>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {collectionTasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 truncate">{task.toolName}</p>
                            <p className="text-xs text-gray-400 truncate">{task.input}</p>
                          </div>
                        ))}
                      </div>
                      {collectionTasks.length > 3 && (
                        <p className="text-xs text-gray-400 mt-2">还有 {collectionTasks.length - 3} 个...</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        
        {outstandingCases.length > 0 && !showOutstandingOnly && !showCollectionList && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">优秀案例</h3>
              <span className="text-sm text-gray-500">({outstandingCases.length} 个)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.filter(t => outstandingCases.includes(t.id)).slice(0, 3).map((task) => (
                <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 text-sm">{task.toolName}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{task.input}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {Object.entries(groupedTasks).map(([date, dayTasks]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">{date}</span>
              <span className="text-sm text-gray-400">({dayTasks.length} 个任务)</span>
            </div>
            
            <div className="space-y-3">
              {dayTasks.map((task) => {
                const isOutstanding = outstandingCases.includes(task.id);
                return (
                  <div 
                    key={task.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{task.toolName}</h3>
                              {isOutstanding && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                  优秀案例
                                </span>
                              )}
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                                {statusLabels[task.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{task.input}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {task.score && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= task.score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          )}
                          <span className="text-sm text-gray-400">{formatTime(task.createdAt)}</span>
                          {expandedTask === task.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedTask === task.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">输入内容</label>
                            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                              {task.input}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
                            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto">
                              {task.output}
                            </div>
                          </div>
                          
                          {task.flowSteps && task.flowSteps.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">流程详情</label>
                              <div className="space-y-2">
                                {task.flowSteps.map((step, index) => (
                                  <div key={index} className="p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                                        {index + 1}
                                      </span>
                                      <span className="font-medium text-gray-900">{step.toolName}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-7">输入: {step.input.substring(0, 50)}...</p>
                                    <p className="text-xs text-gray-600 ml-7 mt-1">输出: {step.output.substring(0, 100)}...</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {task.status === 'completed' && !task.score && scoringTask !== task.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setScoringTask(task.id);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-50 hover:bg-accent-100 text-accent-700 rounded-xl font-medium transition-colors"
                            >
                              <Star className="w-5 h-5" />
                              <span>给本次结果评分</span>
                            </button>
                          )}
                          
                          {scoringTask === task.id && (
                            <div className="p-4 bg-accent-50 rounded-xl">
                              <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-accent-700" />
                                <span className="font-medium text-accent-800">评分</span>
                              </div>
                              <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setScore(star)}
                                    className="p-2 rounded-lg transition-colors"
                                  >
                                    <Star 
                                      className={`w-8 h-8 ${star <= score ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'}`} 
                                    />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="添加评语（可选）"
                                rows={2}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700 resize-none"
                              />
                              <div className="flex items-center justify-end gap-3 mt-3">
                                <button
                                  onClick={() => setScoringTask(null)}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={() => handleSubmitScore(task.id)}
                                  disabled={score === 0}
                                  className="flex items-center gap-2 px-4 py-2 bg-accent-700 hover:bg-accent-800 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  提交评分
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {task.comment && (
                            <div className="p-3 bg-yellow-50 rounded-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-800">评语</span>
                              </div>
                              <p className="text-sm text-yellow-700">{task.comment}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 pt-2">
                            {task.status === 'completed' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isOutstanding) {
                                      removeFromOutstandingCases(task.id);
                                    } else {
                                      addToOutstandingCases(task.id);
                                    }
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors ${
                                    isOutstanding 
                                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  <Award className={`w-4 h-4 ${isOutstanding ? 'fill-current' : ''}`} />
                                  <span>{isOutstanding ? '移除优秀案例' : '加入优秀案例'}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskSelection(task.id);
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors ${
                                    selectedTasksForCollection.includes(task.id)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  <FolderOpen className="w-4 h-4" />
                                  <span>{selectedTasksForCollection.includes(task.id) ? '已选择' : '加入案例集'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showOutstandingOnly ? '暂无优秀案例' : showCollectionList ? '暂无案例集' : '暂无任务记录'}
            </h3>
            <p className="text-gray-500">
              {showOutstandingOnly ? '将高质量任务添加到优秀案例' : 
               showCollectionList ? '创建案例集来整理优秀任务' : 
               '在工作台执行任务后会在这里显示记录'}
            </p>
          </div>
        )}
      </main>
      
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">新建案例集</h2>
                <button onClick={() => setShowCollectionModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">案例集名称</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="输入案例集名称"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={newCollectionCategory}
                  onChange={(e) => setNewCollectionCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700"
                >
                  {caseCategories.filter(c => c !== '全部').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {selectedTasksForCollection.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已选择 {selectedTasksForCollection.length} 个任务
                  </label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {tasks.filter(t => selectedTasksForCollection.includes(t.id)).map((task) => (
                      <div key={task.id} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate">{task.toolName}</span>
                        <button
                          onClick={() => toggleTaskSelection(task.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500">
                也可以先创建空的案例集，之后再添加任务。
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                创建案例集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
