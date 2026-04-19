import { useEffect, useState } from 'react';

export default function Toast({ message }) {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      // 使用 requestAnimationFrame 确保 DOM 更新后再触发动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      // 等退出动画结束再清空文本
      const timer = setTimeout(() => setDisplayMessage(''), 300);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!displayMessage) {
    return null;
  }

  return (
    <div
      className={[
        'fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full bg-slate-800/90 px-6 py-3 font-medium text-white shadow-lg backdrop-blur transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {displayMessage}
    </div>
  );
}
