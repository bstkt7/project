export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: Date;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface RecentTicket {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
}