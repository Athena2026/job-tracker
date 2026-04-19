import { useEffect, useRef, useState, ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStats } from '../../utils';

// 数字滚动动画 Hook
function useCountUp(target: number, duration: number = 1000) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + (target - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

// 统一的 SVG 图标组件
function StatIcon({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}12` }}
    >
      <svg
        className="w-4.5 h-4.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={1.8}
      >
        {children}
      </svg>
    </div>
  );
}

// 单个统计卡片
function StatCard({
  label,
  value,
  suffix = '',
  iconContent,
  color,
}: {
  label: string;
  value: number;
  suffix?: string;
  iconContent: ReactNode;
  color: string;
}) {
  const displayValue = useCountUp(value);

  return (
    <div className="bg-bg-panel border border-border rounded-xl p-3 md:p-3.5 flex items-center gap-2.5 hover:border-accent/30 transition-all duration-200 group">
      <StatIcon color={color}>{iconContent}</StatIcon>
      <div className="min-w-0">
        <p className="text-text-secondary text-[11px] font-body">{label}</p>
        <p className="text-xl md:text-2xl font-heading font-semibold text-text-primary mt-0.5 leading-none">
          {displayValue}
          {suffix && <span className="text-sm text-text-secondary ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

// 仪表盘组件
export default function DashboardHeader() {
  const applications = useAppStore((s) => s.applications);
  const stats = getStats(applications);
  const EXECUTION_COLOR = '#3B82F6';
  const RISK_COLOR = '#F59E0B';
  const RESULT_COLOR = '#22C55E';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3 mb-4">
      {/* 总申请数 - 文档/列表图标 */}
      <StatCard
        label="总申请数"
        value={stats.total}
        iconContent={
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        }
        color={EXECUTION_COLOR}
      />
      {/* 进行中 - 闪电/活跃图标 */}
      <StatCard
        label="进行中"
        value={stats.active}
        iconContent={
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        }
        color={EXECUTION_COLOR}
      />
      {/* 本周截止 - 时钟图标 */}
      <StatCard
        label="本周截止"
        value={stats.weekDeadlines}
        iconContent={
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        }
        color={RISK_COLOR}
      />
      {/* Offer - 奖杯/勋章图标 */}
      <StatCard
        label="Offer"
        value={stats.offers}
        iconContent={
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </>
        }
        color={RESULT_COLOR}
      />
      {/* 面试邀请率 - 趋势图标 */}
      <StatCard
        label="面试邀请率"
        value={stats.interviewRate}
        suffix="%"
        iconContent={
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        }
        color={EXECUTION_COLOR}
      />
    </div>
  );
}
