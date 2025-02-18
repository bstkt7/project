import React, { useState } from 'react';

export function NotificationForm() {
  const [notificationText, setNotificationText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Notification.permission === 'granted') {
      new Notification('Уведомление', {
        body: notificationText,
      });
      setNotificationText('');
    } else {
      alert('Пожалуйста, разрешите уведомления в настройках браузера.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-80 mt-5">
      <div>
        <label htmlFor="notification" className="block text-sm font-medium text-gray-700">
          Текст уведомления
        </label>
        <textarea
          id="notification"
          value={notificationText}
          onChange={(e) => setNotificationText(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          placeholder="Введите текст уведомления"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Отправить уведомление
      </button>
    </form>
  );
} 