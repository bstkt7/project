import { Link } from 'react-router-dom';
import { MessageCircle, Settings, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 flex-wrap">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Техподдержка ГККШИ
            </Link>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/faq"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <HelpCircle size={20} />
              <span>FAQ</span>
            </Link>
            
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings size={20} />
              <span>Админ</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <User size={20} />
              <span>Личный кабинет</span>
            </Link>

            {user && (
              <span className="text-gray-800 font-semibold">
                Привет, {user.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 