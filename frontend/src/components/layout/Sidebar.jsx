import { Menu, Orbit, Wheat, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../config/navigation';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // 移动端侧边栏打开时禁止背景滚动
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg md:hidden"
        aria-label="打开菜单"
      >
        <Menu size={20} />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300 md:relative md:z-10 md:translate-x-0 md:transition-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_36%)]" />

        <div className="relative flex items-center justify-between border-b border-slate-800/90 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-teal-500 p-2.5 text-white shadow-lg">
              <Wheat size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight text-white">田智枢</h1>
              <p className="text-[11px] font-medium tracking-[0.08em] text-slate-400">AgriNexus</p>
            </div>
          </div>

          {/* 移动端关闭按钮 */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="关闭菜单"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="relative flex flex-col gap-2 px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              end={item.end}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'bg-white/10 font-semibold text-white ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <item.icon size={20} />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative border-t border-slate-800/90 px-6 py-5">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Orbit size={14} />
              当前专题
            </div>
            <p className="mt-3 text-sm font-medium text-white">主—再关键期：水分调控与再生响应</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">入口位于"试验管理"页面的专题卡片，可替换为其他作物或课题模块。</p>
          </div>
        </div>
      </aside>
    </>
  );
}
