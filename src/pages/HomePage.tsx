import React, { useEffect, useState } from 'react';
import { TicketForm } from '../components/TicketForm';
import { RecentTickets } from '../components/RecentTickets';
import { UsefulLinks } from '../components/UsefulLinks';

export function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Запрос разрешения на уведомления
    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Уведомления разрешены');
      } else {
        console.log('Уведомления отклонены');
      }
    };

    requestNotificationPermission();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Добро пожаловать на главную страницу!</h1>
      <p className="mt-4">Здесь вы можете найти информацию о тикетах, FAQ и чате.</p>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Создать тикет</h2>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <TicketForm />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">История тикетов</h2>
            <RecentTickets />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Полезные ссылки</h2>
            <UsefulLinks />
          </div>
        </div>
      </div>

      {/* Кнопка установки PWA */}
      <div className="mt-6">
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Установить приложение
        </button>
      </div>

      {/* Раздел Графика */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Графика</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/files/logo.svg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              logo.svg
            </a>
          </li>
          <li>
            <a href="/files/logo.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              logo.png
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
} 