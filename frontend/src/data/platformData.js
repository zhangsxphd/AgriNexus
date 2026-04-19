const treatmentPalette = {
  W0: { tone: 'sky', label: 'W0 浅湿交替', description: '窗口期保持浅水至轻落干' },
  W1: { tone: 'teal', label: 'W1 中度控水', description: '依据土壤张力触发复水' },
  W2: { tone: 'amber', label: 'W2 强化落干', description: '关键节点执行延迟复水' },
};

const varietyLabels = {
  G1: 'G1 南粳9108',
  G2: 'G2 甬优1540',
};

const zoneTypes = ['原位观测区', '产量评估区', '破坏性取样区'];
const windowNodes = ['T-10', 'T-7', 'T-3', 'T0', 'T+1', 'T+3', 'T+7', 'T+15', 'E1', 'E2'];

function buildTrend(base, step, variance = 0.6, count = 8) {
  return Array.from({ length: count }, (_, index) =>
    Number((base + step * index + ((index % 2 === 0 ? 1 : -1) * variance)).toFixed(1)),
  );
}

export const experimentPlots = ['W0', 'W1', 'W2'].flatMap((treatment, treatmentIndex) =>
  ['G1', 'G2'].flatMap((variety, varietyIndex) =>
    Array.from({ length: 4 }, (_, repeatIndex) => {
      const index = treatmentIndex * 8 + varietyIndex * 4 + repeatIndex;
      const plotId = `P${String(index + 1).padStart(2, '0')}`;
      const isOffline = index === 5 || index === 18;
      const alertCount = isOffline ? 2 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
      const status = isOffline
        ? '离线'
        : treatment === 'W2' && repeatIndex >= 2
          ? '落干中'
          : treatment === 'W1' && repeatIndex === 1
            ? '关键窗口中'
            : treatment === 'W0' && repeatIndex === 3
              ? '复水后'
              : alertCount > 0
                ? '预警'
                : '正常';

      return {
        id: plotId,
        title: `${plotId} · ${treatment}/${variety}/R${repeatIndex + 1}`,
        plotCode: plotId,
        treatment,
        variety,
        repeat: repeatIndex + 1,
        areaType: zoneTypes[(index + treatmentIndex) % zoneTypes.length],
        status,
        tone: treatmentPalette[treatment].tone,
        online: !isOffline,
        waterLevel: Number((1.8 - treatmentIndex * 1.2 - repeatIndex * 0.3).toFixed(1)),
        tension: Number((-12 - treatmentIndex * 11 - repeatIndex * 2.5).toFixed(1)),
        alertCount,
        battery: Number((4.08 - index * 0.02).toFixed(2)),
        lora: isOffline ? -121 : -84 - repeatIndex * 5 - treatmentIndex * 3,
        phase: index % 4 === 0 ? '主季收割前' : index % 4 === 1 ? '主—再关键期' : index % 4 === 2 ? '复水后' : '再生季启动',
        windowLabel: windowNodes[(index + 2) % windowNodes.length],
        lastReport: isOffline ? '16 分钟前' : `${2 + (index % 5)} 分钟前`,
      };
    }),
  ),
);

export const treatmentGroups = Object.entries(treatmentPalette).map(([code, meta]) => ({
  code,
  ...meta,
  plots: experimentPlots.filter((plot) => plot.treatment === code),
}));

export const dashboardData = {
  statusLabel: '灌浆成熟 · T-3',
  headline: {
    eyebrow: '全生育期连续监测与试验运行总控',
    title: '田智枢 AgriNexus 全生育期田间试验监测与决策平台',
    description:
      '面向田间科研试验的专业底座，聚合连续物联网监测、试验执行、关键窗口预警与科研分析，用于支撑再生稻主—再关键期水分调控专题及后续通用扩展。',
    tags: ['2026 年早季', '24 个独立小区', '裂区设计', '主—再关键期已激活'],
  },
  kpis: [
    { key: 'plots', label: '当前在线小区数', value: '22 / 24', detail: '2 个小区待恢复链路', tone: 'emerald', trend: '+1' },
    { key: 'devices', label: '在线设备数', value: '68', detail: 'LoRa 节点 24 / 网关 3 / 传感器 41', tone: 'indigo', trend: '+3' },
    { key: 'reports', label: '今日有效上报次数', value: '8,432', detail: '较昨日提升 6.4%', tone: 'sky', trend: '+6.4%' },
    { key: 'alerts', label: '今日报警数', value: '17', detail: '未处理 6 条', tone: 'amber', trend: '-2' },
    { key: 'risks', label: '当前高风险小区数', value: '4', detail: '集中在 W2 落干后段', tone: 'rose', trend: '+1' },
    { key: 'phase', label: '当前生育阶段', value: '灌浆成熟', detail: '距主季收割 3 天', tone: 'teal', trend: 'T-3' },
    { key: 'runtime', label: '平台运行状态', value: '稳定', detail: '近 7 日可用性 99.4%', tone: 'slate', trend: '99.4%' },
    { key: 'windowPlots', label: '处于关键窗口的小区', value: '12', detail: '其中复水阶段 5 个', tone: 'violet', trend: '+2' },
    { key: 'dryingPlots', label: '落干阶段小区数', value: '7', detail: '张力控制由规则集接管', tone: 'amber', trend: '阈值中' },
    { key: 'rewaterPlots', label: '复水阶段小区数', value: '5', detail: '平均恢复时间 18.6 h', tone: 'sky', trend: '-1.3 h' },
  ],
  liveMetrics: [
    { label: '田面水位', value: '-1.8', unit: 'cm', tone: 'sky', status: '正常', trend: '较昨日 -0.4', series: buildTrend(-0.6, -0.14, 0.2) },
    { label: '土壤张力', value: '-32', unit: 'kPa', tone: 'teal', status: '预警', trend: '接近 W2 下限', series: buildTrend(-18, -2.4, 1.4) },
    { label: '空气温度', value: '29.6', unit: '°C', tone: 'amber', status: '正常', trend: '日间缓升', series: buildTrend(24, 0.75, 0.4) },
    { label: '空气湿度', value: '78', unit: '%', tone: 'emerald', status: '正常', trend: '午后回落', series: buildTrend(84, -1.2, 0.8) },
    { label: 'CO₂', value: '512', unit: 'ppm', tone: 'slate', status: '正常', trend: '近 3 h 稳定', series: buildTrend(480, 4.2, 7) },
    { label: 'PAR', value: '1368', unit: 'μmol·m⁻²·s⁻¹', tone: 'amber', status: '正常', trend: '峰值窗口', series: buildTrend(860, 62, 35) },
    { label: '光照', value: '74.2', unit: 'klx', tone: 'sky', status: '正常', trend: '云量轻微干扰', series: buildTrend(52, 2.8, 1.2) },
    { label: '风速', value: '1.8', unit: 'm/s', tone: 'slate', status: '正常', trend: '低风速', series: buildTrend(1.2, 0.08, 0.15) },
    { label: '降雨', value: '3.2', unit: 'mm', tone: 'sky', status: '正常', trend: '上午阵雨', series: [0, 0.6, 0.2, 1.1, 0.4, 0.5, 0.2, 0.2] },
    { label: '冠层温度', value: '31.3', unit: '°C', tone: 'amber', status: '预警', trend: '高于空气温度 1.7', series: buildTrend(26.8, 0.55, 0.3) },
    { label: '水温', value: '26.1', unit: '°C', tone: 'sky', status: '正常', trend: '平稳', series: buildTrend(24.2, 0.24, 0.18) },
    { label: '地温', value: '27.4', unit: '°C', tone: 'teal', status: '正常', trend: '5/10/20 cm 已对齐', series: buildTrend(25.6, 0.18, 0.16) },
    { label: '土壤 EC', value: '1.42', unit: 'mS/cm', tone: 'emerald', status: '正常', trend: '轻微下降', series: buildTrend(1.52, -0.02, 0.03) },
    { label: '土壤 pH', value: '6.48', unit: '', tone: 'slate', status: '正常', trend: '稳定', series: buildTrend(6.4, 0.01, 0.02) },
    { label: '电池电压', value: '4.06', unit: 'V', tone: 'indigo', status: '正常', trend: '主网关供电稳定', series: buildTrend(4.12, -0.01, 0.02) },
    { label: 'LoRa 信号', value: '-91', unit: 'dBm', tone: 'indigo', status: '预警', trend: 'P06 / P19 偏弱', series: buildTrend(-86, -0.9, 1.5) },
    { label: '电磁阀状态', value: '5 / 8 开启', unit: '', tone: 'violet', status: '正常', trend: '执行计划中', series: [1, 2, 3, 5, 5, 4, 5, 5] },
  ],
  seasonCharts: {
    stageLabels: ['移栽', '分蘖', '拔节', '孕穗', '抽穗扬花', '灌浆', '成熟', '主季收割', '复水', '再生季启动'],
    waterLevel: [
      { label: 'W0', color: '#4da8ff', values: [3.2, 2.8, 2.1, 1.7, 1.2, 0.6, -0.2, -0.8, 2.4, 1.6] },
      { label: 'W1', color: '#0f766e', values: [2.6, 2.1, 1.4, 0.9, 0.2, -0.8, -1.6, -2.6, 1.7, 1.1] },
      { label: 'W2', color: '#d97706', values: [2.4, 1.8, 1.1, 0.2, -1.1, -2.4, -3.8, -4.6, 1.1, 0.8] },
    ],
    tension: [
      { label: 'W0', color: '#60a5fa', values: [-8, -9, -11, -14, -16, -18, -20, -24, -12, -10] },
      { label: 'W1', color: '#14b8a6', values: [-9, -12, -17, -21, -26, -31, -35, -38, -16, -13] },
      { label: 'W2', color: '#f59e0b', values: [-10, -14, -19, -27, -33, -41, -48, -53, -19, -16] },
    ],
    atmosphere: [
      { label: '空气温度', color: '#f97316', values: [21, 23, 25, 28, 31, 29, 27, 28, 27, 26] },
      { label: '空气湿度', color: '#10b981', values: [88, 84, 82, 78, 76, 80, 86, 79, 83, 85] },
      { label: 'CO₂', color: '#64748b', values: [468, 471, 482, 496, 522, 536, 514, 501, 490, 485] },
    ],
    radiation: [
      { label: 'PAR', color: '#ca8a04', values: [620, 740, 820, 980, 1220, 1310, 1180, 1095, 940, 900] },
      { label: '冠层温度', color: '#9333ea', values: [22, 24, 26, 28, 31, 32, 30, 29, 28, 27] },
    ],
    rainfall: [
      { label: '降雨', color: '#2563eb', values: [12, 4, 0, 0, 6, 2, 15, 0, 0, 0] },
      { label: '水位响应', color: '#0891b2', values: [3.3, 2.9, 2.2, 1.6, 1.4, 0.6, 2.8, -1.4, 2.1, 1.5] },
    ],
    markers: [
      { index: 4, label: '追肥' },
      { index: 7, label: '主季收割' },
      { index: 8, label: '复水' },
      { index: 9, label: '再生肥' },
    ],
  },
  alerts: [
    { id: 'A-17', level: '高', plot: 'P19', type: '复水延迟', detail: 'W2/G1/R3 复水延迟 6.5 h，张力降至 -51 kPa', recommendation: '建议立即启动复水并核查阀门状态。' },
    { id: 'A-12', level: '中', plot: 'P06', type: 'LoRa 弱信号', detail: 'P06 RSSI 降至 -121 dBm，存在缓存堆积风险', recommendation: '建议检查节点天线朝向与供电。' },
    { id: 'A-09', level: '中', plot: 'P08', type: '张力超阈', detail: 'W0/G2/R4 土壤张力连续 3 h 高于预设上限', recommendation: '建议核查张力计与小区边界渗漏。' },
    { id: 'A-03', level: '低', plot: 'P14', type: '样品未回填', detail: 'E1 根际土 DOC 数据尚未录入实验室结果', recommendation: '建议补录离线分析结果。' },
  ],
  decisions: [
    { id: 'D-02', title: '建议启动复水', confidence: '0.93', plotScope: 'W2 组 3 个小区', summary: '根据张力阈值偏离程度与当前天气预报，建议在 40 分钟内完成复水。' },
    { id: 'D-08', title: '建议检查张力计', confidence: '0.87', plotScope: 'P08', summary: '张力曲线与水位曲线联动关系异常，疑似传感器漂移。' },
    { id: 'D-11', title: '建议补录关键节点调查数据', confidence: '0.78', plotScope: 'E1 / E2 事件样本', summary: '3 份留桩高度记录缺失，会影响专题页的芽启动比较。' },
  ],
  fullSeasonTimeline: [
    { key: 'sowing', label: '播种', date: '02/22', durationToNext: '10 天', status: 'done', note: '育秧与返青起始阶段' },
    { key: 'tillering', label: '分蘖', date: '03/04', durationToNext: '15 天', status: 'done', note: '群体建成已完成' },
    { key: 'jointing', label: '孕穗', date: '03/19', durationToNext: '11 天', status: 'done', note: '拔节孕穗阶段已完成' },
    { key: 'heading', label: '抽穗', date: '03/30', durationToNext: '14 天', status: 'done', note: '抽穗扬花阶段已完成' },
    { key: 'filling', label: '灌浆', date: '04/13', durationToNext: '9 天', status: 'current', note: '当前生育阶段' },
    { key: 'harvest', label: '主季收割', date: '04/22', durationToNext: '1 天', status: 'upcoming', note: '距当前还有 3 天' },
    { key: 'ratoon-grow', label: '再生季生长', date: '04/23', durationToNext: '47 天', status: 'future', note: '复水后进入再生季' },
    { key: 'ratoon-harvest', label: '再生季收获', date: '06/09', status: 'future', note: '后续收获窗口' },
  ],
  keyWindowTimeline: [
    { key: 't-10', label: 'T-10', status: 'done' },
    { key: 't-7', label: 'T-7', status: 'done' },
    { key: 't-3', label: 'T-3', status: 'current' },
    { key: 't0', label: 'T0', status: 'upcoming' },
    { key: 't1', label: 'T+1', status: 'future' },
    { key: 't3', label: 'T+3', status: 'future' },
    { key: 't7', label: 'T+7', status: 'future' },
    { key: 't15', label: 'T+15', status: 'future' },
    { key: 'e1', label: 'E1', status: 'future' },
    { key: 'e2', label: 'E2', status: 'future' },
  ],
  windowStatus: {
    showTimeline: true,
    headline: '主—再关键期已激活',
    nextEvent: '距离复水批量执行还有 1 天 14 小时',
    risks: ['4 个小区存在过干风险', '2 个小区样品回填滞后', '1 个网关链路需重点巡检'],
    counts: [
      { label: '关键窗口小区', value: 12 },
      { label: 'T0 当日小区', value: 4 },
      { label: 'T+3 小区', value: 3 },
      { label: 'E1 采样待完成', value: 2 },
    ],
  },
};

export const monitoringData = {
  header: {
    plotCode: 'P14',
    title: 'P14 · W1 / G2 / R2',
    location: '南区 2 号田带 · 原位观测区',
    stage: '主—再关键期',
    windowDay: 'T+3',
    lastReport: '2026-04-17 10:42',
    badges: ['正常', '复水后', '关键窗口中'],
  },
  tabs: ['整季过程', '关键窗口', '田间记录', '科研样品'],
  seasonMetrics: [
    { label: '田面水位', value: '1.2', unit: 'cm', status: '正常', tone: 'sky', trend: '较昨夜回升 0.3', series: buildTrend(1.8, -0.08, 0.16) },
    { label: '土壤张力', value: '-24', unit: 'kPa', status: '正常', tone: 'teal', trend: '处于 W1 安全带', series: buildTrend(-18, -0.8, 1.1) },
    { label: '水温', value: '26.2', unit: '°C', status: '正常', tone: 'sky', trend: '复水后趋于平稳', series: buildTrend(24.4, 0.2, 0.12) },
    { label: '地温', value: '27.8', unit: '°C', status: '正常', tone: 'amber', trend: '单探头稳定', series: buildTrend(26.1, 0.18, 0.15) },
    { label: '空气温度', value: '29.4', unit: '°C', status: '正常', tone: 'amber', trend: '午后热负荷偏高', series: buildTrend(24.6, 0.72, 0.3) },
    { label: '空气湿度', value: '76', unit: '%', status: '正常', tone: 'emerald', trend: '午后持续回落', series: buildTrend(83, -1.1, 0.5) },
    { label: 'CO₂', value: '526', unit: 'ppm', status: '正常', tone: 'slate', trend: '冠层交换稳定', series: buildTrend(480, 5, 4) },
    { label: 'PAR', value: '1280', unit: 'μmol·m⁻²·s⁻¹', status: '正常', tone: 'amber', trend: '接近日峰值段', series: buildTrend(880, 46, 28) },
    { label: '风速', value: '1.4', unit: 'm/s', status: '正常', tone: 'slate', trend: '低风速背景', series: buildTrend(1.1, 0.05, 0.1) },
    { label: '降雨', value: '2.4', unit: 'mm', status: '正常', tone: 'sky', trend: '清晨阵雨已停', series: [0.2, 0.4, 0, 0.7, 0.1, 0.4, 0.3, 0.3] },
    { label: 'pH', value: '6.52', unit: '', status: '正常', tone: 'slate', trend: '酸碱波动较小', series: buildTrend(6.4, 0.02, 0.03) },
    { label: 'EC', value: '1.38', unit: 'mS/cm', status: '正常', tone: 'emerald', trend: '盐分轻微回落', series: buildTrend(1.46, -0.02, 0.02) },
  ],
  deviceStatus: [
    { label: '节点在线状态', value: '在线 14 天 07:22', tone: 'emerald' },
    { label: 'LoRa 信号', value: '-89 dBm / SNR 8.6', tone: 'indigo' },
    { label: '电池状态', value: '4.02 V / 81%', tone: 'sky' },
    { label: '继电器状态', value: '阀门关闭 / 采样泵待命', tone: 'slate' },
    { label: '本地缓存状态', value: '12 条待上传', tone: 'amber' },
    { label: '最近心跳时间', value: '10:42:13', tone: 'slate' },
  ],
  seasonCharts: {
    labels: ['移栽', '分蘖', '拔节', '孕穗', '抽穗', '灌浆', '主季收割', '复水', '再生季启动'],
    waterAndTension: [
      { label: '田面水位', color: '#0ea5e9', values: [3.1, 2.8, 2.2, 1.6, 0.7, -0.2, -2.2, 1.4, 1.0] },
      { label: '土壤张力', color: '#0f766e', values: [-9, -11, -13, -18, -22, -28, -36, -15, -11] },
    ],
    atmosphere: [
      { label: '空气温度', color: '#f97316', values: [22, 24, 26, 29, 31, 30, 28, 27, 26] },
      { label: '空气湿度', color: '#10b981', values: [90, 86, 82, 79, 75, 77, 80, 83, 84] },
      { label: 'CO₂', color: '#475569', values: [466, 470, 482, 493, 508, 516, 502, 489, 480] },
    ],
    climate: [
      { label: 'PAR', color: '#ca8a04', values: [520, 680, 810, 1020, 1280, 1390, 1160, 940, 860] },
      { label: '风速', color: '#64748b', values: [1.1, 1.2, 1.4, 1.7, 1.5, 1.3, 1.6, 1.2, 1.1] },
      { label: '降雨', color: '#2563eb', values: [18, 6, 2, 0, 4, 7, 12, 2, 1] },
    ],
    markers: [
      { index: 3, label: '施肥' },
      { index: 6, label: '收割' },
      { index: 7, label: '复水' },
      { index: 8, label: 'E1' },
    ],
  },
  windowCharts: {
    labels: windowNodes,
    waterAndTension: [
      { label: '田面水位', color: '#0ea5e9', values: [2.1, 1.5, 0.2, -1.8, -2.1, 1.2, 2.4, 1.6, 1.4, 1.1] },
      { label: '土壤张力', color: '#0f766e', values: [-11, -16, -22, -34, -38, -18, -12, -10, -9, -8] },
    ],
    gasFlux: [
      { label: 'CH₄ 通量', color: '#8b5cf6', values: [2.8, 3.1, 3.6, 5.4, 7.2, 6.1, 4.3, 3.8, 3.2, 2.9] },
      { label: 'N₂O 通量', color: '#ec4899', values: [0.6, 0.8, 1.2, 2.4, 4.1, 3.5, 1.9, 1.2, 0.9, 0.7] },
    ],
    thresholdLines: ['W1 张力阈值 -30 kPa', 'W2 张力阈值 -45 kPa'],
    recommendations: [
      '当前处于 T+3，复湿后脉冲进入回落期，可安排 E1 对齐采样。',
      'CH₄ 通量仍高于窗口均值 17%，建议联动查看根际 DOC 回填结果。',
      '若 12 小时内张力回落至 -10 kPa 以下，可维持现有水位调控。 ',
    ],
  },
  keyWindowIndicators: [
    { label: '再生芽数', value: '26.4', unit: '株/m²', tone: 'emerald' },
    { label: '芽长', value: '3.8', unit: 'cm', tone: 'sky' },
    { label: '再生芽萌发率', value: '81.2', unit: '%', tone: 'teal' },
    { label: '存活残桩密度', value: '54.8', unit: '株/m²', tone: 'slate' },
    { label: '根鲜重', value: '18.4', unit: 'g/株', tone: 'amber' },
    { label: '根干重', value: '4.7', unit: 'g/株', tone: 'amber' },
    { label: '新白根比例', value: '33', unit: '%', tone: 'sky' },
    { label: '根系氧化力', value: '28.6', unit: 'μg/g', tone: 'violet' },
    { label: 'CH₄ 峰值', value: '7.2', unit: 'mg·m⁻²·h⁻¹', tone: 'violet' },
    { label: 'N₂O 峰值', value: '4.1', unit: 'mg·m⁻²·h⁻¹', tone: 'rose' },
    { label: 'CH₄累计排放', value: '18.6', unit: 'g/m²', tone: 'violet' },
    { label: 'N₂O累计排放', value: '2.8', unit: 'g/m²', tone: 'rose' },
  ],
  fieldRecords: [
    { date: '2026-09-01 07:20', type: '样方记录', person: '王博', detail: '成苗密度 28.6 万株/ha，倒伏率 2.1%' },
    { date: '2026-09-03 16:40', type: '巡田记录', person: '李建国', detail: '留桩高度均值 31.2 cm，变异系数 8.4%，边沟排水顺畅' },
    { date: '2026-09-04 13:10', type: '图片记录', person: '张秫瑄', detail: '主季收割后残桩照片已上传，共 9 张' },
    { date: '2026-09-07 08:30', type: '现场备注', person: '王博', detail: '复水后 3 h 见浅层水膜形成，根际未见异常气泡聚集' },
  ],
  samples: [
    { code: 'RS-P14-E1-01', type: '根际土样', time: 'T+7 09:15', status: '待回填', lab: 'DOC / NH4+-N / NO3--N' },
    { code: 'NRS-P14-E1-02', type: '非根际土样', time: 'T+7 09:20', status: '已接收', lab: '有效磷 / Eh / 酶活' },
    { code: 'PL-P14-E1-03', type: '植物样', time: 'T+7 09:30', status: '分析中', lab: '根鲜重 / 根干重 / 13C 丰度' },
    { code: 'GAS-P14-T3-04', type: '气体样', time: 'T+3 10:10', status: '已回填', lab: 'CH₄ / N₂O 通量' },
    { code: 'ISO-P14-E2-05', type: '13C样', time: 'E2 11:00', status: '排队中', lab: '碳分配路径' },
  ],
};

export const experimentPageData = {
  overview: {
    title: '2026 年再生稻主—再关键期水分调控试验',
    subtitle: '低桩机收稻田试验 · 江苏沿江稻作试验站',
    cards: [
      { label: '项目名称', value: '主—再关键期水分调控与再生响应' },
      { label: '年份', value: '2026' },
      { label: '季次', value: '早季 + 再生季' },
      { label: '试验站', value: '沿江再生稻综合观测试验站' },
      { label: '设计类型', value: '裂区设计' },
      { label: '处理数', value: '3 × 2' },
      { label: '小区数', value: '24' },
      { label: '当前阶段', value: '主—再关键期' },
      { label: '当前完成进度', value: '78%' },
    ],
  },
  eventCalendar: [
    { date: '04-12', title: '播种', status: 'completed', description: '完成基线田面水位标定与节点编号。' },
    { date: '05-28', title: '施肥', status: 'completed', description: '完成分蘖肥与传感器校准。' },
    { date: '09-04', title: '主季收割', status: 'current', description: '进入主—再关键期 T0。' },
    { date: '09-07', title: '复水', status: 'upcoming', description: '按 W0/W1/W2 处理执行复水策略。' },
    { date: '09-09', title: '高频监测启动', status: 'upcoming', description: '窗口期采样频率由 30 min 升级为 5 min。' },
    { date: '09-11', title: '根际采样', status: 'upcoming', description: '对齐 E1 事件窗口。' },
    { date: '09-14', title: '13C标记', status: 'planned', description: '开展上行/下行碳分配示踪。' },
    { date: '11-02', title: '产量调查', status: 'planned', description: '完成主季 + 再生季总产量核算。' },
  ],
  collectionPlans: [
    { label: '全生育期连续监测', progress: 92, detail: '24 小区连续运行，2 个节点需巡检。', tone: 'emerald' },
    { label: '节点观测任务', progress: 88, detail: '留桩高度、存活残桩密度已完成 21/24。', tone: 'sky' },
    { label: '高频窗口监测', progress: 74, detail: '5 min 高频采样计划已启动 12 个小区。', tone: 'amber' },
    { label: 'E1 / E2 事件对齐采样', progress: 61, detail: 'E1 完成 10/12，E2 待排程。', tone: 'violet' },
    { label: '样品计划与完成率', progress: 69, detail: '根际样和气体样入库正常，13C样尚有缺口。', tone: 'teal' },
  ],
  sampleBuckets: [
    { name: '根际土', total: 48, done: 35, pending: 13 },
    { name: '非根际土', total: 48, done: 37, pending: 11 },
    { name: '植物样', total: 72, done: 46, pending: 26 },
    { name: '气体样', total: 96, done: 74, pending: 22 },
    { name: '同位素样', total: 24, done: 8, pending: 16 },
    { name: '图片记录', total: 120, done: 98, pending: 22 },
  ],
  integrity: [
    { label: '缺失记录', value: 12, tone: 'amber', detail: '集中在 E1 调查表与 13C样登记。' },
    { label: '异常记录', value: 7, tone: 'rose', detail: '3 条张力异常、2 条 pH 漂移、2 条重复命名。' },
    { label: '掉线小区', value: 2, tone: 'slate', detail: 'P06、P19 需排查链路与电池。' },
    { label: '样品待回填', value: 28, tone: 'violet', detail: '实验室离线指标回填进度偏慢。' },
    { label: '节点未完成任务', value: 5, tone: 'sky', detail: '包括复水前阀门自检与地温校准。' },
  ],
  topicCard: {
    title: '主—再关键期专题',
    subtitle: '主季收割前后水分调控、芽启动、气体脉冲与碳分配响应',
    detail:
      '进入专题分析页后，可按处理、品种和关键窗口节点进行对比，查看水位—张力控制、再生芽启动、CH₄/N₂O 脉冲、根际功能与 13C 碳分配路径。',
  },
};

export const topicPageData = {
  filters: {
    treatments: ['全部处理', 'W0', 'W1', 'W2'],
    varieties: ['全部品种', 'G1', 'G2'],
    compareModes: ['处理对比', '品种对比', '小区对比'],
  },
  overviewCards: [
    { label: '关键窗口内小区', value: '12', detail: 'T-3 ~ T+15 已启动高频监测', tone: 'indigo' },
    { label: 'T0 当日小区数', value: '4', detail: '主季收割操作已完成', tone: 'sky' },
    { label: '排放异常风险', value: '3', detail: 'CH₄ / N₂O 脉冲需重点关注', tone: 'rose' },
    { label: '过干风险小区', value: '4', detail: '主要集中于 W2 处理', tone: 'amber' },
  ],
  nodeDistribution: [
    { label: 'T-3', value: 3, tone: 'sky' },
    { label: 'T0', value: 4, tone: 'slate' },
    { label: 'T+3', value: 3, tone: 'teal' },
    { label: 'T+7', value: 1, tone: 'violet' },
    { label: 'T+15', value: 1, tone: 'amber' },
  ],
  risks: [
    'W2/G1 两个小区存在过干持续时间过长。',
    'P19 复水恢复速度低于组均值 31%。',
    '1 个气体通量箱在割后脉冲采样中出现时钟偏移。',
  ],
  waterControl: {
    labels: windowNodes,
    levelSeries: [
      { label: 'W0 田面水位', color: '#4da8ff', values: [2.4, 2.1, 1.8, 1.2, 1.0, 2.2, 2.6, 2.1, 1.9, 1.6] },
      { label: 'W1 田面水位', color: '#0f766e', values: [2.1, 1.8, 1.2, -0.8, -1.4, 1.7, 2.2, 1.7, 1.4, 1.2] },
      { label: 'W2 田面水位', color: '#d97706', values: [1.8, 1.1, 0.4, -2.4, -3.1, 1.0, 1.9, 1.6, 1.3, 1.0] },
    ],
    tensionSeries: [
      { label: 'W0 张力', color: '#60a5fa', values: [-12, -15, -16, -18, -17, -12, -10, -9, -8, -8] },
      { label: 'W1 张力', color: '#14b8a6', values: [-14, -18, -24, -31, -34, -16, -12, -10, -9, -9] },
      { label: 'W2 张力', color: '#f59e0b', values: [-16, -24, -31, -43, -48, -18, -13, -11, -10, -10] },
    ],
    metrics: [
      { label: '落干持续时长', value: '42.6 h', tone: 'amber' },
      { label: '阈值触发频次', value: '18 次', tone: 'sky' },
      { label: '复水恢复速度', value: '1.7 cm/h', tone: 'teal' },
      { label: '张力达标率', value: '84%', tone: 'emerald' },
    ],
  },
  budStart: [
    { label: '再生芽萌发率', w0: 83.6, w1: 88.9, w2: 72.4, best: 'W1' },
    { label: '芽长 (cm)', w0: 3.4, w1: 4.1, w2: 2.9, best: 'W1' },
    { label: '再生茎蘖数', w0: 15.8, w1: 18.3, w2: 12.4, best: 'W1' },
    { label: '存活残桩密度', w0: 49.2, w1: 54.7, w2: 45.6, best: 'W1' },
  ],
  gasPulse: {
    labels: windowNodes,
    ch4: [
      { label: 'W0', color: '#8b5cf6', values: [2.4, 2.6, 3.1, 4.6, 5.1, 4.8, 4.2, 3.4, 3.0, 2.8] },
      { label: 'W1', color: '#a855f7', values: [2.3, 2.5, 3.3, 4.9, 5.9, 5.3, 4.5, 3.6, 3.2, 2.9] },
      { label: 'W2', color: '#c084fc', values: [2.1, 2.4, 3.7, 5.8, 7.4, 6.7, 5.1, 4.2, 3.4, 3.1] },
    ],
    n2o: [
      { label: 'W0', color: '#ec4899', values: [0.5, 0.6, 0.8, 1.5, 2.2, 1.8, 1.1, 0.8, 0.6, 0.5] },
      { label: 'W1', color: '#f472b6', values: [0.6, 0.7, 1.0, 1.8, 2.9, 2.1, 1.4, 1.0, 0.7, 0.6] },
      { label: 'W2', color: '#fb7185', values: [0.8, 1.0, 1.3, 2.4, 4.1, 3.2, 1.9, 1.4, 1.0, 0.8] },
    ],
    summary: [
      { label: '割后脉冲峰值', value: 'CH₄ 7.4 / N₂O 4.1', tone: 'rose' },
      { label: '复湿脉冲峰值', value: 'W2 > W1 > W0', tone: 'violet' },
      { label: '累计排放', value: 'W2 最高，W1 次之', tone: 'amber' },
      { label: '单位产量排放强度', value: 'W1 最优', tone: 'emerald' },
    ],
  },
  rhizosphere: {
    columns: ['DOC', 'NH4+-N', 'NO3--N', '有效磷', 'Eh', '酶活', '功能基因'],
    rows: [
      { label: 'W0', values: [0.58, 0.46, 0.39, 0.52, 0.61, 0.55, 0.48] },
      { label: 'W1', values: [0.66, 0.54, 0.45, 0.61, 0.69, 0.63, 0.58] },
      { label: 'W2', values: [0.73, 0.62, 0.51, 0.57, 0.42, 0.49, 0.66] },
    ],
    notes: [
      'W1 在 DOC、Eh 和酶活上呈现较平衡的根际功能优势。',
      'W2 的功能基因信号增强，但伴随更高排放脉冲风险。',
    ],
  },
  carbonAllocation: {
    partitions: [
      { label: '叶', value: 12, tone: 'emerald' },
      { label: '茎鞘', value: 18, tone: 'sky' },
      { label: '残桩', value: 16, tone: 'slate' },
      { label: '新生芽', value: 21, tone: 'teal' },
      { label: '根', value: 14, tone: 'amber' },
      { label: '根际DOC', value: 9, tone: 'violet' },
      { label: '其他呼吸消耗', value: 10, tone: 'rose' },
    ],
    compare: [
      { label: '上行分配', w0: 46, w1: 51, w2: 43 },
      { label: '下行分配', w0: 34, w1: 31, w2: 38 },
      { label: '根际释放', w0: 8, w1: 7, w2: 11 },
      { label: '新生芽优先级', w0: 18, w1: 24, w2: 16 },
    ],
  },
};

export const analysisPageData = {
  tabs: ['整季过程分析', '关键窗口机制分析（摘要版）'],
  seasonCards: [
    { label: '主季产量', value: '8.34', unit: 't/ha', tone: 'emerald', detail: 'W1 处理最高' },
    { label: '再生季产量', value: '2.87', unit: 't/ha', tone: 'sky', detail: 'W1 > W0 > W2' },
    { label: '总产量', value: '11.21', unit: 't/ha', tone: 'teal', detail: '高产—低排协同指数 0.78' },
    { label: '张力达标率', value: '84', unit: '%', tone: 'amber', detail: 'W2 波动较大' },
  ],
  seasonCharts: {
    labels: ['分蘖', '拔节', '抽穗', '灌浆', '成熟', '主季收割', '再生季启动', '再生拔节', '再生收获'],
    waterControl: [
      { label: 'W0', color: '#60a5fa', values: [76, 78, 80, 81, 82, 83, 79, 80, 81] },
      { label: 'W1', color: '#14b8a6', values: [79, 82, 84, 86, 88, 87, 83, 84, 86] },
      { label: 'W2', color: '#f59e0b', values: [68, 72, 75, 77, 79, 76, 72, 73, 74] },
    ],
    yieldAndRisk: [
      { label: '主季产量', color: '#16a34a', values: [7.9, 8.3, 7.5] },
      { label: '再生季产量', color: '#0ea5e9', values: [2.8, 2.9, 2.4] },
      { label: '风险暴露', color: '#dc2626', values: [22, 18, 31] },
    ],
  },
  windowDigest: [
    { label: '再生芽萌发率', value: 'W1 最高', detail: '较 W2 提升 16.5%', tone: 'teal' },
    { label: 'CH₄ / N₂O 脉冲', value: 'W2 峰值最强', detail: '复湿脉冲放大明显', tone: 'rose' },
    { label: '根际 DOC / 无机氮', value: 'W1 平衡性最佳', detail: '根际功能稳定', tone: 'violet' },
    { label: '13C 碳分配', value: 'W1 新生芽占比最高', detail: '上行分配增强', tone: 'sky' },
    { label: '高产—低排协同指数', value: '0.78', detail: 'W1 为当前最优处理', tone: 'emerald' },
  ],
  mechanismMatrix: {
    columns: ['再生芽萌发率', '芽长', 'CH₄脉冲', 'N₂O脉冲', 'DOC', 'mcrA', 'phoD', '13C上行比例'],
    rows: [
      { label: 'W0', values: [0.72, 0.66, 0.44, 0.31, 0.51, 0.48, 0.42, 0.56] },
      { label: 'W1', values: [0.86, 0.81, 0.52, 0.41, 0.68, 0.58, 0.63, 0.74] },
      { label: 'W2', values: [0.58, 0.49, 0.79, 0.77, 0.62, 0.69, 0.51, 0.45] },
    ],
  },
  recommendations: [
    '当前摘要分析支持“查看主—再关键期专题”，以进一步核对芽启动与气体脉冲的时间对齐关系。',
    '建议将 W2 处理的张力阈值与复水延迟规则下调 8% 进行下一轮模拟。',
    '建议优先完成 E2 样品的 DOC、功能基因与 13C 回填，以提升机制图闭环。 ',
  ],
};

export const alertsPageData = {
  categories: ['全部', '水分控制类', '设备通讯类', '试验执行类'],
  levels: ['全部', '高', '中', '低'],
  rows: [
    {
      id: 'AL-001',
      time: '2026-09-06 09:14',
      plot: 'P19',
      combination: 'W2 + G1 + R3',
      category: '水分控制类',
      type: '复水延迟',
      level: '高',
      currentValue: '-51 kPa',
      threshold: '-45 kPa',
      duration: '6.5 h',
      suggestion: '立即启动复水并检查电磁阀反馈',
      status: '未处理',
    },
    {
      id: 'AL-002',
      time: '2026-09-06 08:40',
      plot: 'P06',
      combination: 'W0 + G2 + R2',
      category: '设备通讯类',
      type: 'LoRa 弱信号',
      level: '中',
      currentValue: '-121 dBm',
      threshold: '-110 dBm',
      duration: '48 min',
      suggestion: '检查节点天线与供电',
      status: '未处理',
    },
    {
      id: 'AL-003',
      time: '2026-09-06 08:05',
      plot: 'P11',
      combination: 'W1 + G1 + R3',
      category: '试验执行类',
      type: '关键节点未测',
      level: '中',
      currentValue: 'E1 未完成',
      threshold: 'T+7 前完成',
      duration: '3 h',
      suggestion: '补做 E1 根际采样并上传图片',
      status: '未处理',
    },
    {
      id: 'AL-004',
      time: '2026-09-05 17:26',
      plot: 'P08',
      combination: 'W0 + G2 + R4',
      category: '水分控制类',
      type: '张力超阈',
      level: '低',
      currentValue: '-29 kPa',
      threshold: '-25 kPa',
      duration: '1.2 h',
      suggestion: '核查边沟渗漏，确认阈值适配',
      status: '已处理',
    },
    {
      id: 'AL-005',
      time: '2026-09-05 15:48',
      plot: 'P14',
      combination: 'W1 + G2 + R2',
      category: '试验执行类',
      type: '样品未录入',
      level: '低',
      currentValue: '13C样待登记',
      threshold: '采样后 4 h',
      duration: '5.8 h',
      suggestion: '补录样品编号并同步实验室状态',
      status: '已忽略',
    },
    {
      id: 'AL-006',
      time: '2026-09-05 14:10',
      plot: 'P03',
      combination: 'W0 + G1 + R3',
      category: '设备通讯类',
      type: '电量不足',
      level: '中',
      currentValue: '3.62 V',
      threshold: '3.70 V',
      duration: '2.4 h',
      suggestion: '更换电池或切换太阳能供电',
      status: '未处理',
    },
  ],
};

export const devicesPageData = {
  summary: [
    { label: '在线节点', value: '22 / 24', tone: 'emerald', detail: '2 个小区待巡检' },
    { label: 'LoRa 网关', value: '3', tone: 'indigo', detail: '北区、南区、气体通量区' },
    { label: '4G 上传成功率', value: '98.7%', tone: 'sky', detail: '近 24 h 平均' },
    { label: '传感器健康评分', value: '91', tone: 'teal', detail: '建议校准 4 支张力计' },
  ],
  topology: [
    { id: 'gateway-north', label: 'LoRa 网关 G-01', meta: '北区主网关 · 在线', tone: 'indigo' },
    { id: 'uplink', label: '4G 上行链路', meta: '运营商双链路容灾', tone: 'sky' },
    { id: 'cloud', label: '平台接入服务', meta: '上传成功率 98.7%', tone: 'emerald' },
  ],
  nodes: [
    { id: 'P03', gateway: 'G-01', status: '在线', battery: '3.62 V', rssi: '-104 dBm', success: '96.2%', cache: '8', lastSeen: '10:36', firmware: 'v1.8.2', position: '北区 3 号田带', sensors: '水位 / 张力 / pH / EC' },
    { id: 'P06', gateway: 'G-01', status: '弱信号', battery: '3.91 V', rssi: '-121 dBm', success: '82.4%', cache: '51', lastSeen: '10:14', firmware: 'v1.8.2', position: '北区 6 号田带', sensors: '水位 / 张力 / 气温湿度' },
    { id: 'P14', gateway: 'G-02', status: '在线', battery: '4.02 V', rssi: '-89 dBm', success: '99.1%', cache: '12', lastSeen: '10:42', firmware: 'v1.9.0', position: '南区 2 号田带', sensors: '水位 / 张力 / 水温 / 地温' },
    { id: 'P19', gateway: 'G-03', status: '离线', battery: '3.54 V', rssi: '--', success: '41.3%', cache: '127', lastSeen: '09:58', firmware: 'v1.7.9', position: '气体通量区 3 号带', sensors: '通量箱 / 温湿度 / PAR' },
  ],
  sensorHealth: [
    { sensor: '田面水位计', count: 24, healthy: 23, drift: 1, note: 'P06 需复测零点' },
    { sensor: '土壤张力计', count: 24, healthy: 20, drift: 4, note: 'W2 组 2 支漂移偏大' },
    { sensor: '气体通量箱', count: 6, healthy: 5, drift: 1, note: 'P19 时钟待同步' },
    { sensor: 'pH / EC 模块', count: 12, healthy: 11, drift: 1, note: 'P03 建议清洗电极' },
  ],
};

export const settingsPageData = {
  tabs: ['报警阈值配置', '水分控制规则', '传感器校准记录', '用户权限', '数据导出', '备份与恢复', 'API 接入', '日志审计'],
  thresholds: [
    { name: '张力超阈', value: '-45 kPa', scope: 'W2 主—再关键期', updatedAt: '2026-09-02 14:20' },
    { name: '水位过低', value: '-3.0 cm', scope: '全部小区', updatedAt: '2026-09-01 09:45' },
    { name: '复水延迟', value: '4 h', scope: '关键窗口', updatedAt: '2026-09-03 11:10' },
    { name: '数据长时间未上报', value: '20 min', scope: '节点与网关', updatedAt: '2026-09-02 18:05' },
  ],
  rules: [
    { name: 'W1 张力控制', mode: '规则集联动', detail: '达到 -30 kPa 后自动建议复水', owner: '系统规则库' },
    { name: 'W2 复水延迟控制', mode: '人工确认 + 平台建议', detail: '达到 -45 kPa 后允许 2 h 延迟复水', owner: '课题组' },
    { name: '关键窗口报警升级', mode: '自动升级', detail: 'T0 ~ T+7 区间报警优先级提升一级', owner: '系统规则库' },
  ],
  calibrations: [
    { sensor: 'P06 张力计', method: '两点校准', result: '待复检', time: '2026-09-05 16:20' },
    { sensor: 'P14 pH 模块', method: '标准液校准', result: '通过', time: '2026-09-04 10:10' },
    { sensor: 'G-03 网关时间', method: 'NTP 校时', result: '通过', time: '2026-09-04 08:40' },
  ],
  permissions: [
    { role: '首席研究员', access: '全部模块 / 导出 / 审批', count: 2 },
    { role: '试验执行人员', access: '田间监测 / 试验管理 / 样品录入', count: 4 },
    { role: '实验室回填人员', access: '样品回填 / 数据分析摘要', count: 3 },
    { role: '设备运维', access: '设备与网关 / 校准 / 日志审计', count: 2 },
  ],
  exports: [
    { name: '专题图表快照', format: 'PNG / PDF', status: '可用' },
    { name: '全生育期监测数据', format: 'CSV / XLSX', status: '可用' },
    { name: '设备巡检日志', format: 'CSV', status: '可用' },
  ],
  backups: [
    { name: '每日自动备份', target: '本地 NAS + 云端归档', status: '正常' },
    { name: '实验数据库快照', target: '2026-09-06 02:00', status: '最近成功' },
  ],
  apiAccess: [
    { name: 'IoT 上报 API', endpoint: '/api/iot/ingest', status: '已规划' },
    { name: '科研数据导出 API', endpoint: '/api/analysis/export', status: '内测' },
    { name: '第三方实验室回填 API', endpoint: '/api/lab/import', status: '待接入' },
  ],
  auditLogs: [
    { time: '2026-09-06 09:20', actor: '张秫瑄', action: '更新 W2 张力阈值', result: '成功' },
    { time: '2026-09-06 08:55', actor: '系统', action: '执行 02:00 自动备份校验', result: '成功' },
    { time: '2026-09-05 17:18', actor: '王博', action: '提交 P14 E1 样品回填', result: '成功' },
  ],
};
