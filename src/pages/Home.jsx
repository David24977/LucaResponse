import { useState, useRef, useEffect } from "react";
import QueryInput from "../components/QueryInput";
import SmartTypingText from "../components/SmartTypingText"; 
import { queryAI } from "../api/aiApi";

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
    localStorage.setItem("luca_messages", JSON.stringify(messages));
  }, [messages]);

  // Scroll automático optimizado
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    // En móviles usamos 'auto' para ahorrar batería y CPU durante la animación
    messagesEndRef.current?.scrollIntoView({ 
      behavior: isMobile ? "auto" : "smooth",
      block: "end" 
    });
  }, [messages, loading]);

  const handleQuery = async (query) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: cleanQuery }]);
    setLoading(true);

    try {
      const result = await queryAI(cleanQuery);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: result.response || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error contacting AI service. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico?v=2" className="h-8 w-8" alt="Logo" />
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">LucaResponse</h1>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button onClick={clearChat} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white">
                Clear
              </button>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-lg bg-gray-200 p-2 dark:bg-gray-700">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 px-4 py-6">
          {messages.map((msg, index) => {
            const isLastAiMessage = msg.role === "ai" && index === messages.length - 1;

            return (
              <div
                key={`${index}-${messages.length}`}
                className={`rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "ml-auto max-w-[85%] bg-blue-600 text-white rounded-br-none"
                    : "mr-auto w-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700"
                }`}
              >
                {isLastAiMessage ? (
                  // Solo animamos el último mensaje de la IA
                  <SmartTypingText text={msg.text} />
                ) : (
                  // Mensajes estáticos (historial)
                  <p className="whitespace-pre-line leading-relaxed break-words text-sm md:text-base">
                    {msg.text}
                  </p>
                )}

                {msg.role === "ai" && (
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      [ Copy ]
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="mr-auto flex flex-col gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-400">LUCA THINKING</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent dark:from-gray-900 dark:via-gray-900 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <QueryInput onQuery={handleQuery} disabled={loading} />
          <p className="text-[10px] text-center text-gray-400 mt-2">Luca API LLM - v2.0</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;