import React from 'react';
import { NavLink } from 'react-router-dom';
import { TicketIcon, HelpCircle, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://shkolainternatkurtamyshskaya-r45.gosweb.gosuslugi.ru/netcat_files/27/2724/gerb.png" 
              alt="Герб школы" 
              className="h-8 w-auto" 
            />
            <div className="text-base font-bold">Техподдержка школы</div>
          </div>
          <div className="flex gap-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center gap-2 hover:text-blue-200 ${isActive ? 'text-blue-200' : ''}`
              }
            >
              <TicketIcon size={20} />
              <span>Тикеты</span>
            </NavLink>
            <NavLink 
              to="/faq" 
              className={({ isActive }) => 
                `flex items-center gap-2 hover:text-blue-200 ${isActive ? 'text-blue-200' : ''}`
              }
            >
              <HelpCircle size={20} />
              <span>FAQ</span>
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                `flex items-center gap-2 hover:text-blue-200 ${isActive ? 'text-blue-200' : ''}`
              }
            >
              <Settings size={20} />
              <span>Админу</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}