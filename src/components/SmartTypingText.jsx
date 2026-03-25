import { useState, useEffect, useRef, memo } from "react";

const SmartTypingText = memo(({ text, speed = 30 }) => {
  const [displayed, setDisplayed] = useState("");
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let isEffectActive = true;

    // 1. En lugar de limpiar DIRECTAMENTE, lo metemos en una función
    // que se ejecute justo después del montaje inicial.
    const startAnimation = () => {
      if (!isEffectActive) return;

      // Limpiamos referencias
      if (timerRef.current) clearTimeout(timerRef.current);
      indexRef.current = 0;
      
      // Actualizamos el estado para empezar de cero
      setDisplayed("");

      const tick = () => {
        if (!isEffectActive) return;

        const isMobile = window.innerWidth < 768;
        const increment = isMobile ? 3 : 1;

        if (indexRef.current < text.length) {
          indexRef.current += increment;
          // Usamos la versión funcional de setEstado para más seguridad
          setDisplayed(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed);
        }
      };

      // Lanzamos el primer tick con un pequeño respiro
      timerRef.current = setTimeout(tick, 50);
    };

    // 2. Usamos requestAnimationFrame o un setTimeout 0 
    // para sacar la limpieza del flujo de renderizado inmediato.
    const starterId = setTimeout(startAnimation, 0);

    return () => {
      isEffectActive = false;
      clearTimeout(starterId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]);

  return (
    <p className="whitespace-pre-line leading-relaxed break-words text-sm md:text-base">
      {displayed}
      {displayed.length < text.length && (
        <span className="ml-1 inline-block w-2 h-4 bg-blue-500 animate-pulse align-middle" />
      )}
    </p>
  );
});

export default SmartTypingText;