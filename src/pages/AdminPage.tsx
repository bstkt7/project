import React, { useState, useEffect } from 'react';
import { Lock, Plus, Save, X, Edit2, ChevronDown, ChevronUp, Link as LinkIcon, Trash2, Printer, Calendar as CalendarIcon, Ticket, StickyNote, HelpCircle, CheckCircle } from 'lucide-react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '../utils/supabase';
import 'react-calendar/dist/Calendar.css';

// Типы данных
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

// Состояние и действия для reducer
interface State {
  isAuthenticated: boolean;
  password: string;
  error: string;
  activeTab: 'notes' | 'links' | 'faq' | 'printers' | 'tickets';
  notes: Note[];
  links: Link[];
  faqItems: FaqItem[];
  printers: Printer[];
  tickets: AdminTicket[];
  tonerChangeDates: Record<string, Date[]>;
  modal: {
    type: 'note' | 'link' | 'faq' | 'printer' | null;
    mode: 'add' | 'edit';
    data: any;
  } | null;
  loading: Record<string, boolean>;
  expandedNotes: string[];
  selectedPrinter: string | null;
  newComment: Record<string, string>;
}

type Action =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: State['activeTab'] }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_LINKS'; payload: Link[] }
  | { type: 'SET_FAQ_ITEMS'; payload: FaqItem[] }
  | { type: 'SET_PRINTERS'; payload: Printer[] }
  | { type: 'SET_TICKETS'; payload: AdminTicket[] }
  | { type: 'SET_TONER_DATES'; payload: Record<string, Date[]> }
  | { type: 'SET_MODAL'; payload: State['modal'] }
  | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }
  | { type: 'SET_EXPANDED_NOTES'; payload: string[] }
  | { type: 'SET_SELECTED_PRINTER'; payload: string | null }
  | { type: 'SET_NEW_COMMENT'; payload: Record<string, string> }
  | { type: 'UPDATE_MODAL_DATA'; payload: any };

const initialState: State = {
  isAuthenticated: false,
  password: '',
  error: '',
  activeTab: 'notes',
  notes: [],
  links: [],
  faqItems: [],
  printers: [],
  tickets: [],
  tonerChangeDates: {},
  modal: null,
  loading: {},
  expandedNotes: [],
  selectedPrinter: null,
  newComment: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_AUTHENTICATED': return { ...state, isAuthenticated: action.payload };
    case 'SET_PASSWORD': return { ...state, password: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_NOTES': return { ...state, notes: action.payload };
    case 'SET_LINKS': return { ...state, links: action.payload };
    case 'SET_FAQ_ITEMS': return { ...state, faqItems: action.payload };
    case 'SET_PRINTERS': return { ...state, printers: action.payload };
    case 'SET_TICKETS': return { ...state, tickets: action.payload };
    case 'SET_TONER_DATES': return { ...state, tonerChangeDates: action.payload };
    case 'SET_MODAL': return { ...state, modal: action.payload };
    case 'SET_LOADING': return {
      ...state,
      loading: { ...state.loading, [action.payload.key]: action.payload.value }
    };
    case 'SET_EXPANDED_NOTES': return { ...state, expandedNotes: action.payload };
    case 'SET_SELECTED_PRINTER': return { ...state, selectedPrinter: action.payload };
    case 'SET_NEW_COMMENT': return { ...state, newComment: action.payload };
    case 'UPDATE_MODAL_DATA': return {
      ...state,
      modal: state.modal ? { ...state.modal, data: action.payload } : null
    };
    default: return state;
  }
};

export function AdminPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(async (table: string, setter: string, orderBy: string) => {
    dispatch({ type: 'SET_LOADING', payload: { key: table, value: true } });
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
    } else {
      const ticketsWithComments = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: commentsData } = await supabase
            .from('ticket_comments')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
          return { ...ticket, comments: commentsData || [] };
        })
      );
      dispatch({ type: 'SET_TICKETS', payload: ticketsWithComments });
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
      console.error('Error updating toner change:', error);
    } else {
      dispatch({
        type: 'SET_TONER_DATES',
        payload: {
          ...state.tonerChangeDates,
          [printerId]: [...(state.tonerChangeDates[printerId] || []), date]
        }
      });
      fetchData('printers', 'SET_PRINTERS', 'model');
    }
  }, [state.tonerChangeDates, fetchData]);

  const renderTabContent = useMemo(() => {
    switch (state.activeTab) {
      case 'notes':
        return (
          <div className="space-y-4">
            {state.loading.admin_notes && <Loader2 className="animate-spin" />}
            {state.notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'note', mode: 'edit', data: note } })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => dispatch({
                        type: 'SET_EXPANDED_NOTES',
                        payload: state.expandedNotes.includes(note.id)
                          ? state.expandedNotes.filter(id => id !== note.id)
                          : [...state.expandedNotes, note.id]
                      })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {state.expandedNotes.includes(note.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
                <div className={`text-gray-600 whitespace-pre-line transition-all duration-300 ${
                  state.expandedNotes.includes(note.id) ? '' : 'max-h-20 overflow-hidden'
                }`}>
                  {note.content}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(note.created_at).toLocaleDateString('ru-RU', {
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
        );
      case 'tickets':
        return (
          <div className="space-y-6">
            {state.loading.tickets && <Loader2 className="animate-spin" />}
            {state.tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <button
                    onClick={async () => {
                      const newStatus = ticket.status === 'completed' ? 'pending' : 'completed';
                      await supabase.from('tickets').update({ status: newStatus }).eq('id', ticket.id);
                      fetchTickets();
                    }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      ticket.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <CheckCircle size={18} />
                    {ticket.status === 'completed' ? 'Выполнено' : 'Отметить выполненным'}
                  </button>
                </div>
                <p className="text-gray-600 whitespace-pre-line">{ticket.description}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Создан: {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
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
                  <input
                    type="text"
                    value={state.newComment[ticket.id] || ''}
                    onChange={(e) => dispatch({
                      type: 'SET_NEW_COMMENT',
                      payload: { ...state.newComment, [ticket.id]: e.target.value }
                    })}
                    placeholder="Добавить комментарий"
                    className="w-full px-4 py-2 rounded border"
                  />
                  <button
                    onClick={async () => {
                      if (!state.newComment[ticket.id]?.trim()) return;
                      await supabase.from('ticket_comments').insert({
                        ticket_id: ticket.id,
                        content: state.newComment[ticket.id]
                      });
                      dispatch({
                        type: 'SET_NEW_COMMENT',
                        payload: { ...state.newComment, [ticket.id]: '' }
                      });
                      fetchTickets();
                    }}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'links':
        return (
          <div className="space-y-4">
            {state.loading.useful_links && <Loader2 className="animate-spin" />}
            {state.links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{link.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'link', mode: 'edit', data: link } })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete('useful_links', link.id, () => fetchData('useful_links', 'SET_LINKS', 'created_at'))}
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
        );
      case 'faq':
        return (
          <div className="space-y-4">
            {state.loading.faq_items && <Loader2 className="animate-spin" />}
            {state.faqItems.map((faq) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'faq', mode: 'edit', data: faq } })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete('faq_items', faq.id, () => fetchData('faq_items', 'SET_FAQ_ITEMS', 'order'))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-2 whitespace-pre-line">{faq.answer}</p>
              </div>
            ))}
          </div>
        );
      case 'printers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {state.loading.printers && <Loader2 className="animate-spin" />}
              {state.printers.map((printer) => (
                <div
                  key={printer.id}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    state.selectedPrinter === printer.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => dispatch({ type: 'SET_SELECTED_PRINTER', payload: printer.id })}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{printer.model}</h3>
                      <p className="text-gray-600">Местоположение: {printer.location}</p>
                      <p className="text-gray-600">Тонер: {printer.toner_model}</p>
                      <p className="text-gray-600">Картридж: {printer.cartridge_model}</p>
                      <p className="text-gray-600">
                        Последняя замена: {new Date(printer.last_toner_change).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'SET_MODAL', payload: { type: 'printer', mode: 'edit', data: printer } });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('printers', printer.id, () => fetchData('printers', 'SET_PRINTERS', 'model'));
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
            {state.selectedPrinter && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">История замены тонера</h3>
                <Calendar
                  locale={ru}
                  value={null}
                  tileContent={({ date }) => {
                    const printerDates = state.tonerChangeDates[state.selectedPrinter!] || [];
                    const hasChange = printerDates.some(changeDate =>
                      format(changeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    return hasChange ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />
                    ) : null;
                  }}
                  onChange={(value: any) => {
                    if (value instanceof Date && state.selectedPrinter) {
                      handleTonerChange(state.selectedPrinter, value);
                    }
                  }}
                  className="w-full"
                />
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Даты замены тонера</span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [state, fetchData, fetchTickets, handleDelete, handleTonerChange]);

  if (!state.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <form onSubmit={handleLogin}>
            <div className="flex items-center justify-center mb-6">
              <Lock className="text-blue-600 w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Вход в панель администратора</h1>
            <input
              type="password"
              value={state.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
              placeholder="Введите пароль"
              className="w-full px-4 py-2 rounded border"
            />
            {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap gap-2">
          {(['notes', 'links', 'faq', 'printers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => dispatch({
                type: 'SET_MODAL',
                payload: {
                  type: tab,
                  mode: 'add',
                  data: tab === 'notes' ? { title: '', content: '' } :
                        tab === 'links' ? { title: '', url: '' } :
                        tab === 'faq' ? { question: '', answer: '', order: state.faqItems.length } :
                        { model: '', location: '', toner_model: '', cartridge_model: '', last_toner_change: new Date().toISOString() }
                }
              })}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                state.activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {tab === 'notes' && <StickyNote size={20} />}
              {tab === 'links' && <LinkIcon size={20} />}
              {tab === 'faq' && <HelpCircle size={20} />}
              {tab === 'printers' && <Printer size={20} />}
              <span className="hidden sm:inline">
                {tab === 'notes' ? 'Заметка' : tab === 'links' ? 'Ссылка' : tab === 'faq' ? 'FAQ' : 'Принтер'}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-0 overflow-x-auto border-b">
          <div className="flex gap-2 min-w-max">
            {(['notes', 'links', 'faq', 'printers', 'tickets'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
                className={`px-4 py-2 rounded-t-lg ${
                  state.activeTab === tab
                    ? 'bg-white text-blue-600 border-t border-l border-r border-b border-b-white'
                    : 'bg-gray-100'
                }`}
              >
                {tab === 'notes' ? 'Заметки' :
                 tab === 'links' ? 'Ссылки' :
                 tab === 'faq' ? 'FAQ' :
                 tab === 'printers' ? 'Принтеры' : 'Тикеты'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6">{renderTabContent}</div>
      </div>

      {state.modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {state.modal.mode === 'add' ? 'Добавить' : 'Редактировать'} {state.modal.type === 'note' ? 'Заметку' : 
                  state.modal.type === 'link' ? 'Ссылку' : 
                  state.modal.type === 'faq' ? 'FAQ' : 'Принтер'}
              </h2>
              <button onClick={() => dispatch({ type: 'SET_MODAL', payload: null })}>
                <X size={20} />
              </button>
            </div>
            {state.modal.type === 'note' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={state.modal.data.title || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, title: e.target.value } })}
                  placeholder="Заголовок"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={state.modal.data.content || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, content: e.target.value } })}
                  placeholder="Содержание"
                  rows={4}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {state.modal.type === 'link' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={state.modal.data.title || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, title: e.target.value } })}
                  placeholder="Название"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={state.modal.data.url || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, url: e.target.value } })}
                  placeholder="URL"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {state.modal.type === 'faq' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={state.modal.data.question || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, question: e.target.value } })}
                  placeholder="Вопрос"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={state.modal.data.answer || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, answer: e.target.value } })}
                  placeholder="Ответ"
                  rows={4}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {state.modal.type === 'printer' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={state.modal.data.model || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, model: e.target.value } })}
                  placeholder="Модель"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={state.modal.data.location || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, location: e.target.value } })}
                  placeholder="Местоположение"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={state.modal.data.toner_model || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, toner_model: e.target.value } })}
                  placeholder="Модель тонера"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={state.modal.data.cartridge_model || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_MODAL_DATA', payload: { ...state.modal.data, cartridge_model: e.target.value } })}
                  placeholder="Модель картриджа"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <button
              onClick={handleSave}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}