import {
  Activity,
  AlertTriangle,
  BellRing,
  CloudRain,
  Database,
  FlaskConical,
  Gauge,
  LineChart,
  Radio,
  Sprout,
  Waves,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionButton,
  LineChartPanel,
  MetricTile,
  Panel,
  PlotMatrix,
  StatCard,
  StatusBadge,
  Timeline,
} from '../components/platform/PlatformUI';
import { dashboardData, treatmentGroups } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

const iconMap = {
  plots: Activity,
  devices: Radio,
  reports: Database,
  alerts: BellRing,
  risks: AlertTriangle,
  phase: Sprout,
  runtime: Gauge,
  windowPlots: FlaskConical,
  dryingPlots: Waves,
  rewaterPlots: CloudRain,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { showMessage } = useAppShell();
  const showKeyWindowTimeline = dashboardData.windowStatus.showTimeline;
  const timelineTitle = showKeyWindowTimeline ? '全生育期时间轴与关键窗口状态' : '全生育期时间轴';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboardData.kpis.map((item) => (
          <StatCard
            key={item.key}
            icon={iconMap[item.key]}
            label={item.label}
            value={item.value}
            detail={item.detail}
            tone={item.tone}
            trend={item.trend}
          />
        ))}
      </div>

      <Panel title={timelineTitle} icon={Sprout}>
        <div className="space-y-6">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge tone="emerald">全生育期阶段</StatusBadge>
              <span className="text-sm text-slate-500">当前生育阶段：灌浆成熟，距主季收割还有 3 天</span>
            </div>
            <Timeline items={dashboardData.fullSeasonTimeline} showSegmentDurations />
          </div>

          {showKeyWindowTimeline ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusBadge tone="violet">关键窗口节点</StatusBadge>
                <span className="text-sm text-slate-500">当前窗口：T-3，距 T0 还有 3 天</span>
              </div>
              <Timeline items={dashboardData.keyWindowTimeline} compact />
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel title="关键实时参数概览" subtitle="自动连续采集、设备链路与阀门执行状态以统一卡片展示，支持快速识别异常点。" icon={Activity}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {dashboardData.liveMetrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              tone={metric.tone}
              status={metric.status}
              trend={metric.trend}
              series={metric.series}
              variant="square"
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.42fr_0.82fr]">
        <Panel
          title="24 小区试验矩阵总览"
          subtitle="按 3 个水分处理 × 2 个品种 × 4 重复组织展示，单元中同时呈现水位、张力、报警与关键阶段状态。"
          icon={FlaskConical}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton onClick={() => navigate('/monitoring')} variant="secondary">
                田间监测
              </ActionButton>
              <ActionButton onClick={() => navigate('/experiments/ratoon-water-window')}>
                专题页
              </ActionButton>
            </div>
          }
        >
          <PlotMatrix groups={treatmentGroups} onPlotClick={(plot) => navigate('/monitoring', { state: { plotId: plot.id } })} />
        </Panel>

        <div className="space-y-6">
          <Panel title="关键窗口状态" subtitle={dashboardData.windowStatus.nextEvent} icon={Gauge}>
            <div className="grid gap-3 sm:grid-cols-2">
              {dashboardData.windowStatus.counts.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[24px] border border-violet-200 bg-violet-50/80 p-4">
              <p className="text-sm font-semibold text-violet-900">{dashboardData.windowStatus.headline}</p>
              <div className="mt-3 space-y-2">
                {dashboardData.windowStatus.risks.map((risk) => (
                  <div key={risk} className="flex items-start gap-2 text-sm text-violet-900">
                    <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel
            title="当前报警与决策建议"
            subtitle="科研试验风险、关键事件提醒与决策建议在同一视图中串联。"
            icon={AlertTriangle}
            action={
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
              >
                查看全部预警
              </button>
            }
          >
            <div className="space-y-3">
              {dashboardData.alerts.map((alert) => (
                <div key={alert.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={alert.level === '高' ? 'rose' : 'amber'}>{alert.level}风险</StatusBadge>
                      <span className="text-sm font-semibold text-slate-800">{alert.type}</span>
                    </div>
                    <span className="text-xs text-slate-500">{alert.plot}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{alert.detail}</p>
                  <p className="mt-2 text-xs text-slate-500">{alert.recommendation}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-950/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <LineChart size={16} className="text-sky-700" />
                <p className="text-sm font-semibold text-slate-900">决策建议卡片</p>
              </div>
              <div className="space-y-3">
                {dashboardData.decisions.map((decision) => (
                  <button
                    key={decision.id}
                    type="button"
                    onClick={() => showMessage(`已打开建议：${decision.title}`)}
                    className="w-full rounded-[22px] border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{decision.title}</p>
                      <StatusBadge tone="sky">置信度 {decision.confidence}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs font-medium text-sky-700">{decision.plotScope}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{decision.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="全生育期田面水位变化曲线" subtitle="分处理比较浅水、落干与复水过程，叠加关键事件标记。" icon={CloudRain}>
          <LineChartPanel
            labels={dashboardData.seasonCharts.stageLabels}
            series={dashboardData.seasonCharts.waterLevel}
            markers={dashboardData.seasonCharts.markers}
          />
        </Panel>

        <Panel title="全生育期土壤张力变化曲线" subtitle="用于判断阈值控制稳定性与关键窗口进入状态。" icon={Waves}>
          <LineChartPanel
            labels={dashboardData.seasonCharts.stageLabels}
            series={dashboardData.seasonCharts.tension}
            markers={dashboardData.seasonCharts.markers}
          />
        </Panel>

        <Panel title="温度 / 湿度 / CO₂ 日变化" subtitle="支持科研分析中的环境背景判读与时段回溯。" icon={LineChart}>
          <LineChartPanel labels={dashboardData.seasonCharts.stageLabels} series={dashboardData.seasonCharts.atmosphere} markers={dashboardData.seasonCharts.markers} />
        </Panel>

        <Panel title="PAR / 光照 / 冠层温度与降雨响应" subtitle="用于识别降雨事件、辐射变化与冠层热响应的耦合关系。" icon={Gauge}>
          <LineChartPanel labels={dashboardData.seasonCharts.stageLabels} series={dashboardData.seasonCharts.radiation} markers={dashboardData.seasonCharts.markers} />
          <div className="mt-4">
            <LineChartPanel labels={dashboardData.seasonCharts.stageLabels} series={dashboardData.seasonCharts.rainfall} markers={dashboardData.seasonCharts.markers} height={210} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
