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
  const [activeChatId, setActiveChatId] = useState(() => {
  const savedId = localStorage.getItem("luca_active_chat_id");
  if (savedId) return savedId;
  // Si no existe, generamos uno manualmente que no falle nunca
  return localStorage.getItem("luca_active_chat_id") || getUUID();
});
  
const [allChats, setAllChats] = useState(() => chatService.getAllChats());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  const messagesEndRef = useRef(null);

  const currentMessages = useMemo(() => {
    return allChats[activeChatId]?.messages || [];
  }, [allChats, activeChatId]);

  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("luca_active_chat_id", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
      const aiMsg = { role: "ai", text: result.response || "No response received.", isNew: true };
      setAllChats(chatService.saveChat(activeChatId, [...currentMessages, userMsg, aiMsg]));
    } catch {
      const errorMsg = { role: "ai", text: "Error de conexión con la IA.", isNew: false };
      setAllChats(chatService.saveChat(activeChatId, [...currentMessages, userMsg, errorMsg]));
    } finally {
      setLoading(false);
    }
  };

 const handleCreateNewChat = () => {
  resetConversation(); 
  // Generador manual para nuevos chats
  const newId = getUUID;
  setActiveChatId(newId);
  if (window.innerWidth < 768) setIsSidebarOpen(false);
};

  const handleDeleteChat = (id) => {
    const updated = chatService.deleteChat(id);
    setAllChats(updated);
    if (id === activeChatId) handleCreateNewChat();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      
      <Sidebar 
        allChats={allChats}
        activeChatId={activeChatId}
        onChatSelect={setActiveChatId}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* CONTENEDOR DE CONTENIDO: Se desplaza si el Sidebar está abierto en escritorio */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300 ${
        isSidebarOpen ? "md:ml-72" : "ml-0"
      }`}>
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md dark:border-gray-800 z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            )}
            <h1 className="text-xl font-bold dark:text-white tracking-tighter">
              Luca<span className="text-blue-500">Response</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
            >
              + <span className="hidden sm:inline">Nuevo Chat</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ÁREA DE MENSAJES */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 pb-40">
            {currentMessages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <img src="/favicon.ico?v=2" alt="Luca" className="w-10 h-10 opacity-80" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Hola, soy Luca</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">¿Qué vamos a crear hoy?</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={`${activeChatId}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                    msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white dark:bg-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700"
                  }`}>
                    {msg.role === "ai" && msg.isNew ? (
                      <SmartTypingText text={msg.text} speed={10} />
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* FEEDBACK CARGA */}
            {loading && (
              <div className="flex gap-3 justify-start animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-sm text-sm text-gray-500 italic">
                  Luca está pensando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* INPUT */}
        <footer className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-gray-50 dark:via-gray-950 to-transparent z-20">
          <div className="max-w-4xl mx-auto">
            <QueryInput onQuery={handleQuery} disabled={loading} />
            <p className="text-[10px] text-center text-gray-400 mt-4 font-mono tracking-widest">
              LOCAL_DB_ACTIVE | SESSION: {activeChatId.slice(0,8)}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;