import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  differenceInDays,
  startOfDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getTagColor } from '../../utils';
import { useFilteredApplications } from '../../hooks/useFilteredApplications';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const applications = useFilteredApplications();
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);

  // 获取日历网格的起止日期
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // 生成日历天数
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // 获取某天有截止日期的申请
  const getAppsForDate = (date: Date) => {
    return applications.filter((app) => {
      if (!app.deadline) return false;
      return isSameDay(new Date(app.deadline), date);
    });
  };

  // 获取日期的紧急程度样式
  const getDateUrgency = (date: Date) => {
    const today = startOfDay(new Date());
    const diff = differenceInDays(date, today);
    if (diff < 0) return 'border-danger/30 bg-danger/5';
    if (diff <= 3) return 'border-danger/40 bg-danger/5';
    if (diff <= 7) return 'border-warning/40 bg-warning/5';
    return '';
  };

  // 月份导航
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };
  const goToday = () => setCurrentMonth(new Date());

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="bg-bg-panel border border-border rounded-xl overflow-hidden">
      {/* 月份导航 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-bold text-xl text-text-primary">
            {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
          </h2>
          <button
            onClick={goToday}
            className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
          >
            今天
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs font-medium text-text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7">
        {days.map((date, idx) => {
          const dateApps = getAppsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const today = isToday(date);
          const urgency = dateApps.length > 0 ? getDateUrgency(date) : '';

          return (
            <div
              key={idx}
              className={`min-h-[100px] md:min-h-[120px] border-b border-r border-border p-2 transition-colors
                ${!isCurrentMonth ? 'bg-bg-primary/30' : 'bg-bg-panel'}
                ${urgency}
                ${today ? 'ring-2 ring-accent/30 ring-inset' : ''}
              `}
            >
              {/* 日期数字 */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${today ? 'bg-accent text-white' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'}
                  `}
                >
                  {format(date, 'd')}
                </span>
                {dateApps.length > 0 && (
                  <span className="text-[10px] text-text-muted">{dateApps.length} 项</span>
                )}
              </div>

              {/* 当日截止的申请 */}
              <div className="space-y-1">
                {dateApps.slice(0, 3).map((app) => {
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplicationId(app.id)}
                      className="px-2 py-1 rounded text-[11px] cursor-pointer truncate transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: `${getTagColor(app.tags[0] || '互联网')}15`,
                        color: getTagColor(app.tags[0] || '互联网'),
                        borderLeft: `2px solid ${getTagColor(app.tags[0] || '互联网')}`,
                      }}
                      title={`${app.company} - ${app.position}`}
                    >
                      {app.company}
                    </div>
                  );
                })}
                {dateApps.length > 3 && (
                  <div className="text-[10px] text-text-muted text-center">
                    +{dateApps.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
