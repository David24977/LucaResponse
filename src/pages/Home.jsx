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

  const isMobileNow = () => window.innerWidth <= 1024;

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dark_mode", JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("luca_messages", JSON.stringify(messages));
  }, [messages]);

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
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico?v=2"
              alt="LucaResponse logo"
              className="h-8 w-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white md:text-xl">
                LucaResponse
              </h1>
              <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                AI-powered assistant built with Spring Boot and Groq
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 md:px-6">
          {messages.length === 0 && !loading && (
            <div className="mt-10 rounded-2xl bg-white p-6 text-center shadow dark:bg-gray-800">
              <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                Ask anything
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                You can ask about programming, history, science, calculations,
                or general knowledge.
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={index}
                className={`animate-fadeIn rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "ml-auto w-fit max-w-[90%] bg-blue-500 text-white md:max-w-[70%]"
                    : "mr-auto w-full max-w-3xl bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {msg.role === "ai" && isLastMessage ? (
                  isMobileNow() ? (
                    <ProgressiveText text={msg.text} />
                  ) : (
                    <TypingText text={msg.text} />
                  )
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                )}

                {msg.role === "ai" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="text-xs text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="mr-auto w-full max-w-3xl rounded-2xl bg-white p-4 text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              <div className="mb-2 text-sm font-medium">Thinking...</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 md:px-6 md:py-4">
          <QueryInput onQuery={handleQuery} disabled={loading} />
        </div>
      </footer>
    </div>
  );
}

export default Home;
