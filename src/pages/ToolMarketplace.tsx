import { useState } from 'react';
import { Search, Filter, TrendingUp, Clock, Zap } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import { useStore } from '../store/useStore';
import { Category, Position } from '../data/types';

const categories: (Category | 'all')[] = ['all', '写作', '配图', '翻译', '资料整理', '其他'];
const positions: (Position | 'all')[] = ['all', '文案', '设计', '翻译', '运营'];

export default function ToolMarketplace() {
  const { tools, searchQuery, setSearchQuery, selectedCategory, setCategory, selectedPosition, setPosition, getFilteredTools, favoriteTools } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredTools = getFilteredTools();
  
  const recentTasks = [
    { id: '1', name: 'AI 写作助手', time: '10分钟前', count: 3 },
    { id: '2', name: 'AI 翻译', time: '30分钟前', count: 2 },
    { id: '3', name: 'AI 图片生成', time: '1小时前', count: 1 },
  ];

  const handleToolSelect = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      window.location.href = `/workspace?tool=${toolId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">工具广场</h1>
              <p className="text-sm text-gray-500">发现和使用您的 AI 工具</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl">
                <Zap className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">今日已使用 5 次</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters ? 'bg-accent-50 border-accent-200 text-accent-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选</span>
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 flex items-center gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工具分类</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setCategory(e.target.value as Category | 'all')}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? '全部' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">岗位推荐</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setPosition(e.target.value as Position | 'all')}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700"
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos === 'all' ? '全部' : pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                全部工具 <span className="text-gray-400 font-normal">({filteredTools.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onSelect={() => handleToolSelect(tool.id)} />
              ))}
            </div>
            
            {filteredTools.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的工具</h3>
                <p className="text-gray-500">尝试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </div>
          
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">热门工具</h3>
              </div>
              <ul className="space-y-3">
                {tools.slice(0, 5).map((tool, index) => (
                  <li key={tool.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.usageCount} 次使用</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">最近使用</h3>
              </div>
              <ul className="space-y-3">
                {recentTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.name}</p>
                      <p className="text-xs text-gray-400">{task.time}</p>
                    </div>
                    <span className="text-xs text-gray-400">使用 {task.count} 次</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {favoriteTools.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">收藏工具</h3>
                </div>
                <ul className="space-y-3">
                  {tools.filter(t => favoriteTools.includes(t.id)).map((tool) => (
                    <li key={tool.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleToolSelect(tool.id)}>
                      <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tool.name}</p>
                        <p className="text-xs text-gray-500">{tool.category}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
