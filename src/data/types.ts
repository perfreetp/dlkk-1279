export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  provider: string;
  quotaLimit: number;
  quotaUsed: number;
  expiresAt: string;
  usageCount: number;
  rating: number;
}

export interface Task {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  score?: number;
  comment?: string;
  createdAt: string;
  completedAt?: string;
  flowSteps?: FlowStepRecord[];
}

export interface FlowStepRecord {
  toolId: string;
  toolName: string;
  input: string;
  output: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface CaseCollection {
  id: string;
  name: string;
  category: string;
  position?: string;
  description: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  teamId: string;
}

export interface Recommendation {
  id: string;
  teamId: string;
  toolId: string;
  toolName: string;
  position: string;
  usageGuide?: string;
  reason?: string;
}

export interface PositionConfig {
  position: string;
  usageGuide: string;
}

export interface Application {
  id: string;
  teamId: string;
  toolName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export type Category = '写作' | '配图' | '翻译' | '资料整理' | '其他';

export type Position = '文案' | '设计' | '翻译' | '运营';

export type CaseCategory = '写作' | '配图' | '翻译' | '整理' | '其他';
