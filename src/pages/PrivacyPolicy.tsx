import { Shield, Eye, Lock, RefreshCw, FileText } from 'lucide-react';
import AdSenseAd from '../components/AdSenseAd';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Políticas Legais</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 mt-2 mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Na Mundo de Doces da GG, a privacidade e a segurança dos dados dos nossos clientes são a nossa prioridade absoluta.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-8">
          
          {/* Introductory block */}
          <div className="flex items-start gap-3 bg-rosa-50/50 border border-rosa-100 rounded-2xl p-4 text-sm text-rosa-700">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Esta política de privacidade descreve como a <strong>Mundo de Doces da GG</strong> recolhe, utiliza, protege e processa as informações pessoais fornecidas pelos utilizadores ao acederem e utilizarem o nosso site.
            </p>
          </div>

          {/* 1. Recolha de dados */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-rosa-500" /> 1. Informações que Recolhemos
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Recolhemos dados essenciais apenas quando o utilizador realiza uma encomenda ou entra em contacto connosco de forma voluntária:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm pl-4 space-y-1.5">
              <li><strong>Dados Pessoais:</strong> Nome completo, endereço de e-mail e número de telefone.</li>
              <li><strong>Dados da Encomenda:</strong> Tipo de serviço selecionado, quantidade, data do evento, número de convidados, localização do evento e observações adicionais fornecidas pelo cliente.</li>
              <li><strong>Ficheiros de Log:</strong> Endereço IP do dispositivo, tipo de navegador, páginas de referência e data/hora dos acessos para fins de análise e segurança do servidor.</li>
            </ul>
          </div>

          {/* 2. Uso de dados */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rosa-500" /> 2. Como Utilizamos as Informações
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              As informações recolhidas são utilizadas estritamente para:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm pl-4 space-y-1.5">
              <li>Processar, fabricar e entregar as suas encomendas de confeitaria.</li>
              <li>Entrar em contacto direto (via WhatsApp, telefone ou e-mail) para confirmação de detalhes ou esclarecimento de dúvidas sobre os pedidos.</li>
              <li>Melhorar a experiência de navegação e funcionalidade do site.</li>
              <li>Garantir a segurança técnica da nossa plataforma contra fraudes ou acessos não autorizados.</li>
            </ul>
          </div>

          {/* 💰 AdSense specific clause - MANDATORY FOR APPROVAL */}
          <div className="space-y-3 p-6 bg-dourado-50/50 border border-dourado-100 rounded-2xl">
            <h2 className="text-xl font-bold text-dourado-800 flex items-center gap-2">
              ✨ 3. Google AdSense e Cookies de Terceiros
            </h2>
            <p className="text-dourado-900 text-sm leading-relaxed">
              Utilizamos o <strong>Google AdSense</strong> no nosso site para exibir anúncios publicitários.
            </p>
            <ul className="list-disc list-inside text-dourado-900 text-sm pl-4 space-y-1.5">
              <li>O Google, como fornecedor de terceiros, utiliza cookies (como o cookie DART) para veicular anúncios com base nas visitas anteriores dos utilizadores a este e a outros websites na Internet.</li>
              <li>Os utilizadores podem desativar a publicidade personalizada acedendo às definições de anúncios da sua conta Google ou visitando <a href="https://about.ads.google/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">about.ads.google</a>.</li>
            </ul>
          </div>

          {/* 4. Segurança dos dados */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-rosa-500" /> 4. Proteção e Partilha de Dados
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Adotamos medidas técnicas de segurança eletrónica rigorosas para proteger as suas informações. 
              <strong> Nunca vendemos, alugamos ou partilhamos os seus dados pessoais com empresas de terceiros para fins de marketing.</strong>
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Os dados de encomendas são armazenados de forma encriptada e segura através de infraestruturas de nuvem certificadas (Supabase e Firebase).
            </p>
          </div>

          {/* AdSense Ad Banner */}
          <AdSenseAd slot="privacy-bottom-ad" />

          {/* 5. Contacto */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rosa-500" /> 5. Consentimento e Contacto
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ao utilizar o nosso site, concorda explicitamente com a nossa Política de Privacidade. Reservamo-nos o direito de atualizar este documento periodicamente. Qualquer alteração será publicada nesta página com a data correspondente.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed pt-2">
              Se tiver qualquer dúvida ou quiser solicitar a eliminação dos seus dados registados, por favor contacte o nosso Encarregado de Proteção de Dados:
            </p>
            <p className="text-sm font-semibold text-rosa-600 pl-4 mt-1">
              ✉️ E-mail: ggsuportes@gmai.com <br />
              📞 WhatsApp: +244 927 718 735
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
