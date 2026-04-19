import { Database, Shield, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  ActionButton,
  PageIntro,
  Panel,
  StatusBadge,
  Tabs,
} from '../components/platform/PlatformUI';
import { settingsPageData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

export default function SettingsPage() {
  const { showMessage } = useAppShell();
  const [activeTab, setActiveTab] = useState(settingsPageData.tabs[0]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="底层配置页"
        title="系统设置"
        description="负责阈值、规则、校准、权限、导出、备份、API 接入与日志审计等平台底层配置，确保平台可持续复用和可审计。"
        tags={['阈值配置', '规则集', '校准记录', '权限审计']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('配置快照已创建')}>
              生成配置快照
            </ActionButton>
            <ActionButton onClick={() => showMessage('当前设置已保存')}>
              保存当前设置
            </ActionButton>
          </>
        }
      />

      <div className="overflow-x-auto pb-1">
        <Tabs items={settingsPageData.tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === '报警阈值配置' ? (
        <Panel title="报警阈值配置" subtitle="统一维护张力、水位、复水延迟与链路超时等阈值。" icon={SlidersHorizontal}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {settingsPageData.thresholds.map((item) => (
              <div key={item.name} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{item.name}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500">{item.scope}</p>
                <p className="mt-1 text-xs text-slate-400">更新于 {item.updatedAt}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '水分控制规则' ? (
        <Panel title="水分控制规则" subtitle="专题页中的阈值与策略应来自这里，而不是在页面中硬编码。" icon={SlidersHorizontal}>
          <div className="space-y-4">
            {settingsPageData.rules.map((item) => (
              <div key={item.name} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                  </div>
                  <div className="sm:text-right">
                    <StatusBadge tone="sky">{item.mode}</StatusBadge>
                    <p className="mt-2 text-xs text-slate-500">维护者：{item.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '传感器校准记录' ? (
        <Panel title="传感器校准记录" subtitle="用于追踪张力计、pH / EC 模块和网关时间同步等校准活动。" icon={Database}>
          <div className="overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-[600px] w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-4">对象</th>
                  <th className="px-5 py-4">方法</th>
                  <th className="px-5 py-4">结果</th>
                  <th className="px-5 py-4">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {settingsPageData.calibrations.map((item) => (
                  <tr key={`${item.sensor}-${item.time}`} className="text-sm text-slate-700">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.sensor}</td>
                    <td className="px-5 py-4">{item.method}</td>
                    <td className="px-5 py-4"><StatusBadge>{item.result}</StatusBadge></td>
                    <td className="px-5 py-4">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {activeTab === '用户权限' ? (
        <Panel title="用户权限" subtitle="围绕科研角色划分访问边界，而不是通用消费级用户体系。" icon={Shield}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {settingsPageData.permissions.map((item) => (
              <div key={item.role} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">{item.role}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.access}</p>
                <p className="mt-4 text-xs text-slate-500">当前人数：{item.count}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '数据导出' ? (
        <Panel title="数据导出" subtitle="支持专题图版、监测数据、设备巡检日志等多种导出。" icon={Database}>
          <div className="grid gap-4 md:grid-cols-3">
            {settingsPageData.exports.map((item) => (
              <div key={item.name} className="rounded-[22px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-2 text-sm text-slate-500">格式：{item.format}</p>
                <p className="mt-3"><StatusBadge tone="emerald">{item.status}</StatusBadge></p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '备份与恢复' ? (
        <Panel title="备份与恢复" subtitle="以平台快照和实验数据库备份确保科研数据安全。" icon={Shield}>
          <div className="grid gap-4 md:grid-cols-2">
            {settingsPageData.backups.map((item) => (
              <div key={item.name} className="rounded-[22px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.target}</p>
                <p className="mt-4"><StatusBadge tone="emerald">{item.status}</StatusBadge></p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === 'API 接入' ? (
        <Panel title="API 接入" subtitle="为后续 ESP32 / LoRa 节点、实验室系统和外部分析服务保留统一接口。" icon={Database}>
          <div className="space-y-4">
            {settingsPageData.apiAccess.map((item) => (
              <div key={item.name} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-2 font-mono text-xs text-slate-500">{item.endpoint}</p>
                  </div>
                  <StatusBadge tone={item.status === '待接入' ? 'amber' : item.status === '内测' ? 'sky' : 'emerald'}>{item.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === '日志审计' ? (
        <Panel title="日志审计" subtitle="记录阈值调整、数据备份、样品回填等关键平台行为。" icon={Shield}>
          <div className="overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-[600px] w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-4">时间</th>
                  <th className="px-5 py-4">操作者</th>
                  <th className="px-5 py-4">动作</th>
                  <th className="px-5 py-4">结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {settingsPageData.auditLogs.map((item) => (
                  <tr key={`${item.time}-${item.action}`} className="text-sm text-slate-700">
                    <td className="px-5 py-4">{item.time}</td>
                    <td className="px-5 py-4">{item.actor}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.action}</td>
                    <td className="px-5 py-4"><StatusBadge tone="emerald">{item.result}</StatusBadge></td>
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
