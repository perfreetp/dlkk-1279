import { useState } from 'react';
import { Search, Star, Edit2, Trash2, Plus, X, Tag, Clock, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Prompt } from '../data/types';

export default function PromptLibrary() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, toggleFavoritePrompt } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isFavorite: false,
  });
  
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = searchQuery === '' || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavorites || prompt.isFavorite;
    return matchesSearch && matchesFavorite;
  });
  
  const handleOpenModal = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        title: prompt.title,
        content: prompt.content,
        tags: prompt.tags,
        isFavorite: prompt.isFavorite,
      });
    } else {
      setEditingPrompt(null);
      setFormData({ title: '', content: '', tags: [], isFavorite: false });
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPrompt(null);
  };
  
  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, formData);
    } else {
      addPrompt(formData);
    }
    handleCloseModal();
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };
  
  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">提示词库</h1>
              <p className="text-sm text-gray-500">管理和使用您的提示词模板</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建提示词</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFavorites ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
              <span className="font-medium">收藏</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                <button
                  onClick={() => toggleFavoritePrompt(prompt.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    prompt.isFavorite ? 'bg-yellow-100 text-yellow-500' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{prompt.content}</p>
              
              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(prompt.updatedAt)}
                  </span>
                  <span>使用 {prompt.usageCount} 次</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(prompt.content)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(prompt)}
                    className="p-2 hover:bg-blue-100 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePrompt(prompt.id)}
                    className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showFavorites ? '暂无收藏的提示词' : '暂无提示词'}
            </h3>
            <p className="text-gray-500">点击右上角按钮创建第一个提示词</p>
          </div>
        )}
      </main>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPrompt ? '编辑提示词' : '新建提示词'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入提示词标题"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入提示词内容，可使用 {variable} 作为占位符"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后按回车"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-700"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  className="w-4 h-4 text-accent-700 rounded focus:ring-accent-700"
                />
                <label htmlFor="isFavorite" className="text-sm text-gray-700">设为收藏</label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  保存
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
