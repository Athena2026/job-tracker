import { useEffect, useMemo, useState } from 'react';
import { Application } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { getDeadlineInfo, getMaterialProgress, getStatusLabel } from '../../utils';
import { addDays, format, startOfDay, differenceInDays, isSameDay } from 'date-fns';

type HeatmapDay = {
  date: Date;
  label: string;
  weekday: string;
  apps: Application[];
  isToday: boolean;
};

// 未来14天截止日期热力图
function DeadlineHeatmap() {
  const applications = useAppStore((s) => s.applications);
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const days: HeatmapDay[] = [];

    for (let i = 0; i < 14; i++) {
      const day = addDays(today, i);
      const appsOnDay = applications.filter((a) => {
        if (!a.deadline) return false;
        return isSameDay(new Date(a.deadline), day);
      });
      days.push({
        date: day,
        label: format(day, 'M/d'),
        weekday: ['日', '一', '二', '三', '四', '五', '六'][day.getDay()],
        apps: appsOnDay,
        isToday: i === 0,
      });
    }
    return days;
  }, [applications]);

  // 已过期的申请
  const overdueApps = useMemo(() => {
    const today = startOfDay(new Date());
    return applications.filter((a) => {
      if (!a.deadline) return false;
      if (a.status === 'offer' || a.status === 'rejected') return false;
      return differenceInDays(new Date(a.deadline), today) < 0;
    });
  }, [applications]);

  // 热力色（0=无, 1=正常, 2=多, 3+=压力大）
  function getHeatColor(count: number): string {
    if (count === 0) return 'bg-bg-primary/60';
    if (count === 1) return 'bg-accent/20 border-accent/30';
    if (count === 2) return 'bg-warning/20 border-warning/30';
    return 'bg-danger/20 border-danger/30';
  }

  function getHeatTextColor(count: number): string {
    if (count === 0) return 'text-text-muted/40';
    if (count === 1) return 'text-accent';
    if (count === 2) return 'text-warning';
    return 'text-danger';
  }

  const openDayDrawer = (day: HeatmapDay) => {
    setSelectedDate(day.date);
    setIsDrawerOpen(true);
  };

  const closeDayDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    closeDayDrawer();
  };

  const selectedDay = useMemo(
    () => (selectedDate ? heatmapData.find((day) => isSameDay(day.date, selectedDate)) ?? null : null),
    [heatmapData, selectedDate]
  );

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDayDrawer();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isDrawerOpen]);

  return (
    <>
      <div className="bg-bg-panel border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-text-primary text-xs md:text-sm">
            未来两周截止日期
          </h3>
          {overdueApps.length > 0 && (
            <span className="text-xs text-danger font-medium px-2 py-0.5 rounded-full bg-danger/10">
              {overdueApps.length} 个已过期
            </span>
          )}
        </div>

        {/* 热力图网格 */}
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((day, i) => (
            <div key={day.date.toISOString()} className="flex flex-col items-center">
              {/* 星期标签 - 只在第一行显示 */}
              {i < 7 && (
                <span className="text-[10px] text-text-muted/60 mb-0.5">{day.weekday}</span>
              )}
              {/* 日期格子 */}
              <button
                type="button"
                onClick={() => openDayDrawer(day)}
                className={`w-full aspect-square rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-1 focus:ring-offset-bg-panel
                  ${getHeatColor(day.apps.length)}
                  ${day.isToday ? 'ring-2 ring-accent/40 ring-offset-1 ring-offset-bg-panel' : ''}
                `}
                title={day.apps.map((a) => a.company).join('、') || '无截止'}
                aria-label={`${day.label}，${day.apps.length}项`}
              >
                <span className={`text-xs font-medium ${day.apps.length > 0 ? 'text-text-primary' : 'text-text-muted/50'}`}>
                  {day.label}
                </span>
                {day.apps.length > 0 && (
                  <span className={`text-[10px] font-bold mt-0.5 ${getHeatTextColor(day.apps.length)}`}>
                    {day.apps.length}项
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 过期列表 */}
        {overdueApps.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {overdueApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApplicationId(app.id)}
                  className="text-[10px] text-danger bg-danger/8 px-2 py-1 rounded-md hover:bg-danger/15 transition-colors"
                >
                  {app.company} · 已过期 {Math.abs(differenceInDays(new Date(app.deadline!), new Date()))} 天
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={closeDayDrawer}
            aria-hidden="true"
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-bg-panel border-l border-border z-50 animate-slide-in overflow-y-auto">
            <div className="sticky top-0 bg-bg-panel/95 backdrop-blur-md border-b border-border p-5 z-10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted mb-1">截止日期明细</p>
                  <h4 className="font-heading font-semibold text-text-primary text-lg">
                    {selectedDay ? `${format(selectedDay.date, 'M/d')}（周${selectedDay.weekday}）` : '已选日期'}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    {selectedDay && selectedDay.apps.length > 0 ? `共 ${selectedDay.apps.length} 项` : '当天无截止项'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDayDrawer}
                  className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="关闭"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {!selectedDay || selectedDay.apps.length === 0 ? (
                <div className="text-sm text-text-muted bg-bg-primary/60 border border-border rounded-lg p-4">
                  这一天没有截止申请，可以继续完善材料或安排投递。
                </div>
              ) : (
                selectedDay.apps.map((app) => {
                  const deadlineInfo = getDeadlineInfo(app.deadline);
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleOpenApplication(app.id)}
                      className="w-full text-left bg-bg-primary/60 border border-border rounded-lg p-4 hover:bg-bg-hover hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{app.company}</p>
                          <p className="text-xs text-text-secondary mt-1 truncate">{app.position}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent whitespace-nowrap">
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-text-muted">
                        <span>{app.location}</span>
                        <span className="text-border">·</span>
                        <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// 材料准备度汇总
function MaterialSummary() {
  const applications = useAppStore((s) => s.applications);
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);

  // 只展示进行中的申请（排除 offer 和 rejected）
  const activeApps = useMemo(() => {
    return applications
      .filter((a) => !['offer', 'rejected', 'wishlist'].includes(a.status))
      .filter((a) => a.materials.length > 0)
      .map((a) => ({
        ...a,
        progress: getMaterialProgress(a.materials),
        totalMaterials: a.materials.length,
        doneMaterials: a.materials.filter((m) => m.status === 'submitted').length,
        pendingMaterials: a.materials.filter((m) => m.status !== 'submitted').map((m) => m.label),
        pendingCount: a.materials.filter((m) => m.status !== 'submitted').length,
        pendingPreview: a.materials
          .filter((m) => m.status !== 'submitted')
          .slice(0, 2)
          .map((m) => m.label),
      }))
      .sort((a, b) => a.progress - b.progress); // 完成度低的排前面
  }, [applications]);

  const allComplete = activeApps.every((a) => a.progress === 100);

  return (
    <div className="bg-bg-panel border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-text-primary text-xs md:text-sm">
          材料准备进度
        </h3>
        {allComplete ? (
          <span className="text-xs text-success font-medium px-2 py-0.5 rounded-full bg-success/10">
            全部就绪 ✓
          </span>
        ) : (
          <span className="text-xs text-text-muted">
            {activeApps.filter((a) => a.progress < 100).length} 个待完善
          </span>
        )}
      </div>

      <div className="space-y-2">
        {activeApps.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">暂无需要准备材料的申请</p>
        )}
        {activeApps.map((app) => (
          <button
            key={app.id}
            onClick={() => setSelectedApplicationId(app.id)}
            className="w-full text-left bg-bg-primary/50 rounded-lg px-3.5 py-2.5 hover:bg-bg-hover transition-colors group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-text-primary group-hover:text-accent transition-colors">
                {app.company}
              </span>
              <span className={`text-[10px] font-medium ${
                app.progress === 100 ? 'text-success' : app.progress >= 50 ? 'text-warning' : 'text-danger'
              }`}>
                {app.doneMaterials}/{app.totalMaterials}
              </span>
            </div>
            {/* 进度条 */}
            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  app.progress === 100 ? 'bg-success' : app.progress >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${app.progress}%` }}
              />
            </div>
            {/* 未完成材料列表 */}
            {app.pendingCount > 0 && (
              <p className="text-[11px] font-medium text-warning bg-warning/10 border border-warning/20 rounded-md px-2 py-1 mt-1.5 truncate">
                待准备（{app.pendingCount}）: {app.pendingPreview.join('、')}
                {app.pendingCount > app.pendingPreview.length ? ` 等${app.pendingCount}项` : ''}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StatsCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <DeadlineHeatmap />
      <MaterialSummary />
    </div>
  );
}
