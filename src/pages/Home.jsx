import { useState, useRef, useEffect, useMemo } from "react";
import QueryInput from "../components/QueryInput";
import SmartTypingText from "../components/SmartTypingText"; 
import { queryAI, resetConversation } from "../api/aiApi";

function Home() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("luca_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  const messagesEndRef = useRef(null);

  // Dark mode
  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Guardar mensajes
  useEffect(() => {
    const messagesToSave = messages.map(msg => ({
    role: msg.role,
    text: msg.text
  }));
    localStorage.setItem("luca_messages", JSON.stringify(messagesToSave));
  }, [messages]);

  // Scroll automático optimizado para móvil
  useEffect(() => {
    // Detectamos si es móvil de forma simple pero estable
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // TRUCO: En móvil usas scroll 'auto' (instantáneo) para no saturar la CPU
    // mientras se anima el texto. En laptop usas 'smooth' para mejor UX.
    messagesEndRef.current?.scrollIntoView({ 
      behavior: isMobile ? "auto" : "smooth",
      block: "end" // Asegura que el final del mensaje sea visible
    });
  }, [messages, loading]); // Se dispara cuando cambian los mensajes o carga

  const handleQuery = async (query) => {
  const cleanQuery = query.trim();
  if (!cleanQuery || loading) return;

  // 1. Limpiamos la marca 'isNew' de todos los mensajes anteriores 
  // y añadimos el nuevo mensaje del usuario
  setMessages((prev) => [
    ...prev.map(msg => ({ ...msg, isNew: false })), // El truco está aquí
    { role: "user", text: cleanQuery }
  ]);
  
  setLoading(true);

  try {
    const result = await queryAI(cleanQuery);
    // 2. Añadimos la respuesta de la IA con isNew: true
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: result.response || "No response received.", isNew: true },
    ]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "Error contacting AI service. Please try again.", isNew: false },
    ]);
  } finally {
    setLoading(false);
  }
};
  const clearChat = () => {
    resetConversation();
    setMessages([]);
    localStorage.removeItem("luca_messages");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  // Memorizamos el número de mensajes para usarlo como key estable
  const messagesCount = useMemo(() => messages.length, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* HEADER: Con efecto cristal (backdrop-blur) y diseño profesional */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 group">
            <img
              src="/favicon.ico?v=2"
              alt="LucaResponse logo"
              className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white md:text-2xl">
                Luca<span className="text-blue-600 dark:text-blue-500">Response</span>
              </h1>
              <p className="hidden text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:block">
                AI Assistant • Spring Boot + Groq
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {messagesCount > 0 && (
              <button
                onClick={clearChat}
                className="rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
              >
                New Chat
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl bg-gray-100 p-2.5 dark:bg-gray-800 text-lg hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* CHAT MAIN: Con padding inferior para el footer fixed y clase para el CSS */}
      <main className="flex-1 overflow-y-auto chat-container pb-40 md:pb-36">
        <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 px-4 py-8 md:px-6">
          
          {messagesCount === 0 && (
            <div className="text-center pt-16 pb-10 animate-fadeIn">
              <div className="inline-flex p-4 rounded-3xl bg-blue-50 dark:bg-blue-950 mb-6">
                <img src="/favicon.ico?v=2" alt="Luca Logo" className="h-16 w-16 opacity-90" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Hola, soy Luca</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">¿En qué puedo ayudarte hoy? Hazme cualquier pregunta y usaré la IA para responderte.</p>
            </div>
          )}

          {messages.map((msg, index) => {
           const shouldAnimate = msg.role === "ai" && msg.isNew;

            return (
              <div
                key={`${index}-${messagesCount}`}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                {msg.role === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <img src="/favicon.ico?v=2" alt="AI" className="h-5 w-5 opacity-90" />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-5 py-3.5 shadow-sm max-w-[85%] md:max-w-[75%] ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 dark:bg-gray-800/80 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700/50"
                  }`}
                >
                  {shouldAnimate ? (
                    // Solo animamos el último mensaje de la IA. Velocidad 30ms.
                    <SmartTypingText text={msg.text} speed={30} />
                  ) : (
                    // Mensajes estáticos (historial) o del usuario.
                    <p className="whitespace-pre-line leading-relaxed text-sm md:text-base">
                      {msg.text}
                    </p>
                  )}

                  {msg.role === "ai" && (
                    <div className="mt-3 pt-2 text-right border-t border-gray-100 dark:border-gray-700/50">
                      <button
                        onClick={() => copyToClipboard(msg.text)}
                        className="text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        [ Copy Response ]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* LOADER: Diseño moderno y minimalista */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 animate-spin"></div>
              </div>
              <div className="px-5 py-3.5 bg-white dark:bg-gray-800/80 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm text-gray-500 dark:text-gray-400 italic">
                Luca está pensando...
              </div>
            </div>
          )}
          
          {/* Div espaciador para el scroll automático */}
          <div ref={messagesEndRef} className="h-1 scroll-spacer" />
        </div>
      </main>

      {/* INPUT: Fixed abajo con un degradado de fondo para integrarse */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent dark:from-gray-950 dark:via-gray-950/90 px-4 pt-6 pb-6 md:pb-8">
        <div className="mx-auto max-w-4xl">
          <QueryInput onQuery={handleQuery} disabled={loading} />
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 font-medium tracking-wide">
            Luca AI LLM v2.1 | Built with Groq & Spring Boot
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;