import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getAllTags, getAllCities } from '../../utils';

type SortOption = 'deadline' | 'createdAt' | 'company';
type ToolbarMode = 'board' | 'calendar';

export default function Toolbar({ mode = 'board' }: { mode?: ToolbarMode }) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const filterTags = useAppStore((s) => s.filterTags);
  const setFilterTags = useAppStore((s) => s.setFilterTags);
  const filterCity = useAppStore((s) => s.filterCity);
  const setFilterCity = useAppStore((s) => s.setFilterCity);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const setShowModal = useAppStore((s) => s.setShowModal);
  const applications = useAppStore((s) => s.applications);

  const [showFilters, setShowFilters] = useState(false);
  const allTags = getAllTags(applications);
  const allCities = getAllCities(applications);

  const toggleTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  const activeFilterCount = filterTags.length + (filterCity ? 1 : 0);
  const isBoardMode = mode === 'board';
  const hasCalendarFilterSummary = mode === 'calendar' && activeFilterCount > 0;
  const calendarFilterSummary = [
    filterTags.length > 0 ? `${filterTags.length} 个标签` : '',
    filterCity ? `城市：${filterCity}` : '',
  ]
    .filter(Boolean)
    .join('，');

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* 搜索框 */}
        {isBoardMode && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索公司名 / 岗位名..."
              className="w-full bg-bg-panel border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 筛选按钮 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:border-accent/30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          筛选
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-accent text-white rounded-full text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 排序 */}
        {isBoardMode && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-bg-panel border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-accent/50 transition-colors"
          >
            <option value="deadline">按截止日期</option>
            <option value="createdAt">按添加时间</option>
            <option value="company">按公司名</option>
          </select>
        )}

        {/* 添加按钮 */}
        {isBoardMode && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25 ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            添加申请
          </button>
        )}
      </div>

      {hasCalendarFilterSummary && (
        <div className="flex items-center justify-between bg-accent/8 border border-accent/20 rounded-lg px-3 py-2">
          <p className="text-xs text-text-secondary">
            已应用筛选：{calendarFilterSummary}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterTags([]);
              setFilterCity('');
            }}
            className="text-xs text-accent hover:underline"
          >
            一键清除
          </button>
        </div>
      )}

      {/* 筛选展开面板 */}
      {showFilters && (
        <div className="bg-bg-panel border border-border rounded-xl p-4 animate-fade-in space-y-4">
          {/* 标签筛选 */}
          <div>
            <p className="text-xs text-text-muted mb-2 font-medium">按标签筛选</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                    filterTags.includes(tag)
                      ? 'bg-accent text-white'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 城市筛选 */}
          <div>
            <p className="text-xs text-text-muted mb-2 font-medium">按城市筛选</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCity('')}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  !filterCity
                    ? 'bg-accent text-white'
                    : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                全部
              </button>
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setFilterCity(filterCity === city ? '' : city)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                    filterCity === city
                      ? 'bg-accent text-white'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* 清除筛选 */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setFilterTags([]);
                setFilterCity('');
              }}
              className="text-xs text-danger hover:underline"
            >
              清除所有筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
}
