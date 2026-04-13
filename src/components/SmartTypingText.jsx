import { useState, useEffect, useRef, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        
        // Mantenemos el incremento en 1 para que el Markdown 
        // se procese mejor en móviles durante la animación
        const isMobile = window.innerWidth < 768;
        const increment = isMobile ? 2 : 1; 

        if (indexRef.current < text.length) {
          indexRef.current += increment;
          setDisplayed(text.slice(0, indexRef.current));
          
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

    startAnimation();

    return () => {
      isEffectActive = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]);

  // RETURN CORREGIDO: Sin errores de sintaxis y listo para Vercel
  return (
    <div className="prose dark:prose-invert prose-sm md:prose-base max-w-none break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayed || ""}
      </ReactMarkdown>
    </div>
  );
});

export default SmartTypingText;