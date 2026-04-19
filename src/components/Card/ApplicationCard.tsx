import { Application, KANBAN_COLUMNS } from '../../types';
import { getDeadlineInfo, getTagColor } from '../../utils';
import { useAppStore } from '../../store/useAppStore';

interface ApplicationCardProps {
  application: Application;
  isDragging?: boolean;
}

// 获取紧急程度左侧色带颜色
function getUrgencyBorderColor(urgency: string): string {
  switch (urgency) {
    case 'overdue': return '#EF4444';
    case 'urgent': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return 'transparent';
  }
}

export default function ApplicationCard({ application, isDragging }: ApplicationCardProps) {
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);
  const deadlineInfo = getDeadlineInfo(application.deadline);

  const urgencyBorder = getUrgencyBorderColor(deadlineInfo.urgency);
  const isUrgent = deadlineInfo.urgency === 'urgent' || deadlineInfo.urgency === 'overdue';

  return (
    <div
      className={`bg-bg-panel border border-border rounded-lg cursor-pointer
        transition-all duration-200 group overflow-hidden
        ${isDragging ? 'shadow-2xl shadow-accent/20 scale-105 rotate-1 border-accent/50' : 'hover:border-accent/30 hover:shadow-lg hover:shadow-black/20'}
      `}
      onClick={() => setSelectedApplicationId(application.id)}
    >
      {/* 左侧紧急色带 + 内容区 */}
      <div className="flex">
        {/* 紧急度色带 - 只在紧急/过期时显示 */}
        {urgencyBorder !== 'transparent' && (
          <div
            className="w-1 shrink-0 rounded-l-lg"
            style={{ backgroundColor: urgencyBorder }}
          />
        )}

        <div className="flex-1 p-4 min-w-0">
          {/* 第一行：公司名 + 进度圆点 */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-heading font-semibold text-text-primary text-sm leading-tight">
              {application.company}
            </h3>
            <div className="flex gap-1 shrink-0 ml-2">
              {KANBAN_COLUMNS.slice(0, -1).map((col) => (
                <div
                  key={col.id}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    KANBAN_COLUMNS.findIndex((c) => c.id === application.status) >=
                    KANBAN_COLUMNS.findIndex((c) => c.id === col.id)
                      ? 'bg-accent'
                      : 'bg-border'
                  }`}
                  title={col.title}
                />
              ))}
            </div>
          </div>

          {/* 第二行：岗位名称 */}
          <p className="text-text-secondary text-xs mb-2.5 leading-relaxed line-clamp-1">
            {application.position}
          </p>

          {/* 🔴 核心改动：截止日期提升为最突出信息 */}
          {application.deadline && (
            <div className={`flex items-center gap-2 mb-2.5 ${isUrgent ? 'bg-danger/8 -mx-1 px-1 py-1 rounded' : ''}`}>
              <svg className={`w-4 h-4 shrink-0 ${deadlineInfo.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-semibold ${deadlineInfo.color}`}>
                {deadlineInfo.text}
              </span>
            </div>
          )}

          {/* 标签 - 保持紧凑 */}
          {application.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {application.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${getTagColor(tag)}20`,
                    color: getTagColor(tag),
                  }}
                >
                  {tag}
                </span>
              ))}
              {application.tags.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-border text-text-muted">
                  +{application.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 底部辅助信息：地点 · 平台 · 面试轮数 - 一行显示，降低权重 */}
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted/70 mt-1">
            <span>{application.location}</span>
            {application.platform && (
              <>
                <span className="text-border">·</span>
                <span>{application.platform}</span>
              </>
            )}
            {application.interviews.length > 0 && (
              <>
                <span className="text-border">·</span>
                <span>{application.interviews.length} 轮面试</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
