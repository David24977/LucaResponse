import { useState, useRef, useEffect } from "react";
import { startListening } from "../utils/speechRecognition";

function QueryInput({ onQuery, disabled = false }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const manuallyStoppedRef = useRef(false);

  // Auto resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [query]);

  // SUBMIT
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Parar micro SIEMPRE
    manuallyStoppedRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setIsListening(false);

    // quitar foco para evitar bugs con enter
    textareaRef.current?.blur();

    const cleanQuery = query.trim();
    if (!cleanQuery || disabled) return;

    onQuery(cleanQuery);
    setQuery("");
    setToast({ msg: "", type: "" });
  };

  // ENTER
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // CLICK MICRO
  const handleVoiceClick = () => {
    if (disabled) return;

    // Toggle OFF
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;

      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }

      recognitionRef.current = null;
      setIsListening(false);
      setToast({ msg: "", type: "" });
      return;
    }

    manuallyStoppedRef.current = false;

    setToast({ msg: "Luca te está escuchando...", type: "info" });

    const instance = startListening(
      (text) => {
        setQuery((prev) => (prev ? `${prev} ${text}` : text));
        setToast({ msg: "", type: "" });

        // clave: recuperar foco
        textareaRef.current?.focus();
      },
      (status) => setIsListening(status),
      (error) => {
        console.error("Error micro:", error);
        setIsListening(false);
        setToast({ msg: "Error de micro", type: "error" });
        setTimeout(() => setToast({ msg: "", type: "" }), 3000);
      },
      manuallyStoppedRef
    );

    recognitionRef.current = instance;
  };

  return (
    <div className="relative w-full">
      {/* Toast */}
      {toast.msg && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl border backdrop-blur-sm ${
              toast.type === "info"
                ? "bg-blue-600/90 border-blue-400 text-white"
                : "bg-gray-900/90 border-gray-700 text-gray-200"
            }`}
          >
            <span className="uppercase tracking-widest">{toast.msg}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`relative flex items-end w-full gap-2 p-2 rounded-2xl border transition-all duration-300 shadow-lg ${
          isListening
            ? "border-blue-500 ring-4 ring-blue-500/10"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
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
          className="flex-1 max-h-40 min-h-[44px] resize-none rounded-xl 
          bg-white dark:bg-gray-900 
          px-3 py-2.5 
          text-gray-800 dark:text-white 
          outline-none text-base overflow-hidden"
        />

        <div className="flex items-center gap-1 mb-0.5">
          {/* ICONO */}
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={disabled}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              isListening
                ? "bg-blue-100 text-blue-600 animate-pulse"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              query.trim() && !disabled
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 rotate-45"
            >
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default QueryInput;