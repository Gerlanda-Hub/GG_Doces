import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cake } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/encomendar', label: 'Encomendar' },
  { to: '/consultar', label: 'Consultar Pedido' },
  { to: '/contato', label: 'Contato' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rosa-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rosa-400 to-rosa-600 flex items-center justify-center shadow-md shadow-rosa-200 group-hover:scale-105 transition-transform">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800 hidden sm:block">
              Mundo de Doces <span className="text-rosa-500">da GG</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-rosa-50 text-rosa-600'
                    : 'text-gray-600 hover:text-rosa-500 hover:bg-rosa-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cliente"
              className="ml-2 px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md shadow-rosa-200 transition-all duration-200 hover:shadow-lg"
            >
              Área do Cliente
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-rosa-50"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-rosa-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-rosa-50 text-rosa-600'
                    : 'text-gray-600 hover:bg-rosa-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cliente"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-rosa-400 to-rosa-500 text-white text-center mt-2"
            >
              Área do Cliente
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
