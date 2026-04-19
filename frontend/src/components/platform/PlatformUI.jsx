import { ChevronRight, MoveRight } from 'lucide-react';

const toneMap = {
  slate: {
    soft: 'from-slate-100 to-white',
    text: 'text-slate-700',
    accent: 'text-slate-900',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    ring: 'ring-slate-200',
    fill: '#64748b',
    muted: '#cbd5e1',
  },
  indigo: {
    soft: 'from-indigo-100 via-blue-50 to-white',
    text: 'text-indigo-700',
    accent: 'text-indigo-950',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    ring: 'ring-indigo-200',
    fill: '#4f46e5',
    muted: '#c7d2fe',
  },
  sky: {
    soft: 'from-sky-100 via-cyan-50 to-white',
    text: 'text-sky-700',
    accent: 'text-sky-950',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    ring: 'ring-sky-200',
    fill: '#0ea5e9',
    muted: '#bae6fd',
  },
  emerald: {
    soft: 'from-emerald-100 via-green-50 to-white',
    text: 'text-emerald-700',
    accent: 'text-emerald-950',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    ring: 'ring-emerald-200',
    fill: '#10b981',
    muted: '#bbf7d0',
  },
  teal: {
    soft: 'from-teal-100 via-cyan-50 to-white',
    text: 'text-teal-700',
    accent: 'text-teal-950',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    ring: 'ring-teal-200',
    fill: '#0f766e',
    muted: '#99f6e4',
  },
  amber: {
    soft: 'from-amber-100 via-orange-50 to-white',
    text: 'text-amber-700',
    accent: 'text-amber-950',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-200',
    fill: '#d97706',
    muted: '#fde68a',
  },
  rose: {
    soft: 'from-rose-100 via-red-50 to-white',
    text: 'text-rose-700',
    accent: 'text-rose-950',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-200',
    fill: '#e11d48',
    muted: '#fecdd3',
  },
  violet: {
    soft: 'from-violet-100 via-fuchsia-50 to-white',
    text: 'text-violet-700',
    accent: 'text-violet-950',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-200',
    fill: '#8b5cf6',
    muted: '#ddd6fe',
  },
};

function getTone(tone = 'slate') {
  return toneMap[tone] ?? toneMap.slate;
}

function getStatusTone(status) {
  if (['正常', '稳定', '已处理', '已接收', '在线', '可用', '通过'].includes(status)) return 'emerald';
  if (['预警', '弱信号', '待复检', '已规划', '排队中', '分析中', '待回填', '未处理', '当前'].includes(status)) return 'amber';
  if (['离线', '异常', '高', '失败'].includes(status)) return 'rose';
  if (['关键窗口中', '主—再关键期', '内测', '已忽略'].includes(status)) return 'violet';
  return 'slate';
}

function buildChartGeometry(series, width, height, padding = { top: 18, right: 20, bottom: 30, left: 16 }) {
  const values = series.flatMap((item) => item.values);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const safeRange = maxValue - minValue || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const scaleX = (index, length) => padding.left + (chartWidth * index) / Math.max(length - 1, 1);
  const scaleY = (value) => padding.top + chartHeight - ((value - minValue) / safeRange) * chartHeight;

  return {
    minValue,
    maxValue,
    chartWidth,
    chartHeight,
    padding,
    scaleX,
    scaleY,
  };
}

function buildLinePath(values, scaleX, scaleY) {
  return values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${scaleX(index, values.length)} ${scaleY(value)}`)
    .join(' ');
}

function buildAreaPath(values, scaleX, scaleY, baseline) {
  const head = buildLinePath(values, scaleX, scaleY);
  const tail = `L ${scaleX(values.length - 1, values.length)} ${baseline} L ${scaleX(0, values.length)} ${baseline} Z`;
  return `${head} ${tail}`;
}

export function StatusBadge({ tone, children, className = '' }) {
  const style = getTone(tone ?? getStatusTone(children));
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style.badge} ${className}`}>{children}</span>;
}

export function PageIntro({ eyebrow, title, description, tags = [], actions, children }) {
  return (
    <section className="gm-panel p-5 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-5xl">
          {eyebrow ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone="sky">{eyebrow}</StatusBadge>
              {tags.map((tag) => (
                <StatusBadge key={tag} tone="slate">
                  {tag}
                </StatusBadge>
              ))}
            </div>
          ) : tags.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <StatusBadge key={tag} tone="slate">
                  {tag}
                </StatusBadge>
              ))}
            </div>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-[1.75rem]">{title}</h1>
          {description ? <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4 border-t border-slate-200/80 pt-4">{children}</div> : null}
    </section>
  );
}

export function Panel({ title, subtitle, icon: Icon, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`gm-panel p-5 lg:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <div className="flex items-center gap-2">
                {Icon ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-visible">
                    <Icon size={17} strokeWidth={2.1} className="text-sky-700" />
                  </span>
                ) : null}
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              </div>
            ) : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, detail, tone = 'slate', trend }) {
  const style = getTone(tone);

  return (
    <div className={`rounded-[24px] border ${style.border} bg-gradient-to-br ${style.soft} p-4 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.4)]`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 flex items-end gap-3">
            <span className={`text-[1.8rem] font-semibold leading-none ${style.accent}`}>{value}</span>
            {trend ? <span className={`mb-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}>{trend}</span> : null}
          </div>
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${style.border} bg-white/80 ${style.text}`}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-xs leading-6 text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function MiniTrend({ values, tone = 'sky', frameless = false, className = '' }) {
  const width = 132;
  const height = frameless ? 56 : 48;
  const style = getTone(tone);
  const geometry = buildChartGeometry([{ values }], width, height, { top: 6, right: 3, bottom: 4, left: 3 });
  const path = buildLinePath(values, geometry.scaleX, geometry.scaleY);
  const areaPath = buildAreaPath(values, geometry.scaleX, geometry.scaleY, height - 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${frameless ? 'h-16' : 'h-14'} ${className}`}>
      {frameless ? (
        <>
          <line x1="4" y1="18" x2={width - 4} y2="18" stroke={style.muted} strokeOpacity="0.35" strokeDasharray="3 5" />
          <line x1="4" y1="36" x2={width - 4} y2="36" stroke={style.muted} strokeOpacity="0.22" strokeDasharray="3 5" />
        </>
      ) : null}
      <path d={areaPath} fill={style.muted} opacity="0.28" />
      <path d={path} fill="none" stroke={style.fill} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricTile({ label, value, unit, status, tone = 'slate', trend, series, variant = 'default' }) {
  const style = getTone(tone);
  const isSquare = variant === 'square';

  return (
    <div
      className={[
        `group relative overflow-hidden rounded-[24px] border ${style.border} bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-32px_rgba(15,23,42,0.42)]`,
        isSquare ? 'min-h-[208px] p-3.5' : 'p-4 lg:p-4.5',
      ].join(' ')}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.soft} opacity-70`} />
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-white/55 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/55 to-transparent" />
      <div className={`relative h-full ${isSquare ? 'grid grid-rows-[auto_minmax(0,1fr)_auto]' : 'flex flex-col'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`${isSquare ? 'text-[13px]' : 'text-sm'} font-semibold tracking-tight text-slate-600`}>{label}</p>
            <div className={isSquare ? 'mt-2.5' : 'mt-3'}>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className={`${isSquare ? 'text-[1.75rem]' : 'text-[2rem]'} font-semibold leading-none tracking-tight text-slate-950`}>{value}</span>
                {unit ? <span className={`${isSquare ? 'text-[0.72rem]' : 'text-[0.78rem]'} whitespace-nowrap font-medium text-slate-500`}>{unit}</span> : null}
              </div>
            </div>
          </div>
          <StatusBadge tone={getStatusTone(status)} className="whitespace-nowrap px-2.5 py-1 text-[11px] leading-none">
            {status}
          </StatusBadge>
        </div>

        <div className={`${isSquare ? 'mt-2.5 flex min-h-[3rem] items-end' : 'mt-3 h-16 flex items-end'}`}>
          {series?.length ? <MiniTrend values={series} tone={tone} frameless className="translate-y-1" /> : null}
        </div>

        <div className={`${isSquare ? 'mt-2 flex min-h-[20px] items-center gap-2' : 'mt-3 flex items-center gap-2'}`}>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: style.fill }} />
          <p className={`${isSquare ? 'text-[11px] leading-none' : 'text-[12px] leading-5'} truncate text-slate-500`}>{trend}</p>
        </div>
      </div>
    </div>
  );
}

export function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white/90 p-1 ${className}`}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={[
            'rounded-full px-4 py-2 text-sm font-medium transition-all',
            value === item ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
          ].join(' ')}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function LineChartPanel({ labels, series, markers = [], height = 258, showLegend = true }) {
  const width = 760;
  const geometry = buildChartGeometry(series, width, height);
  const baseline = height - geometry.padding.bottom;

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950/[0.02] p-4">
      {showLegend ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {series.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = geometry.padding.top + (geometry.chartHeight / 3) * lineIndex;
          return <line key={lineIndex} x1={geometry.padding.left} y1={y} x2={width - geometry.padding.right} y2={y} stroke="#d7e1ee" strokeDasharray="3 6" />;
        })}

        {markers.map((marker) => {
          const x = geometry.scaleX(marker.index, labels.length);
          return (
            <g key={`${marker.label}-${marker.index}`}>
              <line x1={x} y1={geometry.padding.top} x2={x} y2={baseline} stroke="#94a3b8" strokeDasharray="4 6" />
              <rect x={x - 26} y={8} width="52" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" />
              <text x={x} y={21} textAnchor="middle" fontSize="10" fill="#334155">
                {marker.label}
              </text>
            </g>
          );
        })}

        {series.map((item) => (
          <path
            key={`area-${item.label}`}
            d={buildAreaPath(item.values, geometry.scaleX, geometry.scaleY, baseline)}
            fill={item.color}
            opacity="0.08"
          />
        ))}

        {series.map((item) => (
          <path
            key={item.label}
            d={buildLinePath(item.values, geometry.scaleX, geometry.scaleY)}
            fill="none"
            stroke={item.color}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {series.map((item) =>
          item.values.map((point, index) => (
            <circle
              key={`${item.label}-${index}`}
              cx={geometry.scaleX(index, item.values.length)}
              cy={geometry.scaleY(point)}
              r="3.2"
              fill={item.color}
              stroke="#fff"
              strokeWidth="1.5"
            />
          )),
        )}

        {labels.map((label, index) => (
          <text
            key={label}
            x={geometry.scaleX(index, labels.length)}
            y={height - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#64748b"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function HeatMatrix({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200">
      <div className="min-w-[600px]">
      <div className="grid bg-slate-100 text-xs font-semibold text-slate-600" style={{ gridTemplateColumns: `180px repeat(${columns.length}, minmax(0, 1fr))` }}>
        <div className="px-4 py-3">指标</div>
        {columns.map((column) => (
          <div key={column} className="border-l border-white/70 px-4 py-3 text-center">
            {column}
          </div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.label} className="grid" style={{ gridTemplateColumns: `180px repeat(${columns.length}, minmax(0, 1fr))` }}>
          <div className="border-t border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700">{row.label}</div>
          {row.values.map((value, index) => {
            const alpha = Math.min(0.85, Math.max(0.12, value));
            return (
              <div
                key={`${row.label}-${columns[index]}`}
                className="border-l border-t border-slate-200 px-2 py-4 text-center text-sm font-semibold text-slate-900"
                style={{ backgroundColor: `rgba(14, 165, 233, ${alpha})` }}
              >
                {Math.round(value * 100)}
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </div>
  );
}

export function Timeline({ items, compact = false, showSegmentDurations = false, showNotes = true }) {
  return (
    <div className={`overflow-x-auto pb-2 md:overflow-visible ${showSegmentDurations ? 'pt-7' : 'pt-2'}`}>
      <div
        className={`grid min-w-max px-0 md:min-w-0 md:w-full ${compact ? 'gap-3 md:gap-2' : 'gap-0 md:gap-0'}`}
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
      {items.map((item, index) => {
        const isDone = item.status === 'done';
        const isCurrent = item.status === 'current';
        const isUpcoming = item.status === 'upcoming';
        const previousItem = items[index - 1];
        const dotClass = isCurrent
          ? 'border-4 border-emerald-200 bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
          : isDone
            ? 'border-4 border-white bg-emerald-600'
            : isUpcoming
              ? 'border-4 border-white bg-amber-400'
              : 'border-4 border-white bg-slate-300';
        const textClass = isCurrent ? 'text-emerald-800' : isDone ? 'text-slate-800' : 'text-slate-500';
        const leftLineClass =
          index === 0
            ? ''
            : previousItem?.status === 'done'
              ? 'bg-emerald-600'
              : previousItem?.status === 'current'
                ? 'bg-emerald-200'
                : 'bg-slate-200';
        const rightLineClass = isDone ? 'bg-emerald-600' : isCurrent ? 'bg-emerald-200' : 'bg-slate-200';

        return (
          <div key={item.key} className={`${compact ? 'min-w-[92px] md:min-w-0' : 'min-w-[138px] md:min-w-0'}`}>
            <div className={`relative ${showSegmentDurations ? 'h-8' : 'h-6'}`}>
              {showSegmentDurations && item.durationToNext ? (
                <div className="absolute right-0 top-0 z-20 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold leading-none text-slate-500">
                  {item.durationToNext}
                </div>
              ) : null}
              {index > 0 ? <div className={`absolute left-0 right-1/2 top-1/2 h-1 -translate-y-1/2 rounded-full ${leftLineClass}`} /> : null}
              {index < items.length - 1 ? <div className={`absolute left-1/2 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full ${rightLineClass}`} /> : null}
              {isCurrent ? (
                <div className="gm-node-breath absolute left-1/2 top-1/2 z-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/40" />
              ) : null}
              <div className={`absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass}`} />
            </div>
            <div className={`${compact ? 'pt-3 px-1 md:px-2 text-center' : 'pt-3 px-1 md:px-2'} ${showSegmentDurations ? 'text-center' : ''}`}>
              {item.date ? <p className="text-[11px] font-medium leading-5 text-slate-400">{item.date}</p> : null}
              <h3 className={`mt-1 text-sm font-semibold ${textClass}`}>{item.label}</h3>
              {showNotes && item.duration ? <p className="mt-2 text-xs font-medium leading-5 text-slate-700">{item.duration}</p> : null}
              {showNotes && item.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p> : null}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

export function PlotMatrix({ groups, onPlotClick, compact = false }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.code} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <StatusBadge tone={group.tone}>{group.label}</StatusBadge>
              <p className="text-sm text-slate-500">{group.description}</p>
            </div>
            <p className="text-xs font-medium text-slate-500">按品种 G1 / G2 与重复 R1~R4 编排</p>
          </div>

          <div className={`grid gap-3 ${compact ? 'xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
            {group.plots.map((plot) => {
              const tone = getTone(plot.tone);

              return (
                <button
                  key={plot.id}
                  type="button"
                  onClick={() => onPlotClick?.(plot)}
                  className={`rounded-[20px] border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${tone.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{plot.plotCode}</p>
                      <p className="mt-1 text-xs text-slate-500">{plot.treatment} · {plot.variety} · R{plot.repeat}</p>
                    </div>
                    <StatusBadge tone={plot.online ? plot.alertCount > 0 ? 'amber' : 'emerald' : 'rose'}>
                      {plot.online ? `${plot.alertCount} 报警` : '离线'}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p>田面水位</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{plot.waterLevel} cm</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p>土壤张力</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{plot.tension} kPa</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge tone={plot.tone}>{plot.phase}</StatusBadge>
                    <StatusBadge tone={plot.status === '关键窗口中' ? 'violet' : plot.status === '复水后' ? 'sky' : plot.status === '落干中' ? 'amber' : 'slate'}>
                      {plot.status}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{plot.areaType}</span>
                    <span>{plot.lastReport}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressStrip({ label, progress, detail, tone = 'sky' }) {
  const style = getTone(tone);

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>{progress}%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: style.fill }} />
      </div>
    </div>
  );
}

export function ActionButton({ children, onClick, variant = 'primary' }) {
  const className =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : variant === 'secondary'
        ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
        : 'bg-sky-50 text-sky-700 hover:bg-sky-100';

  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${className}`}>
      {children}
      <ChevronRight size={15} />
    </button>
  );
}
