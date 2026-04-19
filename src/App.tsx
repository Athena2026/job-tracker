import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import DashboardHeader from './components/Dashboard/DashboardHeader';
import StatsCharts from './components/Dashboard/StatsCharts';
import KanbanBoard from './components/Board/KanbanBoard';
import CalendarView from './components/Calendar/CalendarView';
import DetailDrawer from './components/Drawer/DetailDrawer';
import ApplicationModal from './components/Modals/ApplicationModal';
import Toolbar from './components/UI/Toolbar';
import NotificationCenter from './components/UI/NotificationCenter';

function App() {
  const selectedApplicationId = useAppStore((s) => s.selectedApplicationId);
  const showModal = useAppStore((s) => s.showModal);
  const [workspaceView, setWorkspaceView] = useState<'board' | 'calendar' | 'overview'>('board');

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 bg-bg-panel/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-bold text-text-primary text-lg leading-tight">
                JobTracker
              </h1>
              <p className="text-text-muted text-[11px]">求职申请管理看板</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        {/* 顶部概览区（紧凑） */}
        <DashboardHeader />

        {/* 主视图切换 */}
        <div className="flex items-center gap-2.5 mt-2 mb-3 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setWorkspaceView('board')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              workspaceView === 'board'
                ? 'bg-accent/15 text-accent border border-accent/35'
                : 'text-text-primary/80 hover:text-text-primary hover:bg-bg-hover border border-transparent'
            }`}
          >
            看板
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              workspaceView === 'calendar'
                ? 'bg-accent/15 text-accent border border-accent/35'
                : 'text-text-primary/80 hover:text-text-primary hover:bg-bg-hover border border-transparent'
            }`}
          >
            日历
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceView('overview')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              workspaceView === 'overview'
                ? 'bg-accent/15 text-accent border border-accent/35'
                : 'text-text-primary/80 hover:text-text-primary hover:bg-bg-hover border border-transparent'
            }`}
          >
            本周概览
          </button>
        </div>

        {/* 工具栏（按视图语义显示） */}
        {workspaceView === 'board' && <Toolbar mode="board" />}
        {workspaceView === 'calendar' && <Toolbar mode="calendar" />}

        {/* 互斥内容区：执行优先，分析按需 */}
        {workspaceView === 'board' && <KanbanBoard />}
        {workspaceView === 'calendar' && <CalendarView />}
        {workspaceView === 'overview' && <StatsCharts />}
      </main>

      {/* 详情抽屉 */}
      {selectedApplicationId && <DetailDrawer />}

      {/* 添加/编辑模态框 */}
      {showModal && <ApplicationModal />}
    </div>
  );
}

export default App;
