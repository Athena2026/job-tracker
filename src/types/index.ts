// 申请状态类型
export type ApplicationStatus =
  | 'wishlist'      // 意向收藏
  | 'applied'       // 已投递
  | 'assessment'    // 笔试/测评
  | 'interviewing'  // 面试中
  | 'pending_offer' // 待结果
  | 'offer'         // 已拿Offer
  | 'rejected';     // 已拒绝/已放弃

// 面试轮次
export interface InterviewRound {
  id: string;
  round: string;           // 例如 "HR面", "一面"
  date: string;            // ISO 日期字符串
  format: 'online' | 'offline' | 'phone';
  interviewer?: string;    // 面试官（选填）
  notes: string;           // Markdown 笔记
  result: 'passed' | 'failed' | 'pending';
}

// 材料项
export interface MaterialItem {
  id: string;
  label: string;
  status: 'not_started' | 'in_progress' | 'submitted';
}

// 申请数据模型
export interface Application {
  id: string;
  company: string;
  position: string;
  location: string;
  salary?: string;
  platform: string;
  jdUrl?: string;
  deadline?: string;       // ISO 日期字符串
  status: ApplicationStatus;
  tags: string[];
  materials: MaterialItem[];
  interviews: InterviewRound[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 看板列定义
export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  emoji: string;
}

// 通知
export interface Notification {
  id: string;
  title: string;
  message: string;
  applicationId: string;
  read: boolean;
  createdAt: string;
  type: 'deadline_warning' | 'deadline_urgent' | 'interview_reminder';
}

// 标签颜色映射
export const TAG_COLORS: Record<string, string> = {
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

// 看板列配置
export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'wishlist', title: '意向收藏', emoji: '🔖' },
  { id: 'applied', title: '已投递', emoji: '📤' },
  { id: 'assessment', title: '笔试/测评', emoji: '📝' },
  { id: 'interviewing', title: '面试中', emoji: '🎯' },
  { id: 'pending_offer', title: '待结果', emoji: '⏳' },
  { id: 'offer', title: '已拿 Offer', emoji: '✅' },
  { id: 'rejected', title: '已拒绝/已放弃', emoji: '❌' },
];

// 投递平台选项
export const PLATFORM_OPTIONS = [
  'Boss直聘',
  '实习僧',
  '官网',
  '领英',
  '牛客',
  '猎聘',
  '其他',
];

// 面试形式选项
export const INTERVIEW_FORMAT_OPTIONS: { value: InterviewRound['format']; label: string }[] = [
  { value: 'online', label: '线上' },
  { value: 'offline', label: '线下' },
  { value: 'phone', label: '电话' },
];

// 材料默认选项
export const DEFAULT_MATERIALS: string[] = [
  '简历',
  '求职信',
  '成绩单',
  '作品集',
  '推荐信',
];
