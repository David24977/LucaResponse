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

  const messagesEndRef = useRef(null);

 const currentMessages = useMemo(() => {
  const messages = allChats[activeChatId]?.messages || [];
  // Forzamos que lo que viene del historial no tenga el flag isNew
  // Esto evita que al cambiar entre chats del sidebar se active el typing
  return messages.map(m => ({ ...m, isNew: false }));
}, [allChats, activeChatId]);

  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("luca_active_chat_id", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, loading]);

  const handleQuery = async (query) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || loading) return;
    const userMsg = { role: "user", text: cleanQuery, isNew: false };
    const updatedWithUser = chatService.saveChat(activeChatId, [...currentMessages, userMsg]);
    setAllChats(updatedWithUser);
    setLoading(true);
    try {
      const result = await queryAI(cleanQuery, activeChatId);
      const aiMsg = { role: "ai", text: result.response || "...", isNew: true };
      const historicMessages = currentMessages.map(m => ({ ...m, isNew: false }));
      const updatedChats = chatService.saveChat(activeChatId, [...historicMessages, userMsg, aiMsg]);

      setAllChats(updatedChats);
    } catch {
      const errorMsg = { role: "ai", text: "Error de conexión.", isNew: false };
      setAllChats(chatService.saveChat(activeChatId, [...currentMessages, userMsg, errorMsg]));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewChat = () => {
    resetConversation();
    const newId = getUUID();
    setActiveChatId(newId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    const updated = chatService.deleteChat(id);
    setAllChats(updated);
    if (id === activeChatId) handleCreateNewChat();
  };

  // Función para el botón de actualizar
  const handleReload = () => window.location.reload();

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      <Sidebar 
        allChats={allChats} activeChatId={activeChatId}
        onChatSelect={setActiveChatId} onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : "ml-0"}`}>
        
        {/* HEADER: Con efecto cristal y botón de actualizar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl dark:border-gray-800 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            )}
            <h1 className="text-xl font-bold dark:text-white tracking-tighter">
              Luca<span className="text-blue-500 font-black">Response</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Botón de Actualizar (Refrescar App) */}
            <button onClick={handleReload} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-500" title="Refrescar App">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
            </button>
            <button onClick={handleCreateNewChat} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              <span className="hidden sm:inline">NUEVO CHAT</span><span className="sm:hidden">+</span>
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ÁREA DE CHAT: Con min-h-[101%] para permitir ese ligero scroll elástico inicial */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10 bg-transparent">
          <div className="max-w-4xl mx-auto space-y-6 pb-40 min-h-[101%]">
            {currentMessages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <img src="/favicon.ico?v=2" alt="Luca" className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Hola, soy Luca.</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm font-medium">¿Listo para crear algo increíble hoy?</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={`${activeChatId}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                    msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/10" 
                    : "bg-white dark:bg-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700"
                  }`}>
                    {msg.role === "ai" && msg.isNew ? (
                      <SmartTypingText text={msg.text} speed={8} />
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Luca pensando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* FOOTER: Capa superior para el input */}
        <footer className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-gray-50/90 dark:via-gray-950/90 to-transparent z-40">
          <div className="max-w-4xl mx-auto">
            <QueryInput onQuery={handleQuery} disabled={loading} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;