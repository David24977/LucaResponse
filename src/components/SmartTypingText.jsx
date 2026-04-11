import { useState, useEffect, useRef, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // <--- Indispensable para tablas y más

const SmartTypingText = memo(({ text, speed = 10 }) => {
  const [displayed, setDisplayed] = useState("");
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let isEffectActive = true;

    const startAnimation = () => {
      if (!isEffectActive) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      indexRef.current = 0;
      setDisplayed("");

      const tick = () => {
        if (!isEffectActive) return;
        const isMobile = window.innerWidth < 768;
        const increment = isMobile ? 3 : 2;

        if (indexRef.current < text.length) {
          indexRef.current += increment;
          setDisplayed(text.slice(0, indexRef.current));
          
          // SCROLL DINÁMICO: Mantiene la vista en el final del chat
          const chatContainer = document.querySelector('.chat-container');
          if (chatContainer) {
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: 'auto' 
            });
          }
          
          timerRef.current = setTimeout(tick, speed);
        }
      };
      timerRef.current = setTimeout(tick, 30);
    };

    const starterId = setTimeout(startAnimation, 0);
    return () => {
      isEffectActive = false;
      clearTimeout(starterId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]);

  return (
    <div className="prose dark:prose-invert prose-sm md:prose-base max-w-none 
                    prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700
                    prose-th:bg-gray-50 dark:prose-th:bg-gray-900/50 prose-th:p-2
                    prose-td:p-2 prose-td:border-t dark:prose-td:border-gray-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayed}
      </ReactMarkdown>
    </div>
  );
});

export default SmartTypingText;