import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tool, Task, Prompt, User, Recommendation, Application, Category, Position, CaseCollection, FlowTemplate, FlowStepRecord } from '../data/types';
import { mockTools, mockTasks, mockPrompts, mockUser, mockRecommendations, mockApplications } from '../data/mockData';

export interface FlowStep {
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed';
}

export interface FlowExecution {
  id: string;
  steps: FlowStep[];
  currentStep: number;
  status: 'pending' | 'running' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface AppState {
  user: User;
  tools: Tool[];
  tasks: Task[];
  prompts: Prompt[];
  recommendations: Recommendation[];
  applications: Application[];
  selectedCategory: Category | 'all';
  selectedPosition: Position | 'all';
  searchQuery: string;
  favoriteTools: string[];
  flowSteps: string[];
  flowExecutions: FlowExecution[];
  outstandingCases: string[];
  currentFlowExecution: FlowExecution | null;
  flowTemplates: FlowTemplate[];
  caseCollections: CaseCollection[];
  positionConfigs: Record<Position, { usageGuide: string; reason: string }>;
  
  setSearchQuery: (query: string) => void;
  setCategory: (category: Category | 'all') => void;
  setPosition: (position: Position | 'all') => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskScore: (taskId: string, score: number, comment?: string) => void;
  addToOutstandingCases: (taskId: string) => void;
  removeFromOutstandingCases: (taskId: string) => void;
  
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'userId'>) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  toggleFavoritePrompt: (id: string) => void;
  
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'status' | 'teamId'>) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string) => void;
  
  toggleFavoriteTool: (toolId: string) => void;
  
  setFlowSteps: (steps: string[]) => void;
  addFlowStep: (toolId: string) => void;
  removeFlowStep: (toolId: string) => void;
  reorderFlowSteps: (fromIndex: number, toIndex: number) => void;
  executeFlow: (initialInput: string) => Promise<void>;
  
  addFlowTemplate: (name: string, description: string) => void;
  updateFlowTemplate: (id: string, data: Partial<FlowTemplate>) => void;
  deleteFlowTemplate: (id: string) => void;
  loadFlowTemplate: (id: string) => void;
  
  addCaseCollection: (collection: Omit<CaseCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCaseCollection: (id: string, data: Partial<CaseCollection>) => void;
  deleteCaseCollection: (id: string) => void;
  addTaskToCollection: (collectionId: string, taskId: string) => void;
  removeTaskFromCollection: (collectionId: string, taskId: string) => void;
  
  addRecommendation: (position: Position, toolId: string, toolName: string) => void;
  removeRecommendation: (position: Position, toolId: string) => void;
  reorderRecommendations: (position: Position, fromIndex: number, toIndex: number) => void;
  updateRecommendationGuide: (position: Position, toolId: string, usageGuide: string, reason: string) => void;
  updatePositionConfig: (position: Position, usageGuide: string, reason: string) => void;
  
  getFilteredTools: () => Tool[];
  getFavoritePrompts: () => Prompt[];
  getTasksByStatus: (status?: Task['status']) => Task[];
  getRecommendationsByPosition: (position: Position) => Recommendation[];
  getCaseCollectionsByPosition: (position: Position) => CaseCollection[];
  getTasksInCollection: (collectionId: string) => Task[];
  getOutstandingTasks: () => Task[];
}

const STORAGE_KEY = 'ai-toolbox-storage';

const defaultPositionConfigs: Record<Position, { usageGuide: string; reason: string }> = {
  '文案': {
    usageGuide: '文案岗位主要负责内容创作，包括文章撰写、广告文案、产品描述等。建议优先使用写作类和翻译类工具。',
    reason: '文案工作需要大量文字创作和润色，AI写作和润色工具能显著提升效率。'
  },
  '设计': {
    usageGuide: '设计岗位需要配图、图表生成等视觉素材。建议使用图片生成和图表工具获取设计素材。',
    reason: '设计工作需要大量视觉素材，AI配图工具可以快速生成符合需求的图片资源。'
  },
  '翻译': {
    usageGuide: '翻译岗位专注于多语言内容转换。推荐使用翻译工具配合写作工具进行本地化处理。',
    reason: '翻译工作需要高效准确的翻译工具，AI翻译配合润色可保证翻译质量。'
  },
  '运营': {
    usageGuide: '运营岗位需要整理资料、制作报告。推荐使用摘要、思维导图等工具进行信息整理。',
    reason: '运营工作涉及大量信息整理和汇报，AI摘要和整理工具能提高信息处理效率。'
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      tools: mockTools,
      tasks: mockTasks,
      prompts: mockPrompts,
      recommendations: mockRecommendations,
      applications: mockApplications,
      selectedCategory: 'all',
      selectedPosition: 'all',
      searchQuery: '',
      favoriteTools: ['1', '3'],
      flowSteps: [],
      flowExecutions: [],
      outstandingCases: [],
      currentFlowExecution: null,
      flowTemplates: [],
      caseCollections: [],
      positionConfigs: defaultPositionConfigs,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategory: (category) => set({ selectedCategory: category }),
      setPosition: (position) => set({ selectedPosition: position }),
      
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },
      
      updateTaskScore: (taskId, score, comment) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, score, comment, completedAt: task.completedAt || new Date().toISOString() }
              : task
          ),
        }));
      },
      
      addToOutstandingCases: (taskId) => {
        set((state) => ({
          outstandingCases: state.outstandingCases.includes(taskId)
            ? state.outstandingCases
            : [...state.outstandingCases, taskId],
        }));
      },
      
      removeFromOutstandingCases: (taskId) => {
        set((state) => ({
          outstandingCases: state.outstandingCases.filter((id) => id !== taskId),
        }));
      },
      
      addPrompt: (prompt) => {
        const newPrompt: Prompt = {
          ...prompt,
          userId: get().user.id,
          id: `prompt-${Date.now()}`,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
      },
      
      updatePrompt: (id, prompt) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...prompt, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      deletePrompt: (id) => {
        set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
      },
      
      toggleFavoritePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        }));
      },
      
      addApplication: (application) => {
        const newApplication: Application = {
          ...application,
          teamId: get().user.teamId,
          status: 'pending',
          id: `app-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ applications: [newApplication, ...state.applications] }));
      },
      
      approveApplication: (id) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status: 'approved', reviewedAt: new Date().toISOString() } : app
          ),
        }));
      },
      
      rejectApplication: (id) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString() } : app
          ),
        }));
      },
      
      toggleFavoriteTool: (toolId) => {
        set((state) => ({
          favoriteTools: state.favoriteTools.includes(toolId)
            ? state.favoriteTools.filter((id) => id !== toolId)
            : [...state.favoriteTools, toolId],
        }));
      },
      
      setFlowSteps: (steps) => set({ flowSteps: steps }),
      
      addFlowStep: (toolId) => {
        set((state) => ({
          flowSteps: state.flowSteps.includes(toolId)
            ? state.flowSteps
            : [...state.flowSteps, toolId],
        }));
      },
      
      removeFlowStep: (toolId) => {
        set((state) => ({
          flowSteps: state.flowSteps.filter((id) => id !== toolId),
        }));
      },
      
      reorderFlowSteps: (fromIndex, toIndex) => {
        set((state) => {
          const newSteps = [...state.flowSteps];
          const [removed] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, removed);
          return { flowSteps: newSteps };
        });
      },
      
      executeFlow: async (initialInput: string) => {
        const { tools, flowSteps, addTask } = get();
        
        const flowStepsRecord: FlowStepRecord[] = [];
        
        const execution: FlowExecution = {
          id: `flow-${Date.now()}`,
          steps: flowSteps.map((toolId) => {
            const tool = tools.find((t) => t.id === toolId);
            return {
              toolId,
              toolName: tool?.name || '',
              input: '',
              output: '',
              status: 'pending' as const,
            };
          }),
          currentStep: 0,
          status: 'running' as const,
          createdAt: new Date().toISOString(),
        };
        
        set({ currentFlowExecution: execution });
        
        let currentInput = initialInput;
        
        for (let i = 0; i < execution.steps.length; i++) {
          set((state) => {
            if (!state.currentFlowExecution) return state;
            const newSteps = [...state.currentFlowExecution.steps];
            newSteps[i] = { ...newSteps[i], input: currentInput, status: 'running' };
            return {
              currentFlowExecution: {
                ...state.currentFlowExecution,
                steps: newSteps,
                currentStep: i,
              },
            };
          });
          
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          const mockOutput = `步骤 ${i + 1} (${execution.steps[i].toolName}) 处理结果：\n\n基于输入 "${currentInput.substring(0, 30)}..."，AI 生成了以下内容：\n\n这是 ${execution.steps[i].toolName} 工具处理后的输出结果。该工具成功分析了输入内容，并按照预设的逻辑进行了处理和转换。`;
          
          currentInput = mockOutput;
          flowStepsRecord.push({
            toolId: execution.steps[i].toolId,
            toolName: execution.steps[i].toolName,
            input: execution.steps[i].input,
            output: mockOutput,
          });
          
          set((state) => {
            if (!state.currentFlowExecution) return state;
            const newSteps = [...state.currentFlowExecution.steps];
            newSteps[i] = { ...newSteps[i], output: mockOutput, status: 'completed' };
            return {
              currentFlowExecution: {
                ...state.currentFlowExecution,
                steps: newSteps,
              },
            };
          });
        }
        
        set((state) => {
          if (!state.currentFlowExecution) return state;
          return {
            currentFlowExecution: {
              ...state.currentFlowExecution,
              status: 'completed',
              completedAt: new Date().toISOString(),
            },
            flowExecutions: [state.currentFlowExecution, ...state.flowExecutions],
          };
        });
        
        const finalStep = execution.steps[execution.steps.length - 1];
        addTask({
          userId: get().user.id,
          toolId: finalStep.toolId,
          toolName: `流程: ${execution.steps.map((s) => s.toolName).join(' → ')}`,
          input: initialInput,
          output: currentInput,
          status: 'completed',
          completedAt: new Date().toISOString(),
          flowSteps: flowStepsRecord,
        });
      },
      
      addFlowTemplate: (name, description) => {
        const { flowSteps, tools } = get();
        if (flowSteps.length === 0) return;
        
        const newTemplate: FlowTemplate = {
          id: `template-${Date.now()}`,
          name,
          description,
          steps: flowSteps,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ flowTemplates: [newTemplate, ...state.flowTemplates] }));
      },
      
      updateFlowTemplate: (id, data) => {
        set((state) => ({
          flowTemplates: state.flowTemplates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      deleteFlowTemplate: (id) => {
        set((state) => ({ flowTemplates: state.flowTemplates.filter((t) => t.id !== id) }));
      },
      
      loadFlowTemplate: (id) => {
        const template = get().flowTemplates.find((t) => t.id === id);
        if (template) {
          set({ flowSteps: template.steps });
          set((state) => ({
            flowTemplates: state.flowTemplates.map((t) =>
              t.id === id
                ? { ...t, usageCount: t.usageCount + 1, lastUsedAt: new Date().toISOString() }
                : t
            ),
          }));
        }
      },
      
      addCaseCollection: (collection) => {
        const newCollection: CaseCollection = {
          ...collection,
          id: `collection-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ caseCollections: [newCollection, ...state.caseCollections] }));
      },
      
      updateCaseCollection: (id, data) => {
        set((state) => ({
          caseCollections: state.caseCollections.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      deleteCaseCollection: (id) => {
        set((state) => ({ caseCollections: state.caseCollections.filter((c) => c.id !== id) }));
      },
      
      addTaskToCollection: (collectionId, taskId) => {
        set((state) => ({
          caseCollections: state.caseCollections.map((c) =>
            c.id === collectionId && !c.taskIds.includes(taskId)
              ? { ...c, taskIds: [...c.taskIds, taskId], updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      
      removeTaskFromCollection: (collectionId, taskId) => {
        set((state) => ({
          caseCollections: state.caseCollections.map((c) =>
            c.id === collectionId
              ? { ...c, taskIds: c.taskIds.filter((id) => id !== taskId), updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      
      addRecommendation: (position, toolId, toolName) => {
        set((state) => {
          const exists = state.recommendations.some(
            (r) => r.position === position && r.toolId === toolId
          );
          if (exists) return state;
          return {
            recommendations: [
              ...state.recommendations,
              {
                id: `rec-${Date.now()}`,
                teamId: get().user.teamId,
                toolId,
                toolName,
                position,
              },
            ],
          };
        });
      },
      
      removeRecommendation: (position, toolId) => {
        set((state) => ({
          recommendations: state.recommendations.filter(
            (r) => !(r.position === position && r.toolId === toolId)
          ),
        }));
      },
      
      reorderRecommendations: (position, fromIndex, toIndex) => {
        set((state) => {
          const positionRecs = state.recommendations.filter((r) => r.position === position);
          const otherRecs = state.recommendations.filter((r) => r.position !== position);
          
          const newPositionRecs = [...positionRecs];
          const [removed] = newPositionRecs.splice(fromIndex, 1);
          newPositionRecs.splice(toIndex, 0, removed);
          
          return { recommendations: [...otherRecs, ...newPositionRecs] };
        });
      },
      
      updateRecommendationGuide: (position, toolId, usageGuide, reason) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.position === position && r.toolId === toolId
              ? { ...r, usageGuide, reason }
              : r
          ),
        }));
      },
      
      updatePositionConfig: (position, usageGuide, reason) => {
        set((state) => ({
          positionConfigs: {
            ...state.positionConfigs,
            [position]: { usageGuide, reason },
          },
        }));
      },
      
      getFilteredTools: () => {
        const { tools, selectedCategory, selectedPosition, searchQuery, recommendations } = get();
        
        return tools.filter((tool) => {
          const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
          
          const matchesPosition =
            selectedPosition === 'all'
              ? true
              : recommendations.some(
                  (rec) => rec.toolId === tool.id && rec.position === selectedPosition
                );
          
          const matchesSearch =
            searchQuery === '' ||
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          return matchesCategory && matchesPosition && matchesSearch;
        });
      },
      
      getFavoritePrompts: () => {
        return get().prompts.filter((p) => p.isFavorite);
      },
      
      getTasksByStatus: (status) => {
        const tasks = get().tasks;
        if (!status) return tasks;
        return tasks.filter((task) => task.status === status);
      },
      
      getRecommendationsByPosition: (position) => {
        return get().recommendations.filter((r) => r.position === position);
      },
      
      getCaseCollectionsByPosition: (position) => {
        return get().caseCollections.filter((c) => c.position === position);
      },
      
      getTasksInCollection: (collectionId) => {
        const collection = get().caseCollections.find((c) => c.id === collectionId);
        if (!collection) return [];
        return get().tasks.filter((t) => collection.taskIds.includes(t.id));
      },
      
      getOutstandingTasks: () => {
        const { tasks, outstandingCases } = get();
        return tasks.filter((t) => outstandingCases.includes(t.id));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        tasks: state.tasks,
        prompts: state.prompts,
        recommendations: state.recommendations,
        applications: state.applications,
        favoriteTools: state.favoriteTools,
        outstandingCases: state.outstandingCases,
        flowExecutions: state.flowExecutions,
        flowTemplates: state.flowTemplates,
        caseCollections: state.caseCollections,
        positionConfigs: state.positionConfigs,
      }),
    }
  )
);
