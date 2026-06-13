import { Star, Clock, Zap, ChevronRight } from 'lucide-react';
import { Tool } from '../data/types';
import { useStore } from '../store/useStore';

interface ToolCardProps {
  tool: Tool;
  onSelect: () => void;
}

export default function ToolCard({ tool, onSelect }: ToolCardProps) {
  const { favoriteTools, toggleFavoriteTool } = useStore();
  const isFavorite = favoriteTools.includes(tool.id);
  const quotaPercent = (tool.quotaUsed / tool.quotaLimit) * 100;

  const getCategoryColor = () => {
    switch (tool.category) {
      case '写作': return 'bg-blue-100 text-blue-700';
      case '配图': return 'bg-purple-100 text-purple-700';
      case '翻译': return 'bg-green-100 text-green-700';
      case '资料整理': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getQuotaColor = () => {
    if (quotaPercent > 80) return 'bg-red-500';
    if (quotaPercent > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl hover:border-accent-200 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-accent-100 transition-colors">
          <Zap className="w-6 h-6 text-primary-600 group-hover:text-accent-700" />
        </div>
        <button
          onClick={() => toggleFavoriteTool(tool.id)}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite ? 'bg-yellow-100 text-yellow-500' : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {tool.name}
      </h3>
      
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tool.description}</p>
      
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor()}`}>
          {tool.category}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {tool.provider}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>使用额度</span>
            <span>{tool.quotaUsed} / {tool.quotaLimit}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getQuotaColor()}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>到期: {tool.expiresAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span>{tool.rating}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onSelect}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors group/btn"
      >
        <span>立即使用</span>
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
