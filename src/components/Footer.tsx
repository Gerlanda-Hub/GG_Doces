import { Link, useNavigate } from 'react-router-dom';
import { Cake, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const handleSecretClick = () => {
    navigate('/admin');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rosa-400 to-rosa-600 flex items-center justify-center">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Mundo de Doces <span className="text-rosa-400">da GG</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sabores criados para tornar cada celebração especial.
              Qualidade, criatividade e profissionalismo ao seu serviço.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-rosa-400 transition-colors">Início</Link></li>
              <li><Link to="/sobre" className="hover:text-rosa-400 transition-colors">Sobre Nós</Link></li>
              <li><Link to="/encomendar" className="hover:text-rosa-400 transition-colors">Fazer Encomenda</Link></li>
              <li><Link to="/consultar" className="hover:text-rosa-400 transition-colors">Consultar Encomenda</Link></li>
              <li><Link to="/contato" className="hover:text-rosa-400 transition-colors">Contactar Gestão</Link></li>
              <li><Link to="/cliente" className="hover:text-rosa-400 transition-colors">Área do Cliente</Link></li>
              <li><Link to="/politica-privacidade" className="hover:text-rosa-400 transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contactos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/244927718735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-rosa-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-rosa-400" />
                  <span>+244 927 718 735</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:ggsuportes@gmai.com"
                  className="flex items-center gap-2 hover:text-rosa-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-rosa-400" />
                  <span>ggsuportes@gmai.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Luanda,Angola"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-rosa-400 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-rosa-400" />
                  <span>Luanda, Angola</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            {['Qualidade', 'Compromisso', 'Criatividade', 'Profissionalismo', 'Confiança', 'Satisfação'].map(v => (
              <span key={v} className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700">{v}</span>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 flex items-center justify-center gap-1">
          Feito com{' '}
          <button
            onClick={handleSecretClick}
            className="focus:outline-none hover:scale-125 active:scale-95 transition-transform cursor-pointer"
            title="Área Administrativa"
          >
            <Heart className="w-3.5 h-3.5 fill-rosa-400 text-rosa-400" />
          </button>{' '}
          por Mundo de Doces da GG &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
