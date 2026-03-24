import { useState, useRef, useEffect } from "react";
import QueryInput from "../components/QueryInput";
import TypingText from "../components/TypingText";
import ProgressiveText from "../components/ProgressiveText";
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

  // 🌙 Dark mode
  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 💾 Guardar mensajes
  useEffect(() => {
    localStorage.setItem("luca_messages", JSON.stringify(messages));
  }, [messages]);

  // 📜 Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        {
          role: "ai",
          text: "Error contacting AI service. Please try again.",
        },
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
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">

          <div className="flex items-center gap-3">
            <img src="/favicon.ico?v=2" className="h-8 w-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white md:text-xl">
                LucaResponse
              </h1>
              <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                AI-powered assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-lg bg-gray-200 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-4 px-4 py-6">

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const isMobile = window.innerWidth <= 1024;

            return (
              <div
                key={index}
                className={`rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "ml-auto max-w-[90%] bg-blue-500 text-white"
                    : "mr-auto w-full max-w-3xl bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {msg.role === "ai" && isLastMessage ? (
                  isMobile ? (
                    <ProgressiveText key={msg.text} text={msg.text} />
                  ) : (
                    <TypingText key={msg.text} text={msg.text} />
                  )
                ) : (
                  <p className="whitespace-pre-line">{msg.text}</p>
                )}

                {msg.role === "ai" && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* LOADER */}
          {loading && (
            <div className="mr-auto w-full max-w-3xl rounded-2xl bg-white p-4 text-gray-500 dark:bg-gray-800">
              <div className="mb-2 text-sm">Thinking...</div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT */}
      <footer className="border-t bg-white dark:bg-gray-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <QueryInput onQuery={handleQuery} disabled={loading} />
        </div>
      </footer>

    </div>
  );
}

export default Home;