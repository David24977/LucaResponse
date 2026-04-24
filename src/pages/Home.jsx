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
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
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
      const result = await queryAI(cleanQuery, activeChatId, currentMessages); 
      
      const aiText = result.response || "Luca no puede responder.";
      const aiMsgId = Date.now() + 1;
      const aiMsg = { role: "ai", text: aiText, id: aiMsgId };
      
      const chatFinal = chatService.saveChat(activeChatId, [...currentMessages, userMsg, aiMsg]);
      setAllChats(chatFinal);
      setLoading(false);
      setAnimatingMsgId(aiMsgId);
      
    } catch (e) {
      console.error("Error de conexión:", e);
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

  const handleRenameChat = (id, newTitle) => {
    const updated = chatService.renameChat(id, newTitle);
    setAllChats(updated);
  };

  const handleCopy = async (text, index) => {
    try {
      const messageElement = document.getElementById(`msg-${index}`);
      if (!messageElement) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(messageElement);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden relative text-gray-900 dark:text-gray-100">
      <Sidebar 
        allChats={allChats} 
        activeChatId={activeChatId}
        onChatSelect={handleSelectChat} 
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : "ml-0"}`}>
        <header className="sticky top-0 h-14 flex items-center justify-between px-4 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md dark:border-gray-800 z-50 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-lg font-bold tracking-tighter italic">Luca<span className="text-blue-600 font-black not-italic">Response</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
            </button>
            <button onClick={handleCreateNewChat} className="bg-red-600 text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow-md hover:bg-red-700 uppercase tracking-tighter transition-colors">New Chat</button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-lg p-1 hover:scale-110 transition-transform">{darkMode ? "☀️" : "🌙"}</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-4">
            {currentMessages.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800/50 shadow-sm transition-transform hover:scale-105 duration-300">
                  <img src="/favicon.ico?v=2" alt="Luca" className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black dark:text-white tracking-tighter">Hola, soy Luca</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-medium max-w-[250px] mx-auto leading-tight">¿En qué te puedo ayudar?</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={msg.id || index} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 self-end mb-1">
                      <img src="/favicon.ico?v=2" className="w-5 h-5" alt="L" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    {/* AQUÍ ESTÁ EL CAMBIO: Se añade 'prose dark:prose-invert' al contenedor de la IA */}
                    <div id={`msg-${index}`} className={`px-3 py-2.5 rounded-2xl text-[13px] shadow-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none prose dark:prose-invert"
                    }`}>
                      {msg.role === "ai" && animatingMsgId === msg.id ? (
                        <SmartTypingText text={msg.text} speed={6} onComplete={() => setAnimatingMsgId(null)} />
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                    {msg.role === "ai" && (
                      <button 
                        onClick={() => handleCopy(msg.text, index)} 
                        className="text-[9px] font-bold text-gray-400 hover:text-blue-500 ml-1 uppercase transition-colors"
                      >
                        {copiedIndex === index ? "Copiado" : "Copiar"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex gap-3 justify-start animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0 self-end mb-1">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-[10px] text-blue-500 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border dark:border-gray-700 shadow-sm animate-pulse">
                  LUCA ESTÁ PENSANDO...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        <footer className="p-4 bg-transparent">
          <div className="max-w-2xl mx-auto">
            <QueryInput onQuery={handleQuery} disabled={loading} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;