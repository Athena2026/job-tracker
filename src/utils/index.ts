import { differenceInDays, format, isToday, isBefore, addDays, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Application, ApplicationStatus } from '../types';

// 获取截止日期距今天数的信息
export function getDeadlineInfo(deadline?: string): {
  text: string;
  daysLeft: number | null;
  urgency: 'overdue' | 'urgent' | 'warning' | 'normal' | 'none';
  color: string;
} {
  if (!deadline) {
    return { text: '无截止日期', daysLeft: null, urgency: 'none', color: 'text-text-muted' };
  }

  const deadlineDate = startOfDay(new Date(deadline));
  const today = startOfDay(new Date());
  const daysLeft = differenceInDays(deadlineDate, today);

  if (daysLeft < 0) {
    return { text: `已过期 ${Math.abs(daysLeft)} 天`, daysLeft, urgency: 'overdue', color: 'text-danger' };
  }
  if (daysLeft === 0) {
    return { text: '今天截止！', daysLeft: 0, urgency: 'urgent', color: 'text-danger' };
  }
  if (daysLeft <= 3) {
    return { text: `${daysLeft} 天后截止`, daysLeft, urgency: 'urgent', color: 'text-danger' };
  }
  if (daysLeft <= 7) {
    return { text: `${daysLeft} 天后截止`, daysLeft, urgency: 'warning', color: 'text-warning' };
  }
  return { text: `${daysLeft} 天后截止`, daysLeft, urgency: 'normal', color: 'text-text-secondary' };
}

// 格式化日期
export function formatDate(dateStr: string, formatStr: string = 'yyyy-MM-dd'): string {
  return format(new Date(dateStr), formatStr, { locale: zhCN });
}

// 格式化日期时间
export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

// 计算面试邀请率
export function calculateInterviewRate(applications: Application[]): number {
  const applied = applications.filter(
    (app) => app.status !== 'wishlist'
  ).length;
  if (applied === 0) return 0;

  const interviewed = applications.filter(
    (app) => ['interviewing', 'pending_offer', 'offer'].includes(app.status) || app.interviews.length > 0
  ).length;

  return Math.round((interviewed / applied) * 100);
}

// 获取本周截止数量
export function getWeekDeadlineCount(applications: Application[]): number {
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);

  return applications.filter((app) => {
    if (!app.deadline) return false;
    const deadline = startOfDay(new Date(app.deadline));
    return !isBefore(deadline, today) && isBefore(deadline, weekEnd);
  }).length;
}

// 获取统计数据
export function getStats(applications: Application[]) {
  const total = applications.length;
  const active = applications.filter(
    (app) => !['rejected', 'offer'].includes(app.status)
  ).length;
  const offers = applications.filter((app) => app.status === 'offer').length;
  const weekDeadlines = getWeekDeadlineCount(applications);
  const interviewRate = calculateInterviewRate(applications);

  return { total, active, offers, weekDeadlines, interviewRate };
}

// 获取状态标签
export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    wishlist: '意向收藏',
    applied: '已投递',
    assessment: '笔试/测评',
    interviewing: '面试中',
    pending_offer: '待结果',
    offer: '已拿 Offer',
    rejected: '已拒绝/已放弃',
  };
  return labels[status];
}

// 获取状态颜色
export function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    wishlist: '#94A3B8',
    applied: '#6C63FF',
    assessment: '#F59E0B',
    interviewing: '#3B82F6',
    pending_offer: '#F97316',
    offer: '#22C55E',
    rejected: '#EF4444',
  };
  return colors[status];
}

// 获取材料完成进度
export function getMaterialProgress(materials: { status: string }[]): number {
  if (materials.length === 0) return 0;
  const completed = materials.filter((m) => m.status === 'submitted').length;
  return Math.round((completed / materials.length) * 100);
}

// 获取所有使用的标签
export function getAllTags(applications: Application[]): string[] {
  const tagSet = new Set<string>();
  applications.forEach((app) => {
    app.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet);
}

// 获取所有城市
export function getAllCities(applications: Application[]): string[] {
  const citySet = new Set<string>();
  applications.forEach((app) => {
    if (app.location) citySet.add(app.location);
  });
  return Array.from(citySet);
}

// 检查是否是今天
export function checkIsToday(dateStr: string): boolean {
  return isToday(new Date(dateStr));
}

// 标签颜色，支持动态生成
const PRESET_TAG_COLORS: Record<string, string> = {
  '互联网': '#6C63FF',
  '金融': '#F59E0B',
  '咨询': '#22C55E',
  '技术': '#3B82F6',
  '产品': '#EC4899',
  '暑期实习': '#14B8A6',
  '秋招': '#F97316',
  '急': '#EF4444',
  '外企': '#8B5CF6',
  '国企': '#06B6D4',
};

export function getTagColor(tag: string): string {
  if (PRESET_TAG_COLORS[tag]) return PRESET_TAG_COLORS[tag];
  // 基于字符串哈希生成颜色
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}
