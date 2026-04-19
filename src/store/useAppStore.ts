import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, ApplicationStatus, Notification } from '../types';
import { mockApplications } from '../data/mockApplications';
import { v4 as uuidv4 } from 'uuid';

// 全局状态接口
interface AppState {
  // 申请数据
  applications: Application[];
  // 通知列表
  notifications: Notification[];
  // 搜索关键词
  searchQuery: string;
  // 过滤标签
  filterTags: string[];
  // 过滤城市
  filterCity: string;
  // 排序方式
  sortBy: 'deadline' | 'createdAt' | 'company';
  // 当前视图
  currentView: 'board' | 'calendar';
  // 选中的申请ID（用于抽屉展示）
  selectedApplicationId: string | null;
  // 是否显示添加/编辑模态框
  showModal: boolean;
  // 编辑中的申请ID
  editingApplicationId: string | null;
  // 通知面板是否打开
  showNotifications: boolean;

  // 操作方法
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  moveApplication: (id: string, newStatus: ApplicationStatus) => void;
  reorderApplications: (sourceStatus: ApplicationStatus, sourceIndex: number, destStatus: ApplicationStatus, destIndex: number, appId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterCity: (city: string) => void;
  setSortBy: (sort: 'deadline' | 'createdAt' | 'company') => void;
  setCurrentView: (view: 'board' | 'calendar') => void;
  setSelectedApplicationId: (id: string | null) => void;
  setShowModal: (show: boolean) => void;
  setEditingApplicationId: (id: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setShowNotifications: (show: boolean) => void;
  getFilteredApplications: () => Application[];
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,
      notifications: [],
      searchQuery: '',
      filterTags: [],
      filterCity: '',
      sortBy: 'deadline',
      currentView: 'board',
      selectedApplicationId: null,
      showModal: false,
      editingApplicationId: null,
      showNotifications: false,

      // 添加新申请
      addApplication: (app) => {
        const now = new Date().toISOString();
        const newApp: Application = {
          ...app,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          applications: [...state.applications, newApp],
        }));
      },

      // 更新申请
      updateApplication: (id, updates) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? { ...app, ...updates, updatedAt: new Date().toISOString() }
              : app
          ),
        }));
      },

      // 删除申请
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
          selectedApplicationId:
            state.selectedApplicationId === id ? null : state.selectedApplicationId,
        }));
      },

      // 移动申请到新阶段
      moveApplication: (id, newStatus) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
              : app
          ),
        }));
      },

      // 拖拽重排序
      reorderApplications: (sourceStatus, sourceIndex, destStatus, destIndex, appId) => {
        set((state) => {
          const apps = [...state.applications];
          const appIndex = apps.findIndex((a) => a.id === appId);
          if (appIndex === -1) return state;

          const [movedApp] = apps.splice(appIndex, 1);
          movedApp.status = destStatus;
          movedApp.updatedAt = new Date().toISOString();

          // 获取目标列的卡片，找到插入位置
          const destApps = apps.filter((a) => a.status === destStatus);
          if (destIndex >= destApps.length) {
            apps.push(movedApp);
          } else {
            const insertBeforeApp = destApps[destIndex];
            const insertIndex = apps.findIndex((a) => a.id === insertBeforeApp.id);
            apps.splice(insertIndex, 0, movedApp);
          }

          return { applications: apps };
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterTags: (tags) => set({ filterTags: tags }),
      setFilterCity: (city) => set({ filterCity: city }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),
      setShowModal: (show) => set({ showModal: show }),
      setEditingApplicationId: (id) => set({ editingApplicationId: id }),
      setShowNotifications: (show) => set({ showNotifications: show }),

      // 添加通知
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      // 标记通知已读
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      // 全部标记已读
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      // 获取过滤后的申请
      getFilteredApplications: () => {
        const { applications, searchQuery, filterTags, filterCity, sortBy } = get();
        let filtered = [...applications];

        // 搜索过滤
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (app) =>
              app.company.toLowerCase().includes(q) ||
              app.position.toLowerCase().includes(q)
          );
        }

        // 标签过滤
        if (filterTags.length > 0) {
          filtered = filtered.filter((app) =>
            filterTags.some((tag) => app.tags.includes(tag))
          );
        }

        // 城市过滤
        if (filterCity) {
          filtered = filtered.filter((app) => app.location === filterCity);
        }

        // 排序
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'deadline':
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            case 'createdAt':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'company':
              return a.company.localeCompare(b.company);
            default:
              return 0;
          }
        });

        return filtered;
      },

      // 按状态获取申请
      getApplicationsByStatus: (status) => {
        const filtered = get().getFilteredApplications();
        return filtered.filter((app) => app.status === status);
      },
    }),
    {
      name: 'job-tracker-storage', // localStorage 键名
      // 不持久化临时 UI 状态
      partialize: (state) => ({
        applications: state.applications,
        notifications: state.notifications,
      }),
    }
  )
);
