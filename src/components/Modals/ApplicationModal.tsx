import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../../store/useAppStore';
import { ApplicationStatus, KANBAN_COLUMNS, PLATFORM_OPTIONS, DEFAULT_MATERIALS } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// 表单校验 Schema
const applicationSchema = z.object({
  company: z.string().min(1, '请输入公司名称'),
  position: z.string().min(1, '请输入岗位名称'),
  location: z.string().min(1, '请输入工作地点'),
  salary: z.string().optional(),
  platform: z.string().min(1, '请选择投递平台'),
  jdUrl: z.string().optional(),
  deadline: z.string().optional(),
  status: z.string().min(1, '请选择申请阶段'),
  tags: z.string().optional(),
  notes: z.string().optional(),
  materials: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, '请输入材料名称'),
      status: z.enum(['not_started', 'in_progress', 'submitted']),
    })
  ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplicationModal() {
  const showModal = useAppStore((s) => s.showModal);
  const editingId = useAppStore((s) => s.editingApplicationId);
  const applications = useAppStore((s) => s.applications);
  const addApplication = useAppStore((s) => s.addApplication);
  const updateApplication = useAppStore((s) => s.updateApplication);
  const setShowModal = useAppStore((s) => s.setShowModal);
  const setEditingApplicationId = useAppStore((s) => s.setEditingApplicationId);

  const editingApp = editingId ? applications.find((a) => a.id === editingId) : null;
  const isEditing = !!editingApp;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: '',
      position: '',
      location: '',
      salary: '',
      platform: '',
      jdUrl: '',
      deadline: '',
      status: 'wishlist',
      tags: '',
      notes: '',
      materials: DEFAULT_MATERIALS.map((label) => ({
        id: uuidv4(),
        label,
        status: 'not_started' as const,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  // 编辑模式下填充数据
  useEffect(() => {
    if (editingApp) {
      reset({
        company: editingApp.company,
        position: editingApp.position,
        location: editingApp.location,
        salary: editingApp.salary || '',
        platform: editingApp.platform,
        jdUrl: editingApp.jdUrl || '',
        deadline: editingApp.deadline || '',
        status: editingApp.status,
        tags: editingApp.tags.join(', '),
        notes: editingApp.notes,
        materials: editingApp.materials,
      });
    } else {
      reset({
        company: '',
        position: '',
        location: '',
        salary: '',
        platform: '',
        jdUrl: '',
        deadline: '',
        status: 'wishlist',
        tags: '',
        notes: '',
        materials: DEFAULT_MATERIALS.map((label) => ({
          id: uuidv4(),
          label,
          status: 'not_started' as const,
        })),
      });
    }
  }, [editingApp, reset]);

  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(false);
    setEditingApplicationId(null);
    reset();
  };

  const onSubmit = (data: ApplicationFormData) => {
    const tags = data.tags
      ? data.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
      : [];

    if (isEditing && editingApp) {
      updateApplication(editingApp.id, {
        company: data.company,
        position: data.position,
        location: data.location,
        salary: data.salary || undefined,
        platform: data.platform,
        jdUrl: data.jdUrl || undefined,
        deadline: data.deadline || undefined,
        status: data.status as ApplicationStatus,
        tags,
        notes: data.notes || '',
        materials: data.materials,
      });
    } else {
      addApplication({
        company: data.company,
        position: data.position,
        location: data.location,
        salary: data.salary || undefined,
        platform: data.platform,
        jdUrl: data.jdUrl || undefined,
        deadline: data.deadline || undefined,
        status: data.status as ApplicationStatus,
        tags,
        notes: data.notes || '',
        materials: data.materials,
        interviews: [],
      });
    }

    handleClose();
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* 模态框 */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-bg-panel border border-border rounded-2xl z-50 overflow-y-auto animate-scale-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-bg-panel/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-text-primary">
            {isEditing ? '编辑申请' : '添加新申请'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/10 text-accent rounded flex items-center justify-center text-xs">1</span>
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">公司名称 *</label>
                  <input
                    {...register('company')}
                    placeholder="例如：字节跳动"
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {errors.company && (
                    <p className="text-danger text-xs mt-1">{errors.company.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">岗位名称 *</label>
                  <input
                    {...register('position')}
                    placeholder="例如：前端开发工程师（实习）"
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {errors.position && (
                    <p className="text-danger text-xs mt-1">{errors.position.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">工作地点 *</label>
                  <input
                    {...register('location')}
                    placeholder="例如：北京"
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {errors.location && (
                    <p className="text-danger text-xs mt-1">{errors.location.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">薪资范围</label>
                  <input
                    {...register('salary')}
                    placeholder="例如：400-600/天"
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">投递平台 *</label>
                  <select
                    {...register('platform')}
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                  >
                    <option value="">请选择平台</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.platform && (
                    <p className="text-danger text-xs mt-1">{errors.platform.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">申请阶段 *</label>
                  <select
                    {...register('status')}
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.emoji} {col.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">截止日期</label>
                  <input
                    type="date"
                    {...register('deadline')}
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">岗位链接 (JD)</label>
                  <input
                    {...register('jdUrl')}
                    placeholder="https://..."
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/10 text-accent rounded flex items-center justify-center text-xs">2</span>
                标签
              </h3>
              <input
                {...register('tags')}
                placeholder="用逗号分隔，例如：互联网, 技术, 暑期实习"
                className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              <p className="text-text-muted text-xs mt-1.5">多个标签请用逗号分隔</p>
            </div>

            {/* 材料清单 */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/10 text-accent rounded flex items-center justify-center text-xs">3</span>
                材料清单
              </h3>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 bg-bg-primary rounded-lg p-3">
                    <input
                      {...register(`materials.${index}.label`)}
                      className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none"
                      placeholder="材料名称"
                    />
                    <select
                      {...register(`materials.${index}.status`)}
                      className="text-xs bg-bg-panel border border-border rounded px-2 py-1 text-text-primary"
                    >
                      <option value="not_started">未准备</option>
                      <option value="in_progress">准备中</option>
                      <option value="submitted">已提交</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 text-text-muted hover:text-danger transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append({ id: uuidv4(), label: '', status: 'not_started' })}
                  className="w-full py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors"
                >
                  + 添加材料项
                </button>
              </div>
            </div>

            {/* 备注 */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/10 text-accent rounded flex items-center justify-center text-xs">4</span>
                备注
              </h3>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="记录公司信息、面经、感受等..."
                className="w-full bg-bg-primary border border-border rounded-lg p-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none transition-colors"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-bg-primary text-text-secondary rounded-lg text-sm hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
              >
                {isEditing ? '保存修改' : '添加申请'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
