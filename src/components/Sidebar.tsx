import { LayoutGrid, Briefcase, BookOpen, ClipboardList, Users, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'marketplace', label: '工具广场', icon: LayoutGrid, path: '/' },
  { id: 'workspace', label: '工作台', icon: Briefcase, path: '/workspace' },
  { id: 'prompts', label: '提示词库', icon: BookOpen, path: '/prompts' },
  { id: 'tasks', label: '任务记录', icon: ClipboardList, path: '/tasks' },
  { id: 'team', label: '团队空间', icon: Users, path: '/team' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-800 text-white flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-700 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI 工具箱</h1>
            <p className="text-xs text-gray-400">内容团队助手</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-700 text-white shadow-lg shadow-accent-700/20'
                      : 'text-gray-300 hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">内容创作团队</p>
            <p className="text-xs text-gray-400">3 名成员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
