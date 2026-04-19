import { BarChart3, LineChart, Microscope } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionButton,
  HeatMatrix,
  LineChartPanel,
  PageIntro,
  Panel,
  StatCard,
  Tabs,
} from '../components/platform/PlatformUI';
import { analysisPageData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { showMessage } = useAppShell();
  const [activeTab, setActiveTab] = useState(analysisPageData.tabs[0]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="科研数据中心"
        title="数据分析"
        description="平台按“整季过程分析”和“关键窗口机制分析（摘要版）”两层组织科研数据，不用单一专题逻辑替代整个分析中心。"
        tags={['图表可导出', '支持处理切换', '整季与窗口分层']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('整季分析包已加入导出队列')}>
              导出图表与数据
            </ActionButton>
            <ActionButton onClick={() => navigate('/experiments/ratoon-water-window')}>
              查看主—再关键期专题
            </ActionButton>
          </>
        }
      />

      <div className="overflow-x-auto pb-1">
        <Tabs items={analysisPageData.tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analysisPageData.seasonCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={`${item.value}${item.unit}`} detail={item.detail} tone={item.tone} />
        ))}
      </div>

      {activeTab === '整季过程分析' ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <Panel title="不同处理整季水位与张力对比" subtitle="用于评估整季水位控制稳定性、张力达标率与阶段性风险。" icon={LineChart}>
              <LineChartPanel labels={analysisPageData.seasonCharts.labels} series={analysisPageData.seasonCharts.waterControl} />
            </Panel>

            <Panel title="产量与风险并置卡片" subtitle="将主季产量、再生季产量、总产量与风险暴露并列观察。" icon={BarChart3}>
              <div className="space-y-3">
                {['W0', 'W1', 'W2'].map((treatment, index) => (
                  <div key={treatment} className="rounded-[24px] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-900">{treatment}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">处理比较</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-emerald-50 px-2 py-3">
                        <p className="text-xs text-slate-500">主季产量</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-700">{analysisPageData.seasonCharts.yieldAndRisk[0].values[index]}</p>
                      </div>
                      <div className="rounded-2xl bg-sky-50 px-2 py-3">
                        <p className="text-xs text-slate-500">再生季</p>
                        <p className="mt-1 text-sm font-semibold text-sky-700">{analysisPageData.seasonCharts.yieldAndRisk[1].values[index]}</p>
                      </div>
                      <div className="rounded-2xl bg-rose-50 px-2 py-3">
                        <p className="text-xs text-slate-500">风险暴露</p>
                        <p className="mt-1 text-sm font-semibold text-rose-700">{analysisPageData.seasonCharts.yieldAndRisk[2].values[index]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="整季过程判断" subtitle="通用分析中心负责整季对比，不承载专题页中的深度机制阐释。" icon={Microscope}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">水位控制稳定性</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">W1 在主季后期至主—再关键期的波动最小，张力阈值达标率高于其他处理，适合作为通用规则集基线。</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">整季风险分布</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">风险主要集中在 W2 强化落干后段和设备链路波动期，需与预警中心协同核查节点状态。</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">产量表现</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">W1 同时兼顾主季与再生季产量，是当前样本下的最优综合处理，但仍需专题页进一步核实排放与碳分配。</p>
              </div>
            </div>
          </Panel>
        </>
      ) : null}

      {activeTab === '关键窗口机制分析（摘要版）' ? (
        <>
          <Panel title="关键窗口机制摘要" subtitle="这里只提供摘要版，不替代主—再关键期专题页。" icon={Microscope}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {analysisPageData.windowDigest.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="机制指标热力矩阵" subtitle="摘要展示再生芽萌发率、排放脉冲、根际功能基因与 13C 分配的协同变化。" icon={BarChart3}>
            <HeatMatrix columns={analysisPageData.mechanismMatrix.columns} rows={analysisPageData.mechanismMatrix.rows} />
          </Panel>

          <Panel title="分析建议输出" subtitle="为下一步专题深挖、规则调整和回填工作提供统一建议。" icon={Microscope}>
            <div className="grid gap-4 md:grid-cols-3">
              {analysisPageData.recommendations.map((item) => (
                <div key={item} className="rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900">
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
