import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { resolvePageMeta } from '../../config/navigation';

export default function Topbar({ currentUser, users, showUserMenu, setShowUserMenu, onSelectUser }) {
  const { pathname } = useLocation();
  const pageMeta = resolvePageMeta(pathname);
  const todayLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());

  return (
    <header
      className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/88 px-4 py-3 shadow-[0_10px_40px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:px-5 md:px-8"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* 面包屑 — 移动端左侧留出汉堡按钮空间 */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 pl-12 text-sm md:pl-0">
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 sm:inline-flex">AgriNexus</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="font-medium text-slate-600">{pageMeta.title}</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="hidden text-slate-500 sm:inline">{pageMeta.subtitle}</span>
        </div>

        {/* 右侧状态胶囊 + 用户 */}
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-3">
          {/* 状态胶囊 — 允许换行，小屏隐藏次要信息 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 lg:inline-flex">{currentUser.park}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">灌浆成熟 · T-3</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{todayLabel}</span>
          </div>

          {/* 用户切换按钮 */}
          <div className="relative sm:ml-2">
            <button
              onClick={() => setShowUserMenu((visible) => !visible)}
              className="flex w-full items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:bg-slate-50 sm:w-auto sm:justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-900 font-bold text-white shadow-sm">
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <span className="block text-sm font-medium leading-tight text-slate-700">{currentUser.name}</span>
                  <span className="block text-[10px] text-slate-500">{currentUser.role}</span>
                </div>
              </div>
              <ChevronDown size={14} className="ml-1 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 mt-2 w-full min-w-60 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl duration-200 sm:w-60">
                <div className="mb-2 border-b border-slate-100 px-4 py-2">
                  <p className="text-xs font-bold tracking-[0.18em] text-slate-400">切换角色</p>
                </div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                      currentUser.id === user.id ? 'bg-sky-50/70' : '',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                        currentUser.id === user.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600',
                      ].join(' ')}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <p className={currentUser.id === user.id ? 'text-sm font-bold text-sky-700' : 'text-sm font-bold text-slate-700'}>
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
