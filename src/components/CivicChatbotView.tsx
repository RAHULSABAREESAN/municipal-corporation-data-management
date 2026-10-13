import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  Zap,
  Brain,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingSources?: Array<{
    title: string;
    uri: string;
    snippet?: string;
  }>;
}

interface Props {
  currentLang: Language;
}

export const CivicChatbotView: React.FC<Props> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Vanakkam! I am the CivicLoop AI Municipal Assistant for Greater Chennai Corporation. You can query me on chronic flood recurrence hotspots, hydrological root-cause hypotheses, ward inspection protocols, or search nearby Chennai relief centers using Google Maps Grounding.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bot Role
  const [selectedRole, setSelectedRole] = useState<'hydrologist' | 'citizen_guide' | 'ward_officer'>('hydrologist');

  // Model tier per instructions:
  // - gemini-3.1-pro-preview for complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  const [modelTier, setModelTier] = useState<'fast' | 'general' | 'complex'>('general');

  // Maps Grounding toggle
  const [enableMapsGrounding, setEnableMapsGrounding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedMessages = [
      ...messages,
      {
        id: userMsgId,
        role: 'user' as const,
        content: userText,
        timestamp: userTimestamp,
      },
    ];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      if (enableMapsGrounding) {
        // Query Maps Grounding endpoint
        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userText,
            latitude: 13.025,
            longitude: 80.23,
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: data.text || 'Location intelligence retrieved.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed || 'gemini-3.5-flash (Google Maps)',
            groundingSources: data.sources || [],
          },
        ]);
      } else {
        // Multi-turn Gemini Chat endpoint
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            role: selectedRole,
            modelTier,
          }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: data.reply || 'No response generated.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed,
          },
        ]);
      }
    } catch (err) {
      console.error('Chat send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'Error communicating with Gemini service. Please verify network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Conversation history reset. How can I assist you with Chennai civic drainage intelligence?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[740px] bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-sm">CivicLoop Gemini Assistant</h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Multi-Turn Intelligence
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Conversational reasoning with role specializations and Google Maps grounding
            </p>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="hydrologist">🌊 Hydrology Specialist</option>
            <option value="ward_officer">📋 Ward Executive Engineer</option>
            <option value="citizen_guide">🤝 Citizen Assistant</option>
          </select>

          {/* Model tier selector */}
          <select
            value={modelTier}
            onChange={(e) => setModelTier(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="general">Gemini 3.5 Flash</option>
            <option value="complex">Gemini 3.1 Pro Preview</option>
            <option value="fast">Gemini 3.1 Flash Lite</option>
          </select>

          {/* Google Maps Grounding Toggle */}
          <button
            type="button"
            onClick={() => setEnableMapsGrounding(!enableMapsGrounding)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              enableMapsGrounding
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title="Ground answers with Google Maps places & locations"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Grounding</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F6F8FC]/50 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-3.5 space-y-1.5 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 pb-1 border-b border-black/5">
                <span className="font-semibold">
                  {msg.role === 'user' ? 'You' : 'CivicLoop AI'}
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

              {/* Grounding sources if returned by Maps Grounding */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                  <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Google Maps Grounding Sources:</span>
                  </div>
                  <div className="space-y-1">
                    {msg.groundingSources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[11px] text-indigo-600 hover:underline bg-gray-50 p-1.5 rounded border border-gray-100"
                      >
                        <div className="font-semibold">{source.title}</div>
                        {source.snippet && (
                          <div className="text-[10px] text-gray-500 line-clamp-1">
                            {source.snippet}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 bg-white p-3 rounded-lg border border-gray-200 max-w-xs shadow-2xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gemini is synthesizing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            enableMapsGrounding
              ? 'Ask for locations, relief shelters, or water pump depots with Google Maps...'
              : 'Ask Gemini about Velachery drainage bottlenecks, Buckingham canal backpressure...'
          }
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
