import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MaterialItem, InterviewRound, INTERVIEW_FORMAT_OPTIONS } from '../../types';
import { formatDateTime, getDeadlineInfo, getTagColor, getStatusColor, getStatusLabel } from '../../utils';
import { v4 as uuidv4 } from 'uuid';

export default function DetailDrawer() {
  const selectedId = useAppStore((s) => s.selectedApplicationId);
  const applications = useAppStore((s) => s.applications);
  const updateApplication = useAppStore((s) => s.updateApplication);
  const deleteApplication = useAppStore((s) => s.deleteApplication);
  const setSelectedApplicationId = useAppStore((s) => s.setSelectedApplicationId);
  const setShowModal = useAppStore((s) => s.setShowModal);
  const setEditingApplicationId = useAppStore((s) => s.setEditingApplicationId);

  const app = applications.find((a) => a.id === selectedId);

  // 本地编辑状态
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showAddInterview, setShowAddInterview] = useState(false);

  if (!app) return null;

  const deadlineInfo = getDeadlineInfo(app.deadline);

  // 关闭抽屉
  const handleClose = () => {
    setSelectedApplicationId(null);
    setEditingNotes(false);
    setShowDeleteConfirm(false);
  };

  // 更新材料状态
  const updateMaterial = (materialId: string, status: MaterialItem['status']) => {
    const newMaterials = app.materials.map((m) =>
      m.id === materialId ? { ...m, status } : m
    );
    updateApplication(app.id, { materials: newMaterials });
  };

  // 打开全局编辑框
  const handleEditDetailedInfo = () => {
    setEditingApplicationId(app.id);
    setShowModal(true);
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !app.tags.includes(newTag.trim())) {
      updateApplication(app.id, { tags: [...app.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    updateApplication(app.id, { tags: app.tags.filter((t) => t !== tag) });
  };

  // 保存备注
  const handleSaveNotes = () => {
    updateApplication(app.id, { notes: notesValue });
    setEditingNotes(false);
  };

  // 开始编辑备注
  const startEditNotes = () => {
    setNotesValue(app.notes);
    setEditingNotes(true);
  };

  // 添加面试记录
  const handleAddInterview = (interview: Omit<InterviewRound, 'id'>) => {
    const newInterview: InterviewRound = { ...interview, id: uuidv4() };
    updateApplication(app.id, { interviews: [...app.interviews, newInterview] });
    setShowAddInterview(false);
  };

  // 更新面试结果
  const updateInterviewResult = (interviewId: string, result: InterviewRound['result']) => {
    const newInterviews = app.interviews.map((iv) =>
      iv.id === interviewId ? { ...iv, result } : iv
    );
    updateApplication(app.id, { interviews: newInterviews });
  };

  // 材料状态颜色和标签
  const materialStatusConfig: Record<MaterialItem['status'], { label: string; color: string; bg: string }> = {
    not_started: { label: '未准备', color: '#EF4444', bg: '#EF444420' },
    in_progress: { label: '准备中', color: '#F59E0B', bg: '#F59E0B20' },
    submitted: { label: '已提交', color: '#22C55E', bg: '#22C55E20' },
  };

  // 面试结果颜色
  const interviewResultConfig: Record<InterviewRound['result'], { label: string; color: string }> = {
    passed: { label: '通过', color: '#22C55E' },
    failed: { label: '未通过', color: '#EF4444' },
    pending: { label: '待定', color: '#F59E0B' },
  };

  // 材料完成率
  const materialTotal = app.materials.length;
  const materialDone = app.materials.filter((m) => m.status === 'submitted').length;
  const materialProgress = materialTotal > 0 ? Math.round((materialDone / materialTotal) * 100) : 0;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* 抽屉 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-bg-panel border-l border-border z-50 animate-slide-in overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-bg-panel/95 backdrop-blur-md border-b border-border p-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-xl text-text-primary">{app.company}</h2>
              <p className="text-text-secondary text-sm mt-1">{app.position}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleEditDetailedInfo}
                className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent transition-colors hidden group-hover/drawer:block md:block"
                title="编辑基本信息"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                title="关闭"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 状态标签 */}
          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${getStatusColor(app.status)}20`,
                color: getStatusColor(app.status),
              }}
            >
              {getStatusLabel(app.status)}
            </span>
            {app.deadline && (
              <span className={`text-xs ${deadlineInfo.color} font-medium`}>
                {deadlineInfo.text}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* 基本信息 */}
          <section>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-bg-primary rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">工作地点</p>
                <p className="text-text-primary">{app.location}</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">投递平台</p>
                <p className="text-text-primary">{app.platform}</p>
              </div>
              {app.salary && (
                <div className="bg-bg-primary rounded-lg p-3">
                  <p className="text-text-muted text-xs mb-1">薪资范围</p>
                  <p className="text-text-primary">{app.salary}</p>
                </div>
              )}
              {app.deadline && (
                <div className="bg-bg-primary rounded-lg p-3">
                  <p className="text-text-muted text-xs mb-1">截止日期</p>
                  <p className={`${deadlineInfo.color}`}>{app.deadline}</p>
                </div>
              )}
            </div>
            {app.jdUrl && (
              <a
                href={app.jdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-accent text-sm hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                查看岗位 JD
              </a>
            )}
          </section>

          {/* 标签 */}
          <section>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              标签
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {app.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 group/tag"
                  style={{
                    backgroundColor: `${getTagColor(tag)}20`,
                    color: getTagColor(tag),
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 group-hover/tag:opacity-100 transition-opacity ml-0.5 hover:scale-110"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="添加标签..."
                className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm hover:bg-accent/20 transition-colors"
              >
                添加
              </button>
            </div>
          </section>

          {/* 材料清单 */}
          <section>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              材料清单
              <span className="text-text-muted text-xs font-normal ml-auto">{materialProgress}% 完成</span>
            </h3>

            {/* 进度条 */}
            <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500"
                style={{ width: `${materialProgress}%` }}
              />
            </div>

            <div className="space-y-2">
              {app.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between bg-bg-primary rounded-lg p-3"
                >
                  <span className="text-sm text-text-primary">{material.label}</span>
                  <select
                    value={material.status}
                    onChange={(e) => updateMaterial(material.id, e.target.value as MaterialItem['status'])}
                    className="text-xs px-2 py-1 rounded-md border-0 cursor-pointer font-medium"
                    style={{
                      backgroundColor: materialStatusConfig[material.status].bg,
                      color: materialStatusConfig[material.status].color,
                    }}
                  >
                    <option value="not_started">未准备</option>
                    <option value="in_progress">准备中</option>
                    <option value="submitted">已提交</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* 面试记录时间线 */}
          <section>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              面试记录
            </h3>

            {app.interviews.length > 0 ? (
              <div className="relative ml-3">
                {/* 时间线竖线 */}
                <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

                <div className="space-y-4">
                  {app.interviews.map((interview) => {
                    const resultConfig = interviewResultConfig[interview.result];
                    return (
                      <div key={interview.id} className="pl-6 relative">
                        {/* 时间线圆点 */}
                        <div
                          className="absolute left-[-4px] top-2 w-2 h-2 rounded-full"
                          style={{ backgroundColor: resultConfig.color }}
                        />

                        <div className="bg-bg-primary rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-text-primary">{interview.round}</span>
                            <select
                              value={interview.result}
                              onChange={(e) => updateInterviewResult(interview.id, e.target.value as InterviewRound['result'])}
                              className="text-xs px-2 py-0.5 rounded border-0 cursor-pointer font-medium"
                              style={{
                                backgroundColor: `${resultConfig.color}20`,
                                color: resultConfig.color,
                              }}
                            >
                              <option value="pending">待定</option>
                              <option value="passed">通过</option>
                              <option value="failed">未通过</option>
                            </select>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-2">
                            <span>{formatDateTime(interview.date)}</span>
                            <span className="text-border">·</span>
                            <span>{INTERVIEW_FORMAT_OPTIONS.find(f => f.value === interview.format)?.label || interview.format}</span>
                            {interview.interviewer && (
                              <>
                                <span className="text-border">·</span>
                                <span>{interview.interviewer}</span>
                              </>
                            )}
                          </div>
                          {interview.notes && (
                            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                              {interview.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm">暂无面试记录</p>
            )}

            {/* 添加面试按钮 */}
            {!showAddInterview ? (
              <button
                onClick={() => setShowAddInterview(true)}
                className="mt-3 w-full py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                添加面试记录
              </button>
            ) : (
              <AddInterviewForm
                onSubmit={handleAddInterview}
                onCancel={() => setShowAddInterview(false)}
              />
            )}
          </section>

          {/* 备注区 */}
          <section>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              备注
            </h3>

            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="w-full h-32 bg-bg-primary border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none transition-colors"
                  placeholder="记录公司信息、面经、感受等..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-4 py-1.5 bg-bg-primary text-text-secondary rounded-lg text-sm hover:text-text-primary transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={startEditNotes}
                className="bg-bg-primary rounded-lg p-3 text-sm text-text-secondary leading-relaxed cursor-pointer hover:border-accent/30 border border-transparent transition-colors min-h-[60px] whitespace-pre-wrap"
              >
                {app.notes || '点击添加备注...'}
              </div>
            )}
          </section>

          {/* 危险操作区 */}
          <section className="pt-4 border-t border-border">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-danger text-sm hover:underline flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                删除此申请
              </button>
            ) : (
              <div className="bg-danger/10 rounded-lg p-3">
                <p className="text-sm text-danger mb-2">确定要删除这条申请记录吗？此操作不可撤销。</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      deleteApplication(app.id);
                      handleClose();
                    }}
                    className="px-4 py-1.5 bg-danger text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    确定删除
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-1.5 bg-bg-primary text-text-secondary rounded-lg text-sm hover:text-text-primary transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

// 添加面试记录表单
function AddInterviewForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (interview: Omit<InterviewRound, 'id'>) => void;
  onCancel: () => void;
}) {
  const [round, setRound] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState<InterviewRound['format']>('online');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!round || !date) return;
    onSubmit({
      round,
      date,
      format,
      interviewer: interviewer || undefined,
      notes,
      result: 'pending',
    });
  };

  return (
    <div className="mt-3 bg-bg-primary rounded-lg p-4 space-y-3 border border-border animate-fade-in">
      <input
        type="text"
        value={round}
        onChange={(e) => setRound(e.target.value)}
        placeholder="轮次名称（如：一面、HR面）"
        className="w-full bg-bg-panel border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full bg-bg-panel border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
      />
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as InterviewRound['format'])}
        className="w-full bg-bg-panel border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
      >
        {INTERVIEW_FORMAT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        type="text"
        value={interviewer}
        onChange={(e) => setInterviewer(e.target.value)}
        placeholder="面试官（选填）"
        className="w-full bg-bg-panel border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="面试笔记..."
        className="w-full h-20 bg-bg-panel border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!round || !date}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-bg-panel text-text-secondary rounded-lg text-sm hover:text-text-primary transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}
