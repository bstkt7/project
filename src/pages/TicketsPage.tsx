// TicketsPage.tsx
import React, { useEffect, useState } from 'react';
import { TicketForm } from '../components/TicketForm';
import { RecentTickets } from '../components/RecentTickets';
import { UsefulLinks } from '../components/UsefulLinks';
import { FileUpload } from '../components/FileUpload';

export function TicketsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        console.log('beforeinstallprompt event fired');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };

    initialize();
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log(choiceResult.outcome === 'accepted' 
          ? 'User accepted the A2HS prompt' 
          : 'User dismissed the A2HS prompt');
        setDeferredPrompt(null);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="ml-2">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Создать тикет</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <TicketForm />
            </div>
          </div>

          <FileUpload />
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

     
    </div>
  );
}