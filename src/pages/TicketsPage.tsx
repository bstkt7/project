import React from 'react';
import { TicketForm } from '../components/TicketForm';
import { RecentTickets } from '../components/RecentTickets';
import { UsefulLinks } from '../components/UsefulLinks';

export function TicketsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Создать тикет</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <TicketForm />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">История</h2>
            <RecentTickets />
          </div>
          <UsefulLinks />
        </div>
      </div>
    </div>
  );
}