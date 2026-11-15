import { Instagram, MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { recordAnalyticsEvent } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';
import { SafeImage } from '../common/SafeImage';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  showWhatsapp?: boolean;
  showInstagram?: boolean;
}

export function VirtualAssistantWidget() {
  const { settings, empreendimentos } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: settings.assistantGreeting,
      showWhatsapp: true,
    },
  ]);

  if (location.pathname.startsWith('/admin') || !settings.assistantEnabled) {
    return null;
  }

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Conversei com a assistente no site e gostaria de fazer uma simulação.'
  );

  const generateReply = (userText: string): ChatMessage => {
    const lower = userText.toLowerCase();

    // Check matching admin-configured FAQs first
    const matchedFaq = settings.assistantFaqs.find((faq) =>
      faq.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    );
    if (matchedFaq) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: matchedFaq.answer,
        showWhatsapp: matchedFaq.suggestWhatsapp ?? true,
        showInstagram: matchedFaq.suggestInstagram ?? false,
      };
    }

    // Check matching empreendimento names
    const matchedEmp = empreendimentos.find((emp) =>
      lower.includes(emp.name.toLowerCase()) ||
      (emp.neighborhood && lower.includes(emp.neighborhood.toLowerCase()))
    );
    if (matchedEmp) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `${matchedEmp.name} fica em ${matchedEmp.neighborhood ? `${matchedEmp.neighborhood}, ` : ''}${matchedEmp.city}. ${matchedEmp.description.slice(0, 180)}... Deseja confirmar disponibilidade e simular direto com Rodolfo no WhatsApp?`,
        showWhatsapp: true,
        showInstagram: true,
      };
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: 'Posso te ajudar com informações sobre Aruna Patamares, Vila Laura, Sol do Mediterrâneo, uso do FGTS ou simulação sem compromisso. Para um cálculo personalizado com sua renda, fale diretamente com Rodolfo Monteiro no WhatsApp.',
      showWhatsapp: true,
      showInstagram: true,
    };
  };

  const handleSend = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    const replyMsg = generateReply(trimmed);
    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInput('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      void recordAnalyticsEvent('assistant_open', location.pathname, settings.assistantName);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#0B1F3A] px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/30 bg-slate-800 shrink-0">
                  <SafeImage
                    src={settings.assistantAvatarUrl}
                    alt={settings.assistantName}
                    className="h-full w-full object-cover"
                    fallbackTitle="AT"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {settings.assistantName}
                  </p>
                  <p className="text-xs text-slate-300">
                    Atendimento Rodolfo Monteiro
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar assistente"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-72 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.sender === 'user' ? 'flex justify-end' : 'flex flex-col items-start gap-2'
                  }
                >
                  <div
                    className={
                      msg.sender === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-[#C8102E] px-3.5 py-2.5 text-xs leading-relaxed text-white'
                        : 'max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-700'
                    }
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'assistant' && (msg.showWhatsapp || msg.showInstagram) && (
                    <div className="flex flex-wrap gap-2">
                      {msg.showWhatsapp && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            void recordAnalyticsEvent('whatsapp_click', location.pathname, 'Assistente WhatsApp')
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1FB858]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Ir para o WhatsApp</span>
                        </a>
                      )}
                      {msg.showInstagram && (
                        <a
                          href={settings.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            void recordAnalyticsEvent('instagram_click', location.pathname, 'Assistente Instagram')
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Instagram className="h-3.5 w-3.5 text-[#E1306C]" />
                          <span>Ver Instagram</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate('/simulacao');
                        }}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0B1F3A] hover:bg-slate-50"
                      >
                        Abrir Simulador
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Topics */}
            <div className="flex flex-wrap gap-1.5 border-t border-slate-200 bg-white px-3 py-2">
              {settings.assistantFaqs.slice(0, 3).map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleSend(faq.question)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors"
                >
                  {faq.question}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida (ex: FGTS, Aruna...)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Enviar pergunta"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1F3A] text-white hover:bg-[#132C4E]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left-Side Humanized Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Abrir ${settings.assistantName}`}
        className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3.5 shadow-lg transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E]"
      >
        <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 shrink-0">
          <SafeImage
            src={settings.assistantAvatarUrl}
            alt={settings.assistantName}
            className="h-full w-full object-cover"
            fallbackTitle="AT"
          />
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-[#0B1F3A] whitespace-nowrap">
          {settings.assistantName}
        </span>
      </button>
    </div>
  );
}
