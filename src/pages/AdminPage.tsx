import React, { useState, useEffect } from 'react';
import { Lock, Plus, Save, X, Edit2, ChevronDown, ChevronUp, Link as LinkIcon, Trash2, Printer, Calendar as CalendarIcon, Ticket, StickyNote, HelpCircle, CheckCircle } from 'lucide-react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '../utils/supabase';
import 'react-calendar/dist/Calendar.css';
import type { ChangeEvent, FormEvent } from 'react';
import type { Value } from 'react-calendar';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TicketForm } from '../components/TicketForm';

interface CalendarTileProperties {
  date: Date;
  view: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Printer {
  id: string;
  model: string;
  location: string;
  toner_model: string;
  cartridge_model: string;
  last_toner_change: string;
}

interface TicketComment {
  id: string;
  content: string;
  created_at: string;
}

interface AdminTicket {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: 'pending' | 'completed';
  comments: TicketComment[];
}

export function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState(false);
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [isAddingPrinter, setIsAddingPrinter] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newPrinter, setNewPrinter] = useState({
    model: '',
    location: '',
    toner_model: '',
    cartridge_model: '',
    last_toner_change: new Date().toISOString().split('T')[0]
  });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'links' | 'faq' | 'printers' | 'tickets'>('notes');
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [tonerChangeDates, setTonerChangeDates] = useState<Record<string, Date[]>>({});
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
      fetchLinks();
      fetchFaqItems();
      fetchPrinters();
      fetchTickets();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (printers.length > 0) {
      const dates: Record<string, Date[]> = {};
      printers.forEach(printer => {
        dates[printer.id] = [new Date(printer.last_toner_change)];
      });
      setTonerChangeDates(dates);
    }
  }, [printers]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('admin_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('useful_links')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching links:', error);
      return;
    }

    setLinks(data || []);
  };

  const fetchFaqItems = async () => {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ items:', error);
      return;
    }

    setFaqItems(data || []);
  };

  const fetchPrinters = async () => {
    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .order('model', { ascending: true });

    if (error) {
      console.error('Error fetching printers:', error);
      return;
    }

    setPrinters(data || []);
  };

  const fetchTickets = async () => {
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return;
    }

    const ticketsWithComments = await Promise.all(
      (ticketsData || []).map(async (ticket) => {
        const { data: commentsData } = await supabase
          .from('ticket_comments')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        return {
          ...ticket,
          comments: commentsData || []
        };
      })
    );

    setTickets(ticketsWithComments);
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === '12qwaszx') {
      setIsAuthenticatedLocal(true);
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNoteContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(prev => ({ ...prev, content: e.target.value }));
  };

  const handleNoteTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote(prev => ({ ...prev, title: e.target.value }));
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      return;
    }

    const { error } = await supabase
      .from('admin_notes')
      .insert([{
        title: newNote.title,
        content: newNote.content
      }]);

    if (error) {
      console.error('Error adding note:', error);
      return;
    }

    setNewNote({ title: '', content: '' });
    setIsAddingNote(false);
    fetchNotes();
  };

  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      return;
    }

    const { error } = await supabase
      .from('useful_links')
      .insert([newLink]);

    if (error) {
      console.error('Error adding link:', error);
      return;
    }

    setNewLink({ title: '', url: '' });
    setIsAddingLink(false);
    fetchLinks();
  };

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      return;
    }

    const { error } = await supabase
      .from('faq_items')
      .insert([{
        question: newFaq.question,
        answer: newFaq.answer,
        order: faqItems.length
      }]);

    if (error) {
      console.error('Error adding FAQ item:', error);
      return;
    }

    setNewFaq({ question: '', answer: '' });
    setIsAddingFaq(false);
    fetchFaqItems();
  };

  const handleAddPrinter = async () => {
    if (!newPrinter.model.trim() || !newPrinter.location.trim()) {
      return;
    }

    const { error } = await supabase
      .from('printers')
      .insert([newPrinter]);

    if (error) {
      console.error('Error adding printer:', error);
      return;
    }

    setNewPrinter({
      model: '',
      location: '',
      toner_model: '',
      cartridge_model: '',
      last_toner_change: new Date().toISOString().split('T')[0]
    });
    setIsAddingPrinter(false);
    fetchPrinters();
  };

  const handleAddComment = async (ticketId: string) => {
    const commentContent = newComment[ticketId];
    if (!commentContent?.trim()) return;

    const { error: commentError } = await supabase
      .from('ticket_comments')
      .insert([{
        ticket_id: ticketId,
        content: commentContent
      }]);

    if (commentError) {
      console.error('Error adding comment:', commentError);
      return;
    }

    setNewComment(prev => ({ ...prev, [ticketId]: '' }));
    fetchTickets();
  };

  const handleUpdateNote = async (id: string) => {
    const noteToUpdate = notes.find(note => note.id === id);
    if (!noteToUpdate) return;

    const { error } = await supabase
      .from('admin_notes')
      .update({
        title: noteToUpdate.title,
        content: noteToUpdate.content
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating note:', error);
      return;
    }

    setEditingNote(null);
    fetchNotes();
  };

  const handleUpdateLink = async (id: string) => {
    const linkToUpdate = links.find(link => link.id === id);
    if (!linkToUpdate) return;

    const { error } = await supabase
      .from('useful_links')
      .update({
        title: linkToUpdate.title,
        url: linkToUpdate.url
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating link:', error);
      return;
    }

    setEditingLink(null);
    fetchLinks();
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from('useful_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
      return;
    }

    fetchLinks();
  };

  const handleUpdateFaq = async (id: string) => {
    const faqToUpdate = faqItems.find(faq => faq.id === id);
    if (!faqToUpdate) return;

    const { error } = await supabase
      .from('faq_items')
      .update({
        question: faqToUpdate.question,
        answer: faqToUpdate.answer
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating FAQ item:', error);
      return;
    }

    setEditingFaq(null);
    fetchFaqItems();
  };

  const handleDeleteFaq = async (id: string) => {
    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FAQ item:', error);
      return;
    }

    fetchFaqItems();
  };

  const handleUpdatePrinter = async (id: string) => {
    const printerToUpdate = printers.find(printer => printer.id === id);
    if (!printerToUpdate) return;

    const { error } = await supabase
      .from('printers')
      .update(printerToUpdate)
      .eq('id', id);

    if (error) {
      console.error('Error updating printer:', error);
      return;
    }

    setEditingPrinter(null);
    fetchPrinters();
  };

  const handleDeletePrinter = async (id: string) => {
    const { error } = await supabase
      .from('printers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting printer:', error);
      return;
    }

    fetchPrinters();
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket status:', error);
      return;
    }

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus }
        : ticket
    ));
  };

  const handleUpdateTonerChange = async (id: string, date?: Date) => {
    const newDate = date || new Date();
    
    const { error } = await supabase
      .from('printers')
      .update({
        last_toner_change: newDate.toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating toner change date:', error);
      return;
    }

    setTonerChangeDates(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newDate]
    }));

    fetchPrinters();
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNotes((prev: string[]) =>
      prev.includes(id)
        ? prev.filter((noteId: string) => noteId !== id)
        : [...prev, id]
    );
  };

  const getTileContent = ({ date, view }: CalendarTileProperties) => {
    if (view !== 'month' || !selectedPrinter) return null;

    const printerDates = tonerChangeDates[selectedPrinter] || [];
    const hasChange = printerDates.some(changeDate => 
      format(changeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return hasChange ? (
      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />
    ) : null;
  };

  if (!isAuthenticated || (user.email !== 'bstkt7@gmail.com')) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('notes');
                setIsAddingNote(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <StickyNote size={20} />
              <span className="hidden sm:inline">Заметка</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('links');
                setIsAddingLink(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'links'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LinkIcon size={20} />
              <span className="hidden sm:inline">Ссылка</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('faq');
                setIsAddingFaq(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'faq'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <HelpCircle size={20} />
              <span className="hidden sm:inline">FAQ</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('printers');
                setIsAddingPrinter(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'printers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Printer size={20} />
              <span className="hidden sm:inline">Принтер</span>
            </button>
          </div>
        </div>

        <div className="mb-0 overflow-x-auto border-b">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-t-lg transition-colors relative ${
                activeTab === 'notes'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Заметки
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 rounded-t-lg transition-colors relative ${
                activeTab === 'links'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ссылки
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-t-lg transition-colors relative ${
                activeTab === 'faq'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('printers')}
              className={`px-4 py-2 rounded-t-lg transition-colors relative ${
                activeTab === 'printers'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Принтеры
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-t-lg transition-colors relative ${
                activeTab === 'tickets'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Тикеты
            </button>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6">
          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      <button
                        onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                          ticket.status === 'completed'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle size={18} />
                        {ticket.status === 'completed' ? 'Выполнено' : 'Отметить выполненным'}
                      </button>
                    </div>
                    <p className="text-gray-600 whitespace-pre-line">{ticket.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {ticket.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-medium">Комментарии:</h4>
                        {ticket.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded p-3">
                            <p className="text-gray-700">{comment.content}</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[ticket.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Добавить комментарий"
                          className="flex-1 px-4 py-2 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(ticket.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              {isAddingNote && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Новая заметка</h2>
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={handleNoteTitleChange}
                    placeholder="Заголовок"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    value={newNote.content}
                    onChange={handleNoteContentChange}
                    placeholder="Текст заметки"
                    rows={4}
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save size={20} />
                    Сохранить
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    {editingNote === note.id ? (
                      <>
                        <input
                          type="text"
                          value={note.title}
                          onChange={(e) => {
                            const updatedNotes = notes.map(n =>
                              n.id === note.id ? { ...n, title: e.target.value } : n
                            );
                            setNotes(updatedNotes);
                          }}
                          className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <textarea
                          value={note.content}
                          onChange={(e) => {
                            const updatedNotes = notes.map(n =>
                              n.id === note.id ? { ...n, content: e.target.value } : n
                            );
                            setNotes(updatedNotes);
                          }}
                          rows={4}
                          className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                          >
                            <Save size={20} />
                            Сохранить
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{note.title}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingNote(note.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => toggleNoteExpansion(note.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedNotes.includes(note.id) ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className={`text-gray-600 whitespace-pre-line overflow-hidden transition-all duration-300 ${
                          expandedNotes.includes(note.id) ? '' : 'max-h-20'
                        }`}>
                          {note.content}
                        </div>
                        {!expandedNotes.includes(note.id) && note.content.length > 100 && (
                          <button
                            onClick={() => toggleNoteExpansion(note.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Показать полност ью
                          </button>
                        )}
                        <p className="text-gray-400 text-sm mt-4">
                          {new Date(note.created_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div>
              {isAddingLink && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Новая ссылка</h2>
                    <button
                      onClick={() => setIsAddingLink(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Название"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddLink}
                    className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save size={20} />
                    Сохранить
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">{link.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateLink(link.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">{link.url}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              {isAddingFaq && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Новый FAQ</h2>
                    <button
                      onClick={() => setIsAddingFaq(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Вопрос"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Ответ"
                    rows={4}
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddFaq}
                    className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save size={20} />
                    Сохранить
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {faqItems.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    {editingFaq === faq.id ? (
                      <>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const updatedFaqs = faqItems.map(f =>
                              f.id === faq.id ? { ...f, question: e.target.value } : f
                            );
                            setFaqItems(updatedFaqs);
                          }}
                          className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const updatedFaqs = faqItems.map(f =>
                              f.id === faq.id ? { ...f, answer: e.target.value } : f
                            );
                            setFaqItems(updatedFaqs);
                          }}
                          rows={4}
                          className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => handleUpdateFaq(faq.id)}
                            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                          >
                            <Save size={20} />
                            Сохранить
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">{faq.question}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFaq(faq.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2 whitespace-pre-line">{faq.answer}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Printers Tab */}
          {activeTab === 'printers' && (
            <div>
              {isAddingPrinter && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Новый принтер</h2>
                    <button
                      onClick={() => setIsAddingPrinter(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPrinter.model}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Модель"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newPrinter.location}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Местоположение"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newPrinter.toner_model}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, toner_model: e.target.value }))}
                    placeholder="Модель тонера"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newPrinter.cartridge_model}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, cartridge_model: e.target.value }))}
                    placeholder="Модель картриджа"
                    className="w-full px-4 py-2 rounded border mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddPrinter}
                    className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save size={20} />
                    Сохранить
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {printers.map((printer) => (
                    <div 
                      key={printer.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPrinter === printer.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedPrinter(printer.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{printer.model}</h3>
                          <p className="text-gray-600">Местоположение: {printer.location}</p>
                          <p className="text-gray-600">Тонер: {printer.toner_model}</p>
                          <p className="text-gray-600">Картридж: {printer.cartridge_model}</p>
                          <p className="text-gray-600">
                            Последняя замена тонера: {' '}
                            {new Date(printer.last_toner_change).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTonerChange(printer.id);
                            }}
                            className="text-green-500 hover:text-green-700"
                            title="Отметить замену тонера"
                          >
                            <CalendarIcon size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPrinter(printer.id);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePrinter(printer.id);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPrinter && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">История замены тонера</h3>
                    <Calendar
                      locale={ru}
                      value={null}
                      tileContent={getTileContent}
                      className="w-full"
                      onChange={(value: Value) => {
                        if (value instanceof Date && selectedPrinter) {
                          handleUpdateTonerChange(selectedPrinter, value);
                        }
                      }}
                    />
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Даты замены тонера</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <TicketForm />
    </div>
  );
}