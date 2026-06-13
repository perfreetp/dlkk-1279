import { useState } from 'react';
import { Users, CreditCard, Clock, Star, Plus, Check, X, AlertCircle, TrendingUp, Briefcase, Lightbulb, FileText, ChevronUp, ChevronDown, Trash2, Edit3, Save, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Position } from '../data/types';
import { mockTeam } from '../data/mockData';

export default function TeamSpace() {
  const { 
    tools, 
    recommendations, 
    applications, 
    addApplication, 
    approveApplication, 
    rejectApplication, 
    addRecommendation, 
    removeRecommendation, 
    reorderRecommendations, 
    getRecommendationsByPosition,
    positionConfigs,
    updatePositionConfig,
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'quotas' | 'recommendations' | 'applications' | 'suggestions' | 'cases'>('quotas');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [newApplication, setNewApplication] = useState({ toolName: '', description: '' });
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editingGuide, setEditingGuide] = useState({ usageGuide: '', reason: '' });
  
  const positions: Position[] = ['文案', '设计', '翻译', '运营'];
  
  const tabs = [
    { id: 'quotas', label: '额度管理', icon: CreditCard },
    { id: 'recommendations', label: '推荐清单', icon: Star },
    { id: 'cases', label: '优秀案例', icon: BookOpen },
    { id: 'applications', label: '工具申请', icon: FileText },
    { id: 'suggestions', label: '整理建议', icon: Lightbulb },
  ];
  
  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  
  const getQuotaPercent = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };
  
  const getQuotaColor = (percent: number) => {
    if (percent > 80) return 'bg-red-500';
    if (percent > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getExpiryColor = (days: number) => {
    if (days < 30) return 'text-red-600 bg-red-50';
    if (days < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };
  
  const handleSubmitApplication = () => {
    if (newApplication.toolName.trim() && newApplication.description.trim()) {
      addApplication(newApplication);
      setNewApplication({ toolName: '', description: '' });
      setShowApplicationModal(false);
    }
  };
  
  const suggestions = [
    {
      id: '1',
      title: '优化重复流程',
      description: '检测到您近期频繁使用"AI 写作助手"后接着使用"AI 润色"，建议创建组合流程提高效率。',
      tool: 'AI 写作助手 + AI 润色',
      type: 'efficiency',
    },
    {
      id: '2',
      title: '清理过期提示词',
      description: '有 3 个提示词超过 30 天未使用，建议Review或删除以保持库整洁。',
      tool: '提示词库',
      type: 'cleanup',
    },
    {
      id: '3',
      title: '额度预警',
      description: 'AI 翻译工具已使用 62.5% 额度，建议关注使用情况或申请扩容。',
      tool: 'AI 翻译',
      type: 'warning',
    },
  ];
  
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'efficiency': return 'bg-blue-50 border-blue-200';
      case 'cleanup': return 'bg-gray-50 border-gray-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'cleanup': return <FileText className="w-5 h-5 text-gray-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const moveRecommendationUp = (position: Position, index: number) => {
    if (index > 0) {
      reorderRecommendations(position, index, index - 1);
    }
  };
  
  const moveRecommendationDown = (position: Position, index: number) => {
    const recs = getRecommendationsByPosition(position);
    if (index < recs.length - 1) {
      reorderRecommendations(position, index, index + 1);
    }
  };
  
  const handleSavePositionGuide = (position: Position) => {
    updatePositionConfig(position, editingGuide.usageGuide, editingGuide.reason);
    setEditingPosition(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">团队空间</h1>
              <p className="text-sm text-gray-500">管理团队的 AI 工具资源</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">{mockTeam.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {activeTab === 'quotas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const percent = getQuotaPercent(tool.quotaUsed, tool.quotaLimit);
              const daysLeft = getDaysUntilExpiry(tool.expiresAt);
              
              return (
                <div key={tool.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                        <p className="text-sm text-gray-500">{tool.provider}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">使用额度</span>
                        <span className="font-medium text-gray-900">{tool.quotaUsed} / {tool.quotaLimit}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getQuotaColor(percent)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{percent}% 已使用</p>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getExpiryColor(daysLeft)}`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {daysLeft > 0 ? `${daysLeft} 天后到期` : '已过期'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">团队推荐工具</h2>
                <p className="text-sm text-gray-500">按岗位推荐适合的工具，支持自定义维护和使用说明</p>
              </div>
            </div>
            
            {positions.map((position) => {
              const positionRecs = getRecommendationsByPosition(position);
              const availableTools = tools.filter(t => !positionRecs.some(r => r.toolId === t.id));
              const isEditing = editingPosition === position;
              const config = positionConfigs[position];
              
              return (
                <div key={position} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-accent-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{position}岗位</h3>
                        <p className="text-sm text-gray-500">{positionRecs.length} 个推荐工具</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSavePositionGuide(position);
                        } else {
                          setEditingGuide({ usageGuide: config.usageGuide, reason: config.reason });
                          setEditingPosition(position);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          保存说明
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </>
                      )}
                    </button>
                  </div>
                  
                  {isEditing ? (
                    <div className="mb-4 p-4 bg-blue-50 rounded-xl space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">岗位使用说明</label>
                        <textarea
                          value={editingGuide.usageGuide}
                          onChange={(e) => setEditingGuide({ ...editingGuide, usageGuide: e.target.value })}
                          placeholder="输入该岗位的工具使用说明..."
                          rows={3}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">推荐理由</label>
                        <textarea
                          value={editingGuide.reason}
                          onChange={(e) => setEditingGuide({ ...editingGuide, reason: e.target.value })}
                          placeholder="输入推荐这些工具的理由..."
                          rows={2}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    config.usageGuide && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">使用说明</span>
                        </div>
                        <p className="text-sm text-gray-700">{config.usageGuide}</p>
                        {config.reason && (
                          <>
                            <div className="flex items-center gap-2 mt-3 mb-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium text-yellow-800">推荐理由</span>
                            </div>
                            <p className="text-sm text-gray-700">{config.reason}</p>
                          </>
                        )}
                      </div>
                    )
                  )}
                  
                  <div className="space-y-2">
                    {positionRecs.map((rec, index) => {
                      const tool = tools.find(t => t.id === rec.toolId);
                      return (
                        <div key={rec.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                          {isEditing && (
                            <>
                              <button
                                onClick={() => moveRecommendationUp(position, index)}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                              >
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => moveRecommendationDown(position, index)}
                                disabled={index === positionRecs.length - 1}
                                className="p-1 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                              >
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              </button>
                            </>
                          )}
                          <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{tool?.name}</p>
                            <p className="text-xs text-gray-500">{tool?.category}</p>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => removeRecommendation(position, rec.toolId)}
                              className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {isEditing && availableTools.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">添加工具到 {position} 岗位</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => addRecommendation(position, tool.id, tool.name)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'cases' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">团队优秀案例库</h2>
                <p className="text-sm text-gray-500">按岗位查看团队成员的优秀案例和可复用成果</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((position) => (
                <div key={position} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-accent-600" />
                    <h3 className="font-semibold text-gray-900">{position}岗位</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {positionConfigs[position]?.usageGuide || '暂无案例'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{getRecommendationsByPosition(position).length} 个推荐工具</span>
                    <button className="text-blue-600 hover:text-blue-700">查看全部</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">工具申请列表</h2>
              
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.toolName}</h3>
                      <p className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status === 'pending' ? '待审批' : app.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                  
                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => rejectApplication(app.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                      <button
                        onClick={() => approveApplication(app.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {applications.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无工具申请</h3>
                  <p className="text-gray-500">点击右侧按钮提交新工具申请</p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">提交工具申请</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">工具名称</label>
                    <input
                      type="text"
                      value={newApplication.toolName}
                      onChange={(e) => setNewApplication({ ...newApplication, toolName: e.target.value })}
                      placeholder="输入想要添加的工具名称"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">申请理由</label>
                    <textarea
                      value={newApplication.description}
                      onChange={(e) => setNewApplication({ ...newApplication, description: e.target.value })}
                      placeholder="说明为什么需要这个工具..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    disabled={!newApplication.toolName.trim() || !newApplication.description.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>提交申请</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">智能整理建议</h2>
            <p className="text-sm text-gray-500">基于您的使用习惯提供优化建议</p>
            
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className={`p-5 rounded-2xl border ${getSuggestionColor(suggestion.type)}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-700">
                        {suggestion.tool}
                      </span>
                      <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">确认提交申请</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">工具名称</label>
                  <p className="text-gray-900">{newApplication.toolName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">申请理由</label>
                  <p className="text-gray-900">{newApplication.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitApplication}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                  确认提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
