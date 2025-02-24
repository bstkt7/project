import { Link } from 'react-router-dom';
import { Settings, HelpCircle, } from 'lucide-react';

export function Navbar() {


  return (
    <nav className="bg-white shadow w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 flex-wrap">
          <div className="flex items-center gap-5">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Техподдержка   
            </Link>
            <img 
              src="https://shkolainternatkurtamyshskaya-r45.gosweb.gosuslugi.ru/netcat_files/27/2724/gerb.png" 
              alt="Герб школы" 
              className="h-8 w-auto" 
            />
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

          </div>
        </div>
      </div>
    </nav>
  );
} 