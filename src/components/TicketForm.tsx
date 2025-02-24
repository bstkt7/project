import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { sendToTelegram } from '../utils/telegram';

export function TicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const success = await sendToTelegram(title, description);
      
      if (success) {
        setStatus('success');
        setTitle('');
        setDescription('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      console.error('Error submitting ticket:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Тема проблемы
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={status === 'sending'}
          placeholder="Номер кабинета или ФИО"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание проблемы
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={status === 'sending'}
          placeholder="Не забудьте указать номер телефона"
        />
      </div>

      {status === 'success' && (
        <div className="p-4 bg-green-100 text-green-700 rounded-md">
          Тикет успешно отправлен!
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Произошла ошибка при отправке тикета. Пожалуйста, попробуйте позже.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`flex items-center justify-center gap-2 w-full rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          status === 'sending'
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Send size={20} />
        {status === 'sending' ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
}