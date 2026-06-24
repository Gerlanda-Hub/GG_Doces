import { Shield, Heart, Lightbulb, Star, Award, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdSenseAd from '../components/AdSenseAd';

const values = [
  { icon: Shield, label: 'Qualidade', desc: 'Processos rigorosos na escolha de ingredientes selecionados para o sabor perfeito.' },
  { icon: Heart, label: 'Compromisso', desc: 'Dedicação total a cada cliente, garantindo que cada momento seja único.' },
  { icon: Lightbulb, label: 'Criatividade', desc: 'Desenvolvimento de produtos e designs artísticos exclusivos.' },
  { icon: Star, label: 'Profissionalismo', desc: 'Excelência técnica e cumprimento rigoroso de todos os prazos.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">A Nossa História</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 mt-2 mb-4">
            Sobre Nós
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Conheça o compromisso, a paixão e a arte por detrás dos sabores marcantes da Mundo de Doces da GG.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rosa-500" /> Como Tudo Começou
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Fundada em Luanda, Angola, a <strong>Mundo de Doces da GG</strong> nasceu da paixão pela confeitaria artesanal e do desejo de tornar cada celebração familiar especial. O que começou como uma produção familiar rapidamente cresceu devido à qualidade inigualável dos nossos bolos, cupcakes, doces e salgados.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              Hoje, somos uma marca de referência no mercado angolano, reconhecida pela criatividade artística e pelo atendimento personalizado. Acreditamos que a confeitaria de excelência exige não só técnica, mas também amor pelo que se faz. Cada receita é executada com ingredientes selecionados de alta qualidade.
            </p>
          </div>
          <div className="bg-gradient-to-br from-rosa-100 to-dourado-100 rounded-3xl aspect-[4/3] flex items-center justify-center text-8xl shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <span className="relative z-10 animate-float">🧁</span>
            <span className="absolute bottom-4 right-4 text-5xl opacity-40">🎂</span>
            <span className="absolute top-4 left-4 text-5xl opacity-30">🍬</span>
          </div>
        </div>
      </section>

      {/* Google AdSense Banner */}
      <div className="max-w-5xl mx-auto px-4">
        <AdSenseAd slot="about-middle-ad" />
      </div>

      {/* Mission, Vision, Values */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rosa-50 flex items-center justify-center text-rosa-500 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 Missão</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Oferecer produtos de confeitaria artesanal de qualidade excepcional e sabor marcante que contribuam para momentos especiais e celebrações felizes dos nossos clientes.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-dourado-50 flex items-center justify-center text-dourado-600 mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">🔭 Visão</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ser a marca líder e mais admirada em Angola pela qualidade gastronómica, criatividade visual e excelência no atendimento ao cliente.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">💎 Valores</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Qualidade inegociável, compromisso com a satisfação do cliente, criatividade contínua, profissionalismo e integridade absoluta em cada detalhe.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Nossos Pilares de Qualidade</h2>
          <p className="text-gray-500 text-sm mt-2">Como garantimos a excelência no nosso serviço diário</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-rosa-50 text-rosa-500 flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-2">{v.label}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-rosa-500 to-rosa-600 py-16 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Faça Parte da Nossa História</h2>
          <p className="text-rosa-100 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Deixe que o Mundo de Doces da GG crie os sabores perfeitos para a sua próxima festa ou evento especial.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/encomendar"
              className="px-6 py-3 rounded-full text-xs font-semibold bg-white text-rosa-600 hover:bg-gray-50 shadow-lg transition-all"
            >
              Fazer Encomenda
            </Link>
            <Link
              to="/contato"
              className="px-6 py-3 rounded-full text-xs font-semibold border-2 border-white text-white hover:bg-white/10 transition-all"
            >
              Falar Connosco
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
