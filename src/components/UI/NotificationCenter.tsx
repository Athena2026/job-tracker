import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getDeadlineInfo } from '../../utils';

export default function NotificationCenter() {
  const showNotifications = useAppStore((s) => s.showNotifications);
  const setShowNotifications = useAppStore((s) => s.setShowNotifications);
  const notifications = useAppStore((s) => s.notifications);
  const applications = useAppStore((s) => s.applications);
  const addNotification = useAppStore((s) => s.addNotification);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 检查截止日期并生成通知
  useEffect(() => {
    const checkDeadlines = () => {
      applications.forEach((app) => {
        if (!app.deadline || app.status === 'rejected' || app.status === 'offer') return;

        const info = getDeadlineInfo(app.deadline);
        if (info.daysLeft === null) return;

        // 3天内截止
        if (info.daysLeft <= 3 && info.daysLeft >= 0) {
          const existing = notifications.find(
            (n) =>
              n.applicationId === app.id &&
              n.type === 'deadline_urgent' &&
              // 同一天内不重复提醒
              new Date(n.createdAt).toDateString() === new Date().toDateString()
          );
          if (!existing) {
            addNotification({
              title: `⚠️ 截止日期临近`,
              message: `${app.company} - ${app.position} 将在 ${info.daysLeft === 0 ? '今天' : `${info.daysLeft} 天后`}截止`,
              applicationId: app.id,
              read: false,
              type: 'deadline_urgent',
            });

            // 尝试发送浏览器通知
            if (Notification.permission === 'granted') {
              new Notification(`截止日期临近：${app.company}`, {
                body: `${app.position} 将在 ${info.daysLeft === 0 ? '今天' : `${info.daysLeft} 天后`}截止`,
                icon: '⚠️',
              });
            }
          }
        }
      });
    };

    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // 每小时检查
    return () => clearInterval(interval);
  }, [applications, notifications, addNotification]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, setShowNotifications]);

  return (
    <div className="relative" ref={panelRef}>
      {/* 铃铛按钮 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* 未读角标 */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-bg-panel border border-border rounded-xl shadow-2xl shadow-black/30 z-50 animate-scale-up overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-heading font-semibold text-sm text-text-primary">通知中心</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-accent hover:underline"
              >
                全部已读
              </button>
            )}
          </div>

          {/* 通知列表 */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-muted text-sm">暂无通知</p>
                <p className="text-text-muted text-xs mt-1">截止日期提醒会出现在这里</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    setSelectedApplicationId(notification.applicationId);
                    setShowNotifications(false);
                  }}
                  className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-bg-hover transition-colors ${
                    !notification.read ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-accent rounded-full mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary font-medium">{notification.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
