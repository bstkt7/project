import React from 'react';
import { Globe, Phone, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-blue-400" />
            <a 
              href="https://shkolainternatkurtamyshskaya-r45.gosweb.gosuslugi.ru/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Официальный сайт школы
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-400" />
            <a 
              href="https://vk.com/kks45" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Группа ВКонтакте
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone size={20} className="text-blue-400" />
            <a 
              href="tel:+79512752974" 
              className="hover:text-blue-400 transition-colors"
            >
              +7 (951) 275-29-74
            </a>
            <span className="text-gray-400 text-sm">(Попов Илья Юрьевич)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}