import { AlertTriangle, BellRing, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ActionButton,
  PageIntro,
  Panel,
  StatCard,
  StatusBadge,
  Tabs,
} from '../components/platform/PlatformUI';
import { alertsPageData } from '../data/platformData';
import { useAppShell } from '../hooks/useAppShell';

const levelTabs = ['全部', '高', '中', '低'];

export default function AlertsPage() {
  const { showMessage } = useAppShell();
  const [category, setCategory] = useState(alertsPageData.categories[0]);
  const [level, setLevel] = useState(levelTabs[0]);
  const [rows, setRows] = useState(alertsPageData.rows);
  const [selectedId, setSelectedId] = useState(alertsPageData.rows[0].id);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (category === '全部' || row.category === category) &&
          (level === '全部' || row.level === level),
      ),
    [category, level, rows],
  );

  const selectedRow = filteredRows.find((item) => item.id === selectedId) ?? filteredRows[0] ?? rows[0];

  const summary = {
    total: rows.length,
    pending: rows.filter((row) => row.status === '未处理').length,
    high: rows.filter((row) => row.level === '高').length,
    device: rows.filter((row) => row.category === '设备通讯类').length,
  };

  const updateStatus = (nextStatus) => {
    if (!selectedRow) return;
    setRows((current) => current.map((row) => (row.id === selectedRow.id ? { ...row, status: nextStatus } : row)));
    showMessage(`已将 ${selectedRow.id} 更新为 ${nextStatus}`);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="科研试验报警平台"
        title="预警中心"
        description="报警中心围绕水分控制、设备通讯和试验执行三类风险组织，不做纯 IT 运维告警页，而是服务科研试验执行与回溯。"
        tags={['水分控制类', '设备通讯类', '试验执行类']}
        actions={
          <>
            <ActionButton variant="secondary" onClick={() => showMessage('报警记录导出任务已创建')}>
              导出报警表
            </ActionButton>
            <ActionButton onClick={() => showMessage('当前筛选条件下的报警已批量标记为已处理')}>
              批量处理
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BellRing} label="报警总数" value={String(summary.total)} detail="当前专题周期累计记录" tone="sky" />
        <StatCard icon={AlertTriangle} label="未处理报警" value={String(summary.pending)} detail="需进入详情抽屉核查建议动作" tone="amber" />
        <StatCard icon={ShieldAlert} label="高等级报警" value={String(summary.high)} detail="重点关注复水延迟与排放异常" tone="rose" />
        <StatCard icon={BellRing} label="设备通讯类" value={String(summary.device)} detail="链路与供电状态需同步排查" tone="indigo" />
      </div>

      <div className="flex flex-col gap-3">
        <Tabs items={alertsPageData.categories} value={category} onChange={setCategory} />
        <Tabs items={levelTabs} value={level} onChange={setLevel} className="w-fit" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="报警表格" subtitle="显示报警时间、小区编号、处理组合、类型、等级、当前值、阈值与建议动作。" icon={AlertTriangle}>
          <div className="overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-4">报警时间</th>
                  <th className="px-4 py-4">小区</th>
                  <th className="px-4 py-4">处理组合</th>
                  <th className="px-4 py-4">报警类型</th>
                  <th className="px-4 py-4">等级</th>
                  <th className="px-4 py-4">当前值</th>
                  <th className="px-4 py-4">阈值</th>
                  <th className="px-4 py-4">持续时长</th>
                  <th className="px-4 py-4">处理状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={[
                      'cursor-pointer text-sm text-slate-700 transition-colors hover:bg-slate-50',
                      selectedRow?.id === row.id ? 'bg-sky-50/60' : '',
                    ].join(' ')}
                  >
                    <td className="whitespace-nowrap px-4 py-4">{row.time}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{row.plot}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.combination}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.type}</td>
                    <td className="px-4 py-4"><StatusBadge tone={row.level === '高' ? 'rose' : row.level === '中' ? 'amber' : 'slate'}>{row.level}</StatusBadge></td>
                    <td className="whitespace-nowrap px-4 py-4">{row.currentValue}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.threshold}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.duration}</td>
                    <td className="px-4 py-4"><StatusBadge>{row.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="报警详情抽屉" subtitle="建议动作栏、状态切换与科研语境下的处理说明集中展示。" icon={ShieldAlert}>
          {selectedRow ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{selectedRow.id}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedRow.type}</h3>
                  </div>
                  <StatusBadge tone={selectedRow.level === '高' ? 'rose' : selectedRow.level === '中' ? 'amber' : 'slate'}>{selectedRow.level}等级</StatusBadge>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4"><span>报警时间</span><span className="font-semibold text-slate-900">{selectedRow.time}</span></div>
                  <div className="flex justify-between gap-4"><span>小区编号</span><span className="font-semibold text-slate-900">{selectedRow.plot}</span></div>
                  <div className="flex justify-between gap-4"><span>处理组合</span><span className="font-semibold text-slate-900">{selectedRow.combination}</span></div>
                  <div className="flex justify-between gap-4"><span>当前值</span><span className="font-semibold text-slate-900">{selectedRow.currentValue}</span></div>
                  <div className="flex justify-between gap-4"><span>阈值</span><span className="font-semibold text-slate-900">{selectedRow.threshold}</span></div>
                  <div className="flex justify-between gap-4"><span>持续时长</span><span className="font-semibold text-slate-900">{selectedRow.duration}</span></div>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5">
                <p className="text-sm font-semibold text-amber-900">建议动作</p>
                <p className="mt-3 text-sm leading-7 text-amber-900">{selectedRow.suggestion}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => updateStatus('未处理')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  标记未处理
                </button>
                <button type="button" onClick={() => updateStatus('已处理')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                  标记已处理
                </button>
                <button type="button" onClick={() => updateStatus('已忽略')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">
                  标记已忽略
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              当前筛选条件下没有报警。
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
