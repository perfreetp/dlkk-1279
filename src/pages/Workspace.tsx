import { useState, useEffect } from 'react';
import { Zap, Play, Plus, Trash2, Copy, Check, Sparkles, FileText, Wand2, ArrowUp, ArrowDown, ChevronRight, Bookmark, FolderOpen, Save, X, RotateCcw } from 'lucide-react';
import { useStore, FlowExecution } from '../store/useStore';

export default function Workspace() {
  const { 
    tools, 
    prompts, 
    addTask, 
    getFavoritePrompts,
    flowSteps,
    addFlowStep,
    removeFlowStep,
    reorderFlowSteps,
    executeFlow,
    currentFlowExecution,
    flowTemplates,
    addFlowTemplate,
    deleteFlowTemplate,
    loadFlowTemplate,
    setFlowSteps,
    tasks,
    addToOutstandingCases,
  } = useStore();
  
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [showExecutionResult, setShowExecutionResult] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  
  const favoritePrompts = getFavoritePrompts();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    if (toolId) {
      setSelectedTool(toolId);
    }
  }, []);
  
  useEffect(() => {
    if (currentFlowExecution?.status === 'completed') {
      setShowExecutionResult(true);
    }
  }, [currentFlowExecution]);
  
  const selectedToolData = tools.find(t => t.id === selectedTool);
  
  const handleRun = async () => {
    if (!selectedTool || !inputText.trim()) return;
    
    setIsRunning(true);
    setOutputText('');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = 'AI 正在处理您的请求...\n\n这是生成的结果内容。\n\n人工智能正在改变我们的生活和工作方式，它能够帮助我们更高效地完成各种任务，从写作到翻译，从设计到数据分析。';
    setOutputText(result);
    setIsRunning(false);
    
    addTask({
      userId: 'user1',
      toolId: selectedTool,
      toolName: selectedToolData?.name || '',
      input: inputText,
      output: result,
      status: 'completed',
    });
  };
  
  const handleExecuteFlow = async () => {
    if (flowSteps.length === 0 || !inputText.trim()) return;
    
    setShowExecutionResult(false);
    await executeFlow(inputText);
  };
  
  const handleSelectPrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      setInputText(prompt.content);
      setSelectedPrompt(promptId);
      setShowPromptSelector(false);
    }
  };
  
  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText);
  };
  
  const handleCopyAsNewTask = () => {
    if (outputText) {
      setInputText(outputText);
      setShowCopyModal(false);
    }
  };
  
  const moveStepUp = (index: number) => {
    if (index > 0) {
      reorderFlowSteps(index, index - 1);
    }
  };
  
  const moveStepDown = (index: number) => {
    if (index < flowSteps.length - 1) {
      reorderFlowSteps(index, index + 1);
    }
  };
  
  const handleSaveTemplate = () => {
    if (templateName.trim() && flowSteps.length > 0) {
      addFlowTemplate(templateName, templateDescription);
      setTemplateName('');
      setTemplateDescription('');
      setShowTemplateModal(false);
    }
  };
  
  const handleLoadTemplate = (templateId: string) => {
    loadFlowTemplate(templateId);
    setShowTemplateList(false);
  };
  
  const handleSaveToOutstanding = () => {
    const latestTask = tasks[0];
    if (latestTask) {
      addToOutstandingCases(latestTask.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
              <p className="text-sm text-gray-500">选择工具并执行任务</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">选择工具</h3>
              </div>
              <ul className="space-y-2">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <button
                      onClick={() => setSelectedTool(tool.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedTool === tool.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedTool === tool.id ? 'bg-white/20' : 'bg-primary-100'
                      }`}>
                        <Zap className={`w-5 h-5 ${selectedTool === tool.id ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-xs opacity-70">{tool.category}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="col-span-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {selectedToolData ? (
                <div className="p-4 border-b border-gray-100 bg-primary-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedToolData.name}</h3>
                        <p className="text-sm text-gray-500">{selectedToolData.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addFlowStep(selectedToolData.id)}
                      disabled={flowSteps.includes(selectedToolData.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        flowSteps.includes(selectedToolData.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {flowSteps.includes(selectedToolData.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          已添加
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          添加到流程
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个工具开始</h3>
                  <p className="text-gray-500">从左侧选择一个工具来执行任务</p>
                </div>
              )}
              
              {selectedToolData && (
                <>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <label className="font-medium text-gray-700">输入内容</label>
                      <button
                        onClick={() => setShowPromptSelector(!showPromptSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-sm font-medium hover:bg-accent-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        使用提示词
                      </button>
                    </div>
                    
                    {showPromptSelector && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-2">选择提示词模板:</p>
                        <div className="space-y-2">
                          {favoritePrompts.length > 0 ? (
                            favoritePrompts.map((prompt) => (
                              <button
                                key={prompt.id}
                                onClick={() => handleSelectPrompt(prompt.id)}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                                  selectedPrompt === prompt.id ? 'bg-accent-100 text-accent-700' : 'bg-white hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                {prompt.title}
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">暂无收藏的提示词</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="输入您的请求..."
                      className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={handleRun}
                      disabled={!inputText.trim() || isRunning}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>处理中...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>执行单工具</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {outputText && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-gray-700">输出结果</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveToOutstanding}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm font-medium text-yellow-700 transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                            收藏
                          </button>
                          <button
                            onClick={() => setShowCopyModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            复制到输入
                          </button>
                          <button
                            onClick={handleCopyOutput}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            复制
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl min-h-[200px] whitespace-pre-wrap text-gray-700">
                        {outputText}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="col-span-3 space-y-6">
            {flowSteps.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">流程组合</h3>
                  <span className="text-sm text-gray-500">{flowSteps.length} 个步骤</span>
                </div>
                <div className="space-y-2">
                  {flowSteps.map((toolId, index) => {
                    const tool = tools.find(t => t.id === toolId);
                    return (
                      <div key={toolId} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <button
                          onClick={() => moveStepUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <ArrowUp className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => moveStepDown(index)}
                          disabled={index === flowSteps.length - 1}
                          className="p-1 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <ArrowDown className="w-4 h-4 text-gray-500" />
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-900">{tool?.name}</span>
                          </div>
                          {index < flowSteps.length - 1 && (
                            <div className="ml-8 flex items-center gap-1 text-gray-400">
                              <ChevronRight className="w-3 h-3" />
                              <span className="text-xs">输出作为下一个工具的输入</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFlowStep(toolId)}
                          className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => setShowTemplateList(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>从模板载入</span>
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>保存为模板</span>
                  </button>
                  <button
                    onClick={handleExecuteFlow}
                    disabled={!inputText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-700 hover:bg-accent-800 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>执行流程</span>
                  </button>
                </div>
              </div>
            )}
            
            {showTemplateList && flowTemplates.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">流程模板</h3>
                  <button onClick={() => setShowTemplateList(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {flowTemplates.map((template) => (
                    <div key={template.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{template.name}</span>
                        <span className="text-xs text-gray-400">使用 {template.usageCount} 次</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadTemplate(template.id)}
                          className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          载入
                        </button>
                        <button
                          onClick={() => deleteFlowTemplate(template.id)}
                          className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentFlowExecution && showExecutionResult && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">流程执行结果</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {currentFlowExecution.steps.map((step, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === 'completed' ? 'bg-green-100 text-green-600' :
                          step.status === 'running' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{step.toolName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          step.status === 'completed' ? 'bg-green-100 text-green-700' :
                          step.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {step.status === 'completed' ? '已完成' : step.status === 'running' ? '执行中' : '等待'}
                        </span>
                      </div>
                      {step.output && (
                        <p className="text-sm text-gray-600 line-clamp-3">{step.output}</p>
                      )}
                    </div>
                  ))}
                </div>
                {currentFlowExecution.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">流程执行完成</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">结果已保存到任务记录</p>
                    <button
                      onClick={handleSaveToOutstanding}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      收藏为优秀案例
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-semibold">AI 助手提示</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                尝试使用提示词模板来获得更好的结果。您可以在提示词库中创建和管理自己的模板。
              </p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                查看提示词库
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">保存流程模板</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="输入模板名称"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板描述</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="输入模板描述（可选）"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-700 focus:border-transparent resize-none"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">包含 {flowSteps.length} 个步骤:</p>
                <ul className="mt-2 space-y-1">
                  {flowSteps.map((toolId, index) => {
                    const tool = tools.find(t => t.id === toolId);
                    return (
                      <li key={toolId} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                          {index + 1}
                        </span>
                        {tool?.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                保存模板
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">复制输出结果</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">将当前输出结果复制到输入框，可以基于此结果继续优化或执行其他工具。</p>
              <div className="p-3 bg-gray-50 rounded-xl max-h-[150px] overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{outputText.substring(0, 200)}...</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCopyAsNewTask}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                复制到输入框
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
