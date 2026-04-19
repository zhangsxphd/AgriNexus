import {
  Activity,
  AlertTriangle,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Radio,
  Settings2,
} from 'lucide-react';

export const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页', title: '首页', end: true },
  { path: '/monitoring', icon: Activity, label: '田间监测', title: '田间监测', end: false },
  { path: '/experiments', icon: FlaskConical, label: '试验管理', title: '试验管理', end: false },
  { path: '/analysis', icon: LineChart, label: '数据分析', title: '数据分析', end: false },
  { path: '/alerts', icon: AlertTriangle, label: '预警中心', title: '预警中心', end: false },
  { path: '/devices', icon: Radio, label: '设备与网关', title: '设备与网关', end: false },
  { path: '/settings', icon: Settings2, label: '系统设置', title: '系统设置', end: false },
];

const pageMeta = [
  { matcher: (pathname) => pathname === '/', title: '首页', subtitle: '平台总控页' },
  { matcher: (pathname) => pathname.startsWith('/monitoring'), title: '田间监测', subtitle: '单小区全过程监测' },
  { matcher: (pathname) => pathname === '/experiments', title: '试验管理', subtitle: '科研试验执行中台' },
  { matcher: (pathname) => pathname.startsWith('/experiments/ratoon-water-window'), title: '主—再关键期专题', subtitle: '专题分析层' },
  { matcher: (pathname) => pathname.startsWith('/analysis'), title: '数据分析', subtitle: '科研数据中心' },
  { matcher: (pathname) => pathname.startsWith('/alerts'), title: '预警中心', subtitle: '科研试验报警平台' },
  { matcher: (pathname) => pathname.startsWith('/devices'), title: '设备与网关', subtitle: '田间物联网工程页' },
  { matcher: (pathname) => pathname.startsWith('/settings'), title: '系统设置', subtitle: '底层配置页' },
];

export function resolvePageMeta(pathname) {
  return pageMeta.find((item) => item.matcher(pathname)) ?? { title: '田智枢', subtitle: 'AgriNexus 稻田科研平台' };
}
