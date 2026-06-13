import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tool, Task, Prompt, User, Recommendation, Application, Category, Position } from '../data/types';
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
  
  addRecommendation: (position: Position, toolId: string, toolName: string) => void;
  removeRecommendation: (position: Position, toolId: string) => void;
  reorderRecommendations: (position: Position, fromIndex: number, toIndex: number) => void;
  
  getFilteredTools: () => Tool[];
  getFavoritePrompts: () => Prompt[];
  getTasksByStatus: (status?: Task['status']) => Task[];
  getRecommendationsByPosition: (position: Position) => Recommendation[];
}

const STORAGE_KEY = 'ai-toolbox-storage';

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
        
        const execution: FlowExecution = {
          id: `flow-${Date.now()}`,
          steps: flowSteps.map((toolId) => {
            const tool = tools.find((t) => t.id === toolId);
            return {
              toolId,
              toolName: tool?.name || '',
              input: '',
              output: '',
              status: 'pending',
            };
          }),
          currentStep: 0,
          status: 'running',
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
        });
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
      }),
    }
  )
);
