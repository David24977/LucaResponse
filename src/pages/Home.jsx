import { useState, useRef, useEffect } from "react";
import QueryInput from "../components/QueryInput";
import TypingText from "../components/TypingText";
import { queryAI } from "../api/aiApi";

function Home() {

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("luca_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);

  // dark mode persistente
 useEffect(() => {
  localStorage.setItem("dark_mode", darkMode);

  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [darkMode]);

  useEffect(() => {
    localStorage.setItem("dark_mode", darkMode);

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // guardar mensajes
  useEffect(() => {
    localStorage.setItem("luca_messages", JSON.stringify(messages));
  }, [messages]);

  // scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuery = async (query) => {

    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const result = await queryAI(query);

      setMessages(prev => [
        ...prev,
        { role: "ai", text: result.response }
      ]);

    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Error contacting AI service." }
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("luca_messages");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-800 shadow">

        <div className="flex items-center gap-3">
          <img src="/favicon.ico?v=2" className="w-8 h-8 object-contain" />
          <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
            LucaResponse
          </h1>
        </div>

        <div className="flex gap-2 md:gap-3">

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-2 md:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-2 md:px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-lg transition"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[90%] md:max-w-xl p-4 rounded-lg animate-fadeIn ${
              msg.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow"
            }`}
          >

            {msg.role === "ai" && index === messages.length - 1 ? (
              <TypingText text={msg.text} />
            ) : (
              <p className="whitespace-pre-line">{msg.text}</p>
            )}

            {msg.role === "ai" && (
              <button
                onClick={() => copyToClipboard(msg.text)}
                className="text-xs mt-2 text-gray-400 hover:text-gray-600"
              >
                Copy
              </button>
            )}

          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 animate-pulse">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}
      <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t flex justify-center w-full">
        <QueryInput onQuery={handleQuery} />
      </div>

    </div>
  );
}

export default Home;