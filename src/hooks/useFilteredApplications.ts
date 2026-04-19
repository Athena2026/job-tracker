import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Application, ApplicationStatus } from '../types';

// 自定义 Hook：获取过滤后的申请列表
export function useFilteredApplications(): Application[] {
  const applications = useAppStore((s) => s.applications);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const filterTags = useAppStore((s) => s.filterTags);
  const filterCity = useAppStore((s) => s.filterCity);
  const sortBy = useAppStore((s) => s.sortBy);

  return useMemo(() => {
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
  }, [applications, searchQuery, filterTags, filterCity, sortBy]);
}

// 自定义 Hook：按状态获取过滤后的申请
export function useApplicationsByStatus(status: ApplicationStatus): Application[] {
  const filtered = useFilteredApplications();
  return useMemo(() => filtered.filter((app) => app.status === status), [filtered, status]);
}
