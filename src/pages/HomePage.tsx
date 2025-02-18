import React from 'react';
import { TicketForm } from '../components/TicketForm';
import { RecentTickets } from '../components/RecentTickets';
import { UsefulLinks } from '../components/UsefulLinks';

export function HomePage() {
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
    </div>
  );
} 