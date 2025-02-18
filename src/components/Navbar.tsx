import { Link } from 'react-router-dom';
import { MessageCircle, Settings, HelpCircle } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              ГБОУ ГККШИ
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/faq"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <HelpCircle size={20} />
              <span>FAQ</span>
            </Link>
            
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <MessageCircle size={20} />
              <span>Чат</span>
            </Link>
            
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings size={20} />
              <span>Админ</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 