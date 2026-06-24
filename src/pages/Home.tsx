import { Link, useNavigate } from 'react-router-dom';
import { Heart, Shield, Lightbulb, Star, Sparkles, Smartphone, Download, Check, Share2 } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import AdSenseAd from '../components/AdSenseAd';
import { shareContent, isNative } from '../utils/nativeFeatures';
import type { Service } from '../types';

const servicos: Service[] = [
  { id: '1', icon: '🎂', title: 'Bolo de Aniversário', description: 'Bolos personalizados para aniversários de todas as idades, com designs únicos e sabores irresistíveis.', slug: 'bolo-aniversario' },
  { id: '2', icon: '💍', title: 'Bolo de Noivado', description: 'Bolos elegantes e sofisticados para celebrações de noivado inesquecíveis.', slug: 'bolo-noivado' },
  { id: '3', icon: '🧁', title: 'Cupcakes', description: 'Cupcakes decorados e personalizados que encantam em qualquer festa ou evento especial.', slug: 'cupcakes' },
  { id: '4', icon: '🍬', title: 'Doces', description: 'Doces preparados com carinho para aniversários, noivados e eventos especiais.', slug: 'doces' },
  { id: '5', icon: '🥟', title: 'Salgados', description: 'Salgados deliciosos para festas, reuniões e eventos especiais.', slug: 'salgados' },
];

const valores = [
  { icon: Shield, label: 'Qualidade', desc: 'Materiais premium e processos rigorosos' },
  { icon: Heart, label: 'Compromisso', desc: 'Dedicação total a cada encomenda' },
  { icon: Lightbulb, label: 'Criatividade', desc: 'Designs únicos e personalizados' },
  { icon: Star, label: 'Profissionalismo', desc: 'Excelência em cada detalhe' },
];

export default function Home() {
  const navigate = useNavigate();

  const scrollToServicos = () => {
    document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rosa-50 via-white to-dourado-50" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-rosa-200/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-dourado-200/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rosa-50 border border-rosa-200 text-rosa-600 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> Confeitaria Artesanal
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Mundo de Doces{' '}
                <span className="text-gradient-rosa">da GG</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed">
                Sabores criados para tornar cada celebração especial.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/encomendar"
                  className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-lg shadow-rosa-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Fazer Encomenda
                </Link>
                <Link
                  to="/contato"
                  className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-dourado-300 text-dourado-700 hover:bg-dourado-50 transition-all duration-300"
                >
                  Solicitar Orçamento
                </Link>
                <a
                  href="https://wa.me/244927718735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-rosa-200 text-rosa-600 hover:bg-rosa-50 transition-all duration-300"
                >
                  Falar com a Gestão
                </a>
                <button
                  onClick={() => shareContent(
                    'Mundo de Doces da GG',
                    'Conheça a Mundo de Doces da GG — bolos, cupcakes, doces e salgados artesanais para tornar a sua celebração especial! 🎂',
                    window.location.origin
                  )}
                  className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-dourado-200 text-dourado-600 hover:bg-dourado-50 transition-all duration-300 flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" /> Partilhar
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="animate-fade-in relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-rosa-100 to-dourado-100 flex items-center justify-center">
                <div className="text-[120px] animate-float">
                  🎂
                </div>
                <div className="absolute bottom-4 right-4 text-6xl opacity-60">
                  🧁
                </div>
                <div className="absolute top-4 left-4 text-5xl opacity-50">
                  🍬
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToServicos}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-rosa-400"
          aria-label="Ver mais"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Nossos Serviços</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">O que oferecemos</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Cuidamos de cada detalhe para tornar o seu evento inesquecível com os melhores sabores.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => navigate('/encomendar')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-rosa-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Sobre Nós</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Quem somos
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                A <strong>Mundo de Doces da GG</strong> é uma empresa angolana dedicada a criar momentos
                especiais através da confeitaria artesanal. Cada produto é preparado com
                ingredientes selecionados e atenção personalizada.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Acreditamos que cada celebração merece um toque especial. Do bolo de aniversário aos
                doces e salgados, trabalhamos com criatividade e profissionalismo para
                superar as expectativas dos nossos clientes.
              </p>
              <p className="text-gray-600 leading-relaxed">
                O nosso compromisso é com a excelência — desde o primeiro contacto até à entrega final.
                Estamos em constante crescimento, sempre focados na satisfação de quem confia em nós.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {valores.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <Icon className="w-8 h-8 text-rosa-400 mb-3" />
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{label}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-rosa-50 to-rosa-100/50 rounded-2xl p-8 border border-rosa-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 Missão</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Oferecer produtos de confeitaria de qualidade que contribuam para momentos
                especiais dos nossos clientes.
              </p>
            </div>
            <div className="bg-gradient-to-br from-dourado-50 to-dourado-100/50 rounded-2xl p-8 border border-dourado-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">🔭 Visão</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ser reconhecida pela qualidade, criatividade e excelência no atendimento em Angola.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">💎 Valores</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Qualidade, Compromisso, Criatividade, Profissionalismo, Confiança e Satisfação do Cliente.
              </p>
            </div>
          </div>
        </div>
      </section>




      {/* 📱 Mobile App Promo Section — hidden inside the native app */}
      {!isNative() && (
      <section className="py-20 bg-gradient-to-br from-rosa-50/40 via-white to-dourado-50/20 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Phone Mockup Representation — realistic preview of the real app */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative w-[290px] h-[590px] bg-gray-950 rounded-[44px] p-2.5 shadow-2xl ring-1 ring-black/10">
                {/* Side buttons */}
                <div className="absolute -left-1 top-28 w-1 h-12 bg-gray-800 rounded-l-lg" />
                <div className="absolute -left-1 top-44 w-1 h-16 bg-gray-800 rounded-l-lg" />
                <div className="absolute -right-1 top-36 w-1 h-20 bg-gray-800 rounded-r-lg" />

                {/* Screen */}
                <div className="relative w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col">
                  {/* Dynamic Island / notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-950 rounded-full z-30" />

                  {/* Status bar */}
                  <div className="bg-rosa-500 pt-3 pb-1 px-5 flex items-center justify-between text-white text-[9px] font-semibold z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Hero header */}
                  <div className="bg-gradient-to-br from-rosa-500 to-rosa-400 px-4 pt-3 pb-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-sm">🧁</div>
                      <span className="text-[11px] font-bold">Mundo de Doces da GG</span>
                    </div>
                    <h5 className="text-[15px] font-extrabold leading-tight">Sabores para cada<br/>celebração especial ✨</h5>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-3 py-3 space-y-2.5 overflow-hidden bg-gray-50 text-left -mt-2 rounded-t-2xl">
                    {/* Services grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-lg mb-1">🎂</div>
                        <h6 className="font-bold text-[9px] text-gray-800">Bolo Aniversário</h6>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rosa-50 text-rosa-600 text-[7px] font-bold">Encomendar →</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-lg mb-1">🧁</div>
                        <h6 className="font-bold text-[9px] text-gray-800">Cupcakes</h6>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rosa-50 text-rosa-600 text-[7px] font-bold">Encomendar →</span>
                      </div>
                    </div>

                    {/* Tracking card */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-gray-700">Encomenda MDG-A1B2</span>
                        <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">Em Preparação</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-[65%] bg-gradient-to-r from-rosa-400 to-rosa-500 rounded-full" />
                      </div>
                      <div className="flex justify-between text-[6px] text-gray-400 font-medium pt-0.5">
                        <span>Recebida</span><span>Confirmada</span><span className="text-rosa-500 font-bold">Preparação</span><span>Pronta</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation (just like the real app) */}
                  <div className="bg-white border-t border-gray-100 px-2 py-2 flex items-center justify-around">
                    <div className="flex flex-col items-center gap-0.5 text-rosa-500">
                      <span className="text-[13px]">🏠</span>
                      <span className="text-[6px] font-bold">Início</span>
                      <div className="w-4 h-0.5 rounded-full bg-rosa-500" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-300">
                      <span className="text-[13px] grayscale opacity-50">🛍️</span>
                      <span className="text-[6px] font-medium text-gray-400">Encomendar</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-300">
                      <span className="text-[13px] grayscale opacity-50">🔍</span>
                      <span className="text-[6px] font-medium text-gray-400">Consultar</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-300">
                      <span className="text-[13px] grayscale opacity-50">⚙️</span>
                      <span className="text-[6px] font-medium text-gray-400">Definições</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Benefits */}
            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Aplicativo Oficial
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Mundo de Doces da GG no seu Telemóvel!
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Descarregue a nossa aplicação oficial para Android e desfrute da melhor e mais rápida experiência de confeitaria em Angola, diretamente no seu smartphone.
              </p>

              {/* Benefits list */}
              <div className="space-y-4 pt-2">
                {[
                  { title: '⚡ Velocidade Máxima', desc: 'Navegação fluida e carregamento ultra-rápido dos produtos.' },
                  { title: '🔔 Notificações em Tempo Real', desc: 'Receba alertas instantâneos sempre que o estado da sua encomenda for atualizado.' },
                  { title: '📦 Rastreio com 1 Toque', desc: 'Consulte o andamento do seu pedido instantaneamente sem precisar de abrir o navegador.' },
                ].map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-rosa-50 text-rosa-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">{b.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download CTA Button */}
              <div className="pt-4 space-y-2">
                <a
                  href="/app-release.apk"
                  download="Mundo_de_Doces_da_GG.apk"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rosa-400 to-rosa-500 text-white font-semibold text-sm hover:from-rosa-500 hover:to-rosa-600 shadow-lg shadow-rosa-200 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  Descarregar Aplicativo Android (.APK)
                </a>
                <p className="text-[10px] text-gray-400 pl-2">
                  * Compatível com qualquer telemóvel Android. Instalação rápida, leve e 100% segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 💳 Payment Methods Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Pagamentos</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">Métodos de Pagamento</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Aceitamos várias formas de pagamento para tornar a sua encomenda simples e segura.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📱',
                title: 'Multicaixa Express',
                desc: 'Pagamento rápido e seguro através da app Multicaixa Express.',
                color: 'from-rosa-50 to-rosa-100/40',
              },
              {
                icon: '🏦',
                title: 'Transferência Bancária',
                desc: 'Transferência ou depósito direto para a nossa conta bancária (IBAN).',
                color: 'from-dourado-50 to-dourado-100/40',
              },
              {
                icon: '💵',
                title: 'Numerário (Cash)',
                desc: 'Pagamento em dinheiro na entrega ou no levantamento da encomenda.',
                color: 'from-green-50 to-green-100/40',
              },
              {
                icon: '🧾',
                title: 'Referência de Pagamento',
                desc: 'Pague através de referência multicaixa em qualquer ATM.',
                color: 'from-blue-50 to-blue-100/40',
              },
            ].map((method, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${method.color} rounded-3xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
                  {method.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2">{method.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{method.desc}</p>
              </div>
            ))}
          </div>

          {/* Reassurance note */}
          <div className="mt-10 max-w-2xl mx-auto bg-rosa-50/50 border border-rosa-100 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Shield className="w-5 h-5 text-rosa-500" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Pagamento 100% seguro.</strong> Os detalhes de pagamento são confirmados diretamente com a nossa gestão após realizar a sua encomenda.
            </p>
          </div>
        </div>
      </section>

      {/* 💰 Google AdSense Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseAd slot="home-bottom-ad" />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rosa-500 to-rosa-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para tornar a sua celebração especial?
          </h2>
          <p className="text-rosa-100 mb-8 text-lg">
            Faça já a sua encomenda ou solicite um orçamento personalizado.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/encomendar"
              className="px-8 py-4 rounded-full text-sm font-semibold bg-white text-rosa-600 hover:bg-gray-50 shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Fazer Encomenda
            </Link>
            <Link
              to="/contato"
              className="px-8 py-4 rounded-full text-sm font-semibold border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
            >
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
