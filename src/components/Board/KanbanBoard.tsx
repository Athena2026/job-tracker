import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAppStore } from '../../store/useAppStore';
import { KANBAN_COLUMNS, ApplicationStatus } from '../../types';
import ApplicationCard from '../Card/ApplicationCard';
import { getStatusColor } from '../../utils';
import { useApplicationsByStatus } from '../../hooks/useFilteredApplications';
import { useState } from 'react';

// 单个列组件 - 桌面端看板
function KanbanColumn({ columnId, title, emoji }: { columnId: ApplicationStatus; title: string; emoji: string }) {
  const apps = useApplicationsByStatus(columnId);
  const statusColor = getStatusColor(columnId);

  return (
    <div className="flex-shrink-0 w-[280px] md:w-[300px]">
      {/* 列标题 */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg">{emoji}</span>
        <h2 className="font-heading font-semibold text-text-primary text-sm">
          {title}
        </h2>
        <span
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          {apps.length}
        </span>
      </div>

      {/* 可拖放区域 */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-2 transition-colors duration-200 space-y-2
              ${snapshot.isDraggingOver
                ? 'bg-accent/5 border-2 border-dashed border-accent/30'
                : 'bg-bg-primary/50 border-2 border-transparent'
              }`}
          >
            {apps.map((app, index) => (
              <Draggable key={app.id} draggableId={app.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ApplicationCard
                      application={app}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* 空状态提示 */}
            {apps.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xs">拖拽卡片到此处</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// 移动端单列列表视图
function MobileListView() {
  const [expandedStatus, setExpandedStatus] = useState<ApplicationStatus | null>('interviewing');

  return (
    <div className="space-y-3">
      {KANBAN_COLUMNS.map((column) => {
        const isExpanded = expandedStatus === column.id;
        return (
          <MobileStatusSection
            key={column.id}
            columnId={column.id}
            title={column.title}
            emoji={column.emoji}
            isExpanded={isExpanded}
            onToggle={() => setExpandedStatus(isExpanded ? null : column.id)}
          />
        );
      })}
    </div>
  );
}

// 移动端：按状态折叠的一组卡片
function MobileStatusSection({
  columnId,
  title,
  emoji,
  isExpanded,
  onToggle,
}: {
  columnId: ApplicationStatus;
  title: string;
  emoji: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const apps = useApplicationsByStatus(columnId);
  const statusColor = getStatusColor(columnId);

  return (
    <div className="bg-bg-panel border border-border rounded-xl overflow-hidden">
      {/* 状态标题栏 - 点击展开/折叠 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-bg-hover transition-colors"
      >
        <span className="text-base">{emoji}</span>
        <span className="font-heading font-semibold text-text-primary text-sm">{title}</span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {apps.length}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 卡片列表 */}
      {isExpanded && apps.length > 0 && (
        <div className="px-3 pb-3 space-y-2">
          {apps.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      {/* 展开但为空 */}
      {isExpanded && apps.length === 0 && (
        <div className="px-4 pb-4 text-text-muted text-xs text-center py-4">
          暂无申请
        </div>
      )}
    </div>
  );
}

// 主看板组件 - 自动切换桌面/移动端布局
export default function KanbanBoard() {
  const reorderApplications = useAppStore((s) => s.reorderApplications);

  // 拖拽结束处理
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    reorderApplications(
      source.droppableId as ApplicationStatus,
      source.index,
      destination.droppableId as ApplicationStatus,
      destination.index,
      draggableId
    );
  };

  return (
    <>
      {/* 桌面端：横向看板 + 拖拽 */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                emoji={column.emoji}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* 移动端：单列折叠列表 */}
      <div className="md:hidden">
        <MobileListView />
      </div>
    </>
  );
}
