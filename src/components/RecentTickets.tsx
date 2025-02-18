import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { RecentTicket } from '../types';
import { supabase } from '../utils/supabase';
import { formatTimeAgo } from '../utils/formatTimeAgo';

interface Ticket {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: 'pending' | 'completed';
}

export function RecentTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ticketsPerPage = 3;

  useEffect(() => {
    fetchRecentTickets();
  }, [currentPage]);

  const fetchRecentTickets = async () => {
    const { data, error, count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage - 1);

    if (error) {
      console.error('Error fetching tickets:', error);
      return;
    }

    setTickets(data || []);
    setTotalPages(Math.ceil((count || 0) / ticketsPerPage));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="text-blue-600" />
        Последние тикеты
      </h2>
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Пока нет тикетов</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                  <p className="text-gray-600">{ticket.description}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {ticket.status === 'completed' && (
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Назад
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Вперед
        </button>
      </div>
    </div>
  );
}