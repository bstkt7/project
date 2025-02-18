import React, { useEffect, useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface UsefulLink {
  id: string;
  title: string;
  url: string;
}

export function UsefulLinks() {
  const [links, setLinks] = useState<UsefulLink[]>([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('useful_links')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) {
        setLinks(data);
      }
    };

    fetchLinks();

    const channel = supabase
      .channel('useful_links')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'useful_links' },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <LinkIcon className="text-blue-600" />
        Полезные ссылки
      </h2>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <span className="text-blue-600">{link.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}