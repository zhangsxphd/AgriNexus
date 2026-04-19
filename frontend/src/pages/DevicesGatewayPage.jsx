import { ArrowRight, Database, Radio, ServerCog, Wifi } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ActionButton,
  PageIntro,
  Panel,
  StatCard,
  StatusBadge,
} from '../components/platform/PlatformUI';
import { devicesPageData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function DevicesGatewayPage() {
  const { showMessage } = useAppShell();
  const [selectedNodeId, setSelectedNodeId] = useState(devicesPageData.nodes[0].id);

  const selectedNode = useMemo(
    () => devicesPageData.nodes.find((item) => item.id === selectedNodeId) ?? devicesPageData.nodes[0],
    [selectedNodeId],
  );

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="物联网工程页"
        title="设备与网关"
        description="集中展示田间监测节点、LoRa 网关、4G 上行链路、供电状态、通讯状态、固件版本、缓存与传感器健康，体现平台的工程属性。"
        tags={['LoRa 节点', '4G 上行', '缓存策略', '传感器健康']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('巡检工单已创建')}>
              创建巡检工单
            </ActionButton>
            <ActionButton onClick={() => showMessage('已触发一次链路诊断')}>
              运行链路诊断
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {devicesPageData.summary.map((item, index) => (
          <StatCard
            key={item.label}
            icon={index === 0 ? Radio : index === 1 ? ServerCog : index === 2 ? Wifi : Database}
            label={item.label}
            value={item.value}
            detail={item.detail}
            tone={item.tone}
          />
        ))}
      </div>

      <Panel title="网关拓扑图" subtitle="从田间节点到网关、4G 上传链路再到平台接入服务的核心链路。" icon={Wifi}>
        <div className="flex flex-col items-stretch gap-4 xl:flex-row xl:items-center">
          {devicesPageData.topology.map((item, index) => (
            <div key={item.id} className="flex flex-1 items-center gap-4">
              <div className="flex-1 rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <StatusBadge tone={item.tone}>在线</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.meta}</p>
              </div>
              {index < devicesPageData.topology.length - 1 ? <ArrowRight className="hidden shrink-0 text-slate-300 xl:block" /> : null}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="田间监测节点" subtitle="设备卡片用于快速切换节点并查看主要工程指标。" icon={Radio}>
          <div className="grid gap-4 md:grid-cols-2">
            {devicesPageData.nodes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedNodeId(item.id)}
                className={[
                  'rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg',
                  selectedNodeId === item.id ? 'border-sky-300 bg-sky-50/60' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">{item.id}</p>
                  <StatusBadge tone={item.status === '在线' ? 'emerald' : item.status === '弱信号' ? 'amber' : 'rose'}>
                    {item.status}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.position}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p>电池</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.battery}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p>RSSI</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.rssi}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p>缓存</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.cache}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p>成功率</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.success}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="节点详情侧栏" subtitle="显示最近心跳、固件、缓存和传感器健康等详细信息。" icon={ServerCog}>
          <div className="rounded-[26px] border border-slate-200 bg-slate-950/[0.02] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">当前节点</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedNode.id}</h3>
              </div>
              <StatusBadge tone={selectedNode.status === '在线' ? 'emerald' : selectedNode.status === '弱信号' ? 'amber' : 'rose'}>
                {selectedNode.status}
              </StatusBadge>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4"><span>所属网关</span><span className="font-semibold text-slate-900">{selectedNode.gateway}</span></div>
              <div className="flex justify-between gap-4"><span>固件版本</span><span className="font-semibold text-slate-900">{selectedNode.firmware}</span></div>
              <div className="flex justify-between gap-4"><span>最近一次上报</span><span className="font-semibold text-slate-900">{selectedNode.lastSeen}</span></div>
              <div className="flex justify-between gap-4"><span>上传成功率</span><span className="font-semibold text-slate-900">{selectedNode.success}</span></div>
              <div className="flex justify-between gap-4"><span>本地缓存数量</span><span className="font-semibold text-slate-900">{selectedNode.cache}</span></div>
              <div className="flex justify-between gap-4"><span>节点位置</span><span className="font-semibold text-slate-900">{selectedNode.position}</span></div>
              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">传感器列表</p>
                <p className="mt-2 leading-7 text-slate-700">{selectedNode.sensors}</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="传感器健康状态" subtitle="以表格方式概览各类传感器的健康数、漂移数与备注。" icon={Database}>
        <div className="overflow-x-auto rounded-[24px] border border-slate-200">
          <table className="min-w-[640px] w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-5 py-4">传感器类型</th>
                <th className="px-5 py-4">总数</th>
                <th className="px-5 py-4">健康</th>
                <th className="px-5 py-4">漂移</th>
                <th className="px-5 py-4">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {devicesPageData.sensorHealth.map((item) => (
                <tr key={item.sensor} className="text-sm text-slate-700">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.sensor}</td>
                  <td className="px-5 py-4">{item.count}</td>
                  <td className="px-5 py-4">{item.healthy}</td>
                  <td className="px-5 py-4">{item.drift}</td>
                  <td className="px-5 py-4">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
