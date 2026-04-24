import { useState, useRef, useEffect } from "react";
import { startListening } from "../utils/speechRecognition";

function QueryInput({ onQuery, disabled = false }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const textareaRef = useRef(null);

  // Auto-ajustar altura del textarea
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
    setToast({ msg: "", type: "" }); 
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceClick = () => {
    if (isListening || disabled) return;

    // 1. Feedback visual inmediato
    setToast({ msg: "Luca te está escuchando...", type: "info" });

    // 2. Llamada al helper (ahora con 3 parámetros, el idioma es interno)
    startListening(
      (text) => {
        setQuery((prev) => (prev ? `${prev} ${text}` : text));
        setToast({ msg: "", type: "" }); // Éxito: borramos el toast
      },
      (status) => setIsListening(status),
      (errorMsg) => {
        setToast({ msg: errorMsg, type: "error" });
        // El error se borra solo tras 3 segundos
        setTimeout(() => setToast({ msg: "", type: "" }), 3000);
      }
    );
  };

  return (
    <div className="relative w-full">
      {/* TOAST DINÁMICO */}
      {toast.msg && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl border backdrop-blur-sm transition-colors ${
            toast.type === "info" 
              ? "bg-blue-600/90 border-blue-400 text-white" 
              : "bg-gray-900/90 border-gray-700 text-gray-200"
          }`}>
            {toast.type === "info" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
            <span className="uppercase tracking-widest">{toast.msg}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`relative flex items-end w-full gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border transition-all duration-300 shadow-lg ${
          isListening 
            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-blue-500/20" 
            : "border-gray-200 dark:border-gray-700 focus-within:border-blue-500/50"
        }`}
      >
        <textarea
          ref={textareaRef}
          rows="1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Habla ahora..." : "Pregunta a Luca..."}
          disabled={disabled}
          className="flex-1 max-h-40 min-h-[44px] resize-none rounded-xl bg-transparent px-3 py-2.5 text-gray-800 dark:text-white outline-none placeholder:text-gray-400 disabled:opacity-50 text-base overflow-hidden"
        />

        <div className="flex items-center gap-1 mb-0.5">
          {/* BOTÓN MICRO */}
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={disabled}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              isListening
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 animate-pulse"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          {/* BOTÓN ENVIAR */}
          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              query.trim() && !disabled
                ? "bg-blue-600 text-white shadow-md active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 opacity-50"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-45">
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default QueryInput;