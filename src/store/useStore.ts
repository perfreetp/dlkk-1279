import { create } from 'zustand';
import { Tool, Task, Prompt, User, Recommendation, Application, Category, Position } from '../data/types';
import { mockTools, mockTasks, mockPrompts, mockUser, mockRecommendations, mockApplications } from '../data/mockData';

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
  
  setSearchQuery: (query: string) => void;
  setCategory: (category: Category | 'all') => void;
  setPosition: (position: Position | 'all') => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskScore: (taskId: string, score: number, comment?: string) => void;
  
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'userId'>) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  toggleFavoritePrompt: (id: string) => void;
  
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'status' | 'teamId'>) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string) => void;
  
  toggleFavoriteTool: (toolId: string) => void;
  
  getFilteredTools: () => Tool[];
  getFavoritePrompts: () => Prompt[];
  getTasksByStatus: (status?: Task['status']) => Task[];
}

export const useStore = create<AppState>((set, get) => ({
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
  
  getFilteredTools: () => {
    const { tools, selectedCategory, selectedPosition, searchQuery, recommendations } = get();
    
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      const matchesPosition = selectedPosition === 'all' 
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
}));
