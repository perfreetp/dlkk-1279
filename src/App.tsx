import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ToolMarketplace from "./pages/ToolMarketplace";
import Workspace from "./pages/Workspace";
import PromptLibrary from "./pages/PromptLibrary";
import TaskHistory from "./pages/TaskHistory";
import TeamSpace from "./pages/TeamSpace";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64">
          <Routes>
            <Route path="/" element={<ToolMarketplace />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/prompts" element={<PromptLibrary />} />
            <Route path="/tasks" element={<TaskHistory />} />
            <Route path="/team" element={<TeamSpace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
