import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QueryInput from "../components/QueryInput";
import SmartTypingText from "../components/SmartTypingText";
import Sidebar from "../components/Sidebar";
import { queryAI, resetConversation } from "../api/aiApi";
import { chatService } from "../utils/chatService";
import { getUUID } from "../utils/uuid";

function Home() {
  const [activeChatId, setActiveChatId] = useState(() => localStorage.getItem("luca_active_chat_id") || getUUID());
  const [allChats, setAllChats] = useState(() => chatService.getAllChats());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("dark_mode")) || false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [animatingMsgId, setAnimatingMsgId] = useState(null);

  const messagesEndRef = useRef(null);

  // Memorizamos los mensajes para evitar re-renders y avisos de ESLint
  const currentMessages = useMemo(() => {
    return allChats[activeChatId]?.messages || [];
  }, [allChats, activeChatId]);

  // Sincronización de modo oscuro
  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Sincronización de ID de chat activo
  useEffect(() => {
    localStorage.setItem("luca_active_chat_id", activeChatId);
  }, [activeChatId]);

  // Control de scroll automático al final del chat
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMessages.length, loading, animatingMsgId]);

  const handleQuery = async (query) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || loading) return;

    setLoading(true);
    setAnimatingMsgId(null);
    
    const userMsg = { role: "user", text: cleanQuery, id: Date.now() };
    const updatedWithUser = chatService.saveChat(activeChatId, [...currentMessages, userMsg]);
    setAllChats(updatedWithUser);

    try {
      const result = await queryAI(cleanQuery, activeChatId);
      const aiText = result.response || "No pude obtener una respuesta.";
      const aiMsgId = Date.now() + 1;
      const aiMsg = { role: "ai", text: aiText, id: aiMsgId };
      
      const chatFinal = chatService.saveChat(activeChatId, [...currentMessages, userMsg, aiMsg]);
      setAllChats(chatFinal);
      
      setLoading(false); // Libera el estado pensando
      setAnimatingMsgId(aiMsgId); // Activa el efecto typing
      
    } catch (e) {
      console.error("Error en handleQuery:", e);
      setLoading(false);
    }
  };

  const handleSelectChat = (id) => {
    setAnimatingMsgId(null);
    setLoading(false);
    setActiveChatId(id);
  };

  const handleCreateNewChat = () => {
    resetConversation();
    const newId = getUUID();
    setAnimatingMsgId(null);
    setLoading(false);
    setActiveChatId(newId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    const updated = chatService.deleteChat(id);
    setAllChats(updated);
    if (id === activeChatId) handleCreateNewChat();
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      <Sidebar 
        allChats={allChats} activeChatId={activeChatId}
        onChatSelect={handleSelectChat} onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : "ml-0"}`}>
        
        {/* Header con UX mejorada (fijo) */}
        <header className="sticky top-0 h-16 flex items-center justify-between px-4 md:px-6 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md dark:border-gray-800 z-50 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-xl font-bold dark:text-white tracking-tighter">Luca<span className="text-blue-600 font-black">Response</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.reload()} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
            </button>
            <button onClick={handleCreateNewChat} className="bg-blue-600 text-white text-[10px] font-black py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all active:scale-95">Nuevo Chat</button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">{darkMode ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* Zona de Chat */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar z-10">
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            {currentMessages.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-blue-100 dark:border-blue-800/50">
                  <img src="/favicon.ico?v=2" alt="Luca" className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black dark:text-white tracking-tight">Hola, soy Luca.</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-base font-medium">¿En qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={msg.id || index} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  {msg.role === "ai" && (
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 self-end mb-1 shadow-sm">
                      <img src="/favicon.ico?v=2" className="w-6 h-6" alt="L" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                    <div className={`p-4 rounded-3xl shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none"}`}>
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words leading-relaxed">
                        {msg.role === "ai" && animatingMsgId === msg.id ? (
                          <SmartTypingText text={msg.text} speed={8} onComplete={() => setAnimatingMsgId(null)} />
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                    {msg.role === "ai" && (
                      <button onClick={() => handleCopy(msg.text, index)} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors ml-2 w-fit uppercase tracking-tighter">
                        {copiedIndex === index ? <span className="text-green-500 italic font-black">¡Copiado!</span> : "📋 Copiar respuesta"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Pensando... (Ajustado para salir siempre que cargue) */}
            {loading && (
              <div className="flex gap-4 justify-start animate-fadeIn">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 self-end mb-1">
                  <img src="/favicon.ico?v=2" className="w-6 h-6 opacity-40 grayscale" alt="L" />
                </div>
                <div className="flex gap-2 items-center text-[10px] text-blue-500 font-black uppercase tracking-widest px-5 py-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  Luca está pensando
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        <footer className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-gray-50 dark:via-gray-950 to-transparent z-40">
          <div className="max-w-3xl mx-auto">
            <QueryInput onQuery={handleQuery} disabled={loading} />
            <p className="text-[9px] text-center text-gray-400 mt-3 font-bold uppercase tracking-tight">LucaResponse AI - Memoria Local</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;