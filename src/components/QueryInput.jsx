import { useState, useRef, useEffect } from "react";

function QueryInput({ onQuery, disabled = false }) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef(null);

  // Auto-ajustar la altura del textarea conforme se escribe
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery || disabled) return;

    onQuery(cleanQuery);
    setQuery("");
  };

  // Enviar con "Enter" (pero permitir salto de línea con Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-end w-full gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all focus-within:border-blue-500/50"
    >
      <textarea
        ref={textareaRef}
        rows="1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pregunta a Luca..."
        disabled={disabled}
        className="flex-1 max-h-40 min-h-[44px] resize-none rounded-xl bg-transparent px-3 py-2.5 text-gray-800 dark:text-white outline-none placeholder:text-gray-400 disabled:opacity-50 text-base"
        style={{ lineHeight: '1.5' }}
      />
      
      <button
        type="submit"
        disabled={disabled || !query.trim()}
        className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
          query.trim() && !disabled
            ? "bg-blue-600 text-white scale-100 shadow-md"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 scale-95 opacity-50"
        }`}
        aria-label="Send message"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5 rotate-45"
        >
          <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
        </svg>
      </button>
    </form>
  );
}

export default QueryInput;