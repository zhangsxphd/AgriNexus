import { Activity, CloudRain, Database, FlaskConical, Gauge, LineChart, Radio, Waves } from 'lucide-react';
import { useState } from 'react';
import {
  ActionButton,
  LineChartPanel,
  MetricTile,
  PageIntro,
  Panel,
  StatusBadge,
  Tabs,
} from '../components/platform/PlatformUI';
import { dashboardData, monitoringData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function FieldMonitoringPage() {
  const { showMessage } = useAppShell();
  const [activeTab, setActiveTab] = useState(monitoringData.tabs[0]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="单小区全过程监测"
        title={monitoringData.header.title}
        description={`${monitoringData.header.location} · 当前生育阶段为 ${monitoringData.header.stage}，窗口定位 ${monitoringData.header.windowDay}，最近一次上报时间 ${monitoringData.header.lastReport}。`}
        tags={monitoringData.header.badges}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('已切换到小区筛选器')}>
              切换小区
            </ActionButton>
            <ActionButton onClick={() => showMessage('关键窗口放大视图已锁定为 T-10 ~ T+15')}>
              一键放大关键窗口
            </ActionButton>
          </>
        }
      />

      <div className="overflow-x-auto pb-1">
        <Tabs items={monitoringData.tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === '整季过程' ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Panel title="实时参数卡" subtitle="自动连续采集参数按科研监测语义展开。" icon={Activity}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
                {monitoringData.seasonMetrics.map((metric) => (
                  <MetricTile
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    unit={metric.unit}
                    status={metric.status}
                    tone={metric.tone}
                    trend={metric.trend}
                    series={metric.series}
                    valueGroups={metric.valueGroups}
                    variant="square"
                  />
                ))}
              </div>
            </Panel>

            <Panel title="设备状态区" subtitle="节点、链路、缓存与执行器状态一并展示。" icon={Radio}>
              <div className="space-y-3">
                {monitoringData.deviceStatus.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </Panel>
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
              <LineChartPanel
                labels={dashboardData.seasonCharts.stageLabels}
                series={dashboardData.seasonCharts.atmosphere}
                markers={dashboardData.seasonCharts.markers}
              />
            </Panel>

            <Panel title="PAR / 光照 / 冠层温度与降雨响应" subtitle="用于识别降雨事件、辐射变化与冠层热响应的耦合关系。" icon={Gauge}>
              <LineChartPanel
                labels={dashboardData.seasonCharts.stageLabels}
                series={dashboardData.seasonCharts.radiation}
                markers={dashboardData.seasonCharts.markers}
              />
              <div className="mt-4">
                <LineChartPanel
                  labels={dashboardData.seasonCharts.stageLabels}
                  series={dashboardData.seasonCharts.rainfall}
                  markers={dashboardData.seasonCharts.markers}
                  height={210}
                />
              </div>
            </Panel>
          </div>
        </>
      ) : null}

      {activeTab === '关键窗口' ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Panel title="T-10 ~ T+15 水位—张力联动图" subtitle="局部放大关键窗口，突出阈值控制线、T0 与复水事件。" icon={Waves}>
              <LineChartPanel labels={monitoringData.windowCharts.labels} series={monitoringData.windowCharts.waterAndTension} />
              <div className="mt-4 flex flex-wrap gap-2">
                {monitoringData.windowCharts.thresholdLines.map((threshold) => (
                  <StatusBadge key={threshold} tone="amber">
                    {threshold}
                  </StatusBadge>
                ))}
              </div>
            </Panel>
            <Panel title="当前处理建议" subtitle="此处只展示单小区局部放大，不替代专题页。" icon={FlaskConical}>
              <div className="space-y-3">
                {monitoringData.windowCharts.recommendations.map((item) => (
                  <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="CH₄ / N₂O 通量变化" subtitle="识别割后脉冲与复湿脉冲的峰值时段。" icon={Activity}>
              <LineChartPanel labels={monitoringData.windowCharts.labels} series={monitoringData.windowCharts.gasFlux} />
            </Panel>
            <Panel title="关键指标卡" subtitle="芽启动、根系与排放指标集中展示。" icon={Database}>
              <div className="grid gap-4 sm:grid-cols-2">
                {monitoringData.keyWindowIndicators.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-semibold text-slate-900">{item.value}</span>
                      <span className="mb-1 text-xs text-slate-500">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      ) : null}

      {activeTab === '田间记录' ? (
        <Panel title="人工田间记录" subtitle="成苗密度、倒伏率、留桩高度、巡田记录与图片上传在同一流中管理。" icon={FlaskConical}>
          <div className="space-y-3">
            {monitoringData.fieldRecords.map((record) => (
              <div key={`${record.date}-${record.type}`} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="sky">{record.type}</StatusBadge>
                      <span className="text-xs text-slate-500">{record.date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{record.detail}</p>
                  </div>
                  <div className="text-sm font-medium text-slate-500">记录人：{record.person}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '科研样品' ? (
        <Panel title="科研样品与回填状态" subtitle="根际土样、植物样、气体样与 13C 样按编号、时间与分析状态统一展示。" icon={Database}>
          <div className="overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-[700px] w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-4">样品编号</th>
                  <th className="px-5 py-4">样品类型</th>
                  <th className="px-5 py-4">采样时间</th>
                  <th className="px-5 py-4">实验室分析</th>
                  <th className="px-5 py-4">当前状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {monitoringData.samples.map((item) => (
                  <tr key={item.code} className="text-sm text-slate-700">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.code}</td>
                    <td className="px-5 py-4">{item.type}</td>
                    <td className="px-5 py-4">{item.time}</td>
                    <td className="px-5 py-4">{item.lab}</td>
                    <td className="px-5 py-4">
                      <StatusBadge>{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
