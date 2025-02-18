import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export function FaqPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    const fetchFaqItems = async () => {
      const { data } = await supabase
        .from('faq_items')
        .select('*')
        .order('order', { ascending: true });

      if (data) {
        setFaqItems(data);
      }
    };

    fetchFaqItems();

    const channel = supabase
      .channel('faq_items')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'faq_items' },
        () => {
          fetchFaqItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h1>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-600 whitespace-pre-line">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}