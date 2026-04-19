import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Toast from '../components/common/Toast';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { mockUsers } from '../data/mockData';

export default function AppLayout() {
  const [users, setUsers] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const timerRef = useRef(null);

  const showMessage = useCallback((message) => {
    setToastMessage(message);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setToastMessage('');
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const refreshUsers = useCallback(async (preferredUserId = currentUser.id) => {
    setUsers(mockUsers);
    setCurrentUser((previous) => mockUsers.find((item) => item.id === preferredUserId) ?? previous ?? mockUsers[0]);
  }, [currentUser.id]);

  const handleSelectUser = (user) => {
    setCurrentUser(user);
    setShowUserMenu(false);
    showMessage(`已切换至 ${user.name}`);
  };

  // 点击任意位置关闭用户菜单（Topbar 内部 stopPropagation 会阻止穿透）
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = () => setShowUserMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="gm-shell relative flex min-h-screen overflow-hidden">
      <Toast message={toastMessage} />
      <Sidebar />

      <main
        className="relative flex h-screen flex-1 flex-col overflow-y-auto"
      >
        <Topbar
          currentUser={currentUser}
          users={users}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          onSelectUser={handleSelectUser}
        />

        <div className="mx-auto w-full max-w-[1720px] p-4 pb-12 sm:p-5 sm:pb-16 md:p-8 md:pb-20">
          <Outlet context={{ currentUser, showMessage, refreshUsers }} />
        </div>
      </main>
    </div>
  );
}
