import { CalendarDays, FlaskConical, Layers3, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionButton,
  PageIntro,
  Panel,
  PlotMatrix,
  ProgressStrip,
  StatCard,
  StatusBadge,
} from '../components/platform/PlatformUI';
import { experimentPageData, treatmentGroups } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function ExperimentManagementPage() {
  const navigate = useNavigate();
  const { showMessage } = useAppShell();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="科研试验执行中台"
        title={experimentPageData.overview.title}
        description={`${experimentPageData.overview.subtitle}。在此统一查看试验设计、关键事件、数据采集计划、样品管理、数据完整性以及专题研究入口。`}
        tags={['裂区设计', '24 小区', '全生育期监测', '窗口期强化']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('试验计划导出面板已打开')}>
              导出试验计划
            </ActionButton>
            <ActionButton onClick={() => navigate('/experiments/ratoon-water-window')}>
              进入专题分析
            </ActionButton>
          </>
        }
      />

      <Panel title="试验概况卡片" subtitle="当前项目采用通用平台底座承载，再生稻只是当前专题场景。" icon={FlaskConical}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experimentPageData.overview.cards.map((item) => (
            <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
        <Panel title="试验设计可视化" subtitle="3 个水分处理 × 2 个品种 × 4 次重复，并区分原位观测、产量评估、破坏性取样区。" icon={Layers3}>
          <PlotMatrix groups={treatmentGroups} compact onPlotClick={(plot) => showMessage(`已定位到 ${plot.id} 的试验设计信息`)} />
        </Panel>

        <Panel title="关键事件日历" subtitle="围绕主—再关键期组织事件排程，支持后续扩展到其他作物或课题。" icon={CalendarDays}>
          <div className="space-y-3">
            {experimentPageData.eventCalendar.map((item) => (
              <div key={`${item.date}-${item.title}`} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                  </div>
                  <StatusBadge tone={item.status === 'completed' ? 'emerald' : item.status === 'current' ? 'sky' : item.status === 'upcoming' ? 'amber' : 'slate'}>
                    {item.status === 'completed' ? '已完成' : item.status === 'current' ? '进行中' : item.status === 'upcoming' ? '即将执行' : '已排程'}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="数据采集计划" subtitle="覆盖自动连续采集、节点观测任务、高频窗口监测与事件对齐采样。" icon={FlaskConical}>
          <div className="space-y-4">
            {experimentPageData.collectionPlans.map((item) => (
              <ProgressStrip key={item.label} label={item.label} progress={item.progress} detail={item.detail} tone={item.tone} />
            ))}
          </div>
        </Panel>

        <Panel title="样品管理" subtitle="支持根际土、非根际土、植物样、气体样、同位素样和图片记录。" icon={Layers3}>
          <div className="grid gap-4 sm:grid-cols-2">
            {experimentPageData.sampleBuckets.map((bucket) => (
              <div key={bucket.name} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{bucket.name}</p>
                  <StatusBadge tone="sky">{bucket.done}/{bucket.total}</StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                  <div className="rounded-2xl bg-slate-50 px-2 py-3">
                    <p>总量</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{bucket.total}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-2 py-3">
                    <p>已完成</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">{bucket.done}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-2 py-3">
                    <p>待完成</p>
                    <p className="mt-1 text-sm font-semibold text-amber-700">{bucket.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="数据完整性面板" subtitle="关注缺失记录、异常记录、掉线小区、样品待回填与节点未完成任务。" icon={ShieldAlert}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {experimentPageData.integrity.map((item) => (
            <StatCard key={item.label} label={item.label} value={String(item.value)} detail={item.detail} tone={item.tone} />
          ))}
        </div>
      </Panel>

      <Panel title={experimentPageData.topicCard.title} subtitle={experimentPageData.topicCard.subtitle} icon={FlaskConical}>
        <div className="rounded-[28px] border border-violet-200 bg-[linear-gradient(135deg,rgba(124,58,237,0.16),rgba(14,165,233,0.08),rgba(255,255,255,0.95))] p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-violet-700">专题研究入口</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">{experimentPageData.topicCard.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-700">{experimentPageData.topicCard.detail}</p>
            </div>
            <ActionButton onClick={() => navigate('/experiments/ratoon-water-window')}>进入专题分析</ActionButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}
