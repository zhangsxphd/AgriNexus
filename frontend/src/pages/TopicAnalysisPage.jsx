import { FlaskConical, LineChart, Orbit, Waves } from 'lucide-react';
import { useState } from 'react';
import {
  ActionButton,
  HeatMatrix,
  LineChartPanel,
  PageIntro,
  Panel,
  StatCard,
  StatusBadge,
  Tabs,
} from '../components/platform/PlatformUI';
import { topicPageData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function TopicAnalysisPage() {
  const { showMessage } = useAppShell();
  const [treatment, setTreatment] = useState(topicPageData.filters.treatments[0]);
  const [variety, setVariety] = useState(topicPageData.filters.varieties[0]);
  const [compareMode, setCompareMode] = useState(topicPageData.filters.compareModes[0]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="专题分析层"
        title="主—再关键期：水分调控与再生响应"
        description={`围绕主季收割前后窗口期，综合分析水分控制、芽启动、气体脉冲、根际过程与 13C 碳分配。当前视图筛选为 ${treatment} / ${variety}，比较模式为 ${compareMode}。`}
        tags={['专题页非一级导航', '适合汇报截图', '支持处理与品种对比']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('专题快照导出为高分辨率 PNG')}>
              导出专题图版
            </ActionButton>
            <ActionButton onClick={() => showMessage('专题对比模式已切换到演示视图')}>
              启动 Compare 模式
            </ActionButton>
          </>
        }
      >
        <div className="mt-6 flex flex-wrap gap-3">
          {topicPageData.filters.treatments.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTreatment(item)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                treatment === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
          {topicPageData.filters.varieties.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setVariety(item)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                variety === item ? 'bg-sky-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
        </div>
      </PageIntro>

      <Tabs items={topicPageData.filters.compareModes} value={compareMode} onChange={setCompareMode} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topicPageData.overviewCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} tone={item.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title="窗口期总览" subtitle="显示关键窗口节点分布与当前风险。" icon={FlaskConical}>
          <div className="grid gap-3 sm:grid-cols-2">
            {topicPageData.nodeDistribution.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[22px] border border-rose-200 bg-rose-50/70 p-4">
            <p className="text-sm font-semibold text-rose-900">当前重点风险</p>
            <div className="mt-3 space-y-2">
              {topicPageData.risks.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-rose-900">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="水分控制分析" subtitle="比较 W0 / W1 / W2 的水位、张力、阈值触发与复水恢复速度。" icon={Waves}>
          <LineChartPanel labels={topicPageData.waterControl.labels} series={topicPageData.waterControl.levelSeries} />
          <div className="mt-4">
            <LineChartPanel labels={topicPageData.waterControl.labels} series={topicPageData.waterControl.tensionSeries} height={220} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topicPageData.waterControl.metrics.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="芽启动分析" subtitle="对比再生芽萌发率、芽长、再生茎蘖数与存活残桩密度。" icon={Orbit}>
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-5 py-4">指标</th>
                <th className="px-5 py-4">W0</th>
                <th className="px-5 py-4">W1</th>
                <th className="px-5 py-4">W2</th>
                <th className="px-5 py-4">最佳处理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topicPageData.budStart.map((item) => (
                <tr key={item.label} className="text-sm text-slate-700">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.label}</td>
                  <td className="px-5 py-4">{item.w0}</td>
                  <td className="px-5 py-4">{item.w1}</td>
                  <td className="px-5 py-4">{item.w2}</td>
                  <td className="px-5 py-4"><StatusBadge tone="emerald">{item.best}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="气体脉冲分析" subtitle="展示 CH₄ / N₂O 脉冲曲线、割后峰值、复湿峰值与累计排放。" icon={LineChart}>
          <LineChartPanel labels={topicPageData.gasPulse.labels} series={topicPageData.gasPulse.ch4} />
          <div className="mt-4">
            <LineChartPanel labels={topicPageData.gasPulse.labels} series={topicPageData.gasPulse.n2o} height={220} />
          </div>
        </Panel>

        <Panel title="气体脉冲摘要" subtitle="以卡片形式呈现当前专题最关心的排放结论。" icon={LineChart}>
          <div className="grid gap-4 sm:grid-cols-2">
            {topicPageData.gasPulse.summary.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="根际过程分析" subtitle="使用热力矩阵概览 DOC、无机氮、有效磷、Eh、酶活与功能基因变化。" icon={FlaskConical}>
          <HeatMatrix columns={topicPageData.rhizosphere.columns} rows={topicPageData.rhizosphere.rows} />
          <div className="mt-4 space-y-2">
            {topicPageData.rhizosphere.notes.map((item) => (
              <div key={item} className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="13C 碳分配分析" subtitle="展示叶、茎鞘、残桩、新生芽、根与根际 DOC 的碳分配路径。" icon={Orbit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {topicPageData.carbonAllocation.partitions.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <StatusBadge tone={item.tone}>{item.value}%</StatusBadge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-4">路径</th>
                  <th className="px-5 py-4">W0</th>
                  <th className="px-5 py-4">W1</th>
                  <th className="px-5 py-4">W2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {topicPageData.carbonAllocation.compare.map((item) => (
                  <tr key={item.label} className="text-sm text-slate-700">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.label}</td>
                    <td className="px-5 py-4">{item.w0}</td>
                    <td className="px-5 py-4">{item.w1}</td>
                    <td className="px-5 py-4">{item.w2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
