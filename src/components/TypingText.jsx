import { useEffect, useState } from "react";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let animationFrameId;
    let start = null;
    const speed = 18;

    const animate = (timestamp) => {
      if (start === null) start = timestamp;

      const elapsed = timestamp - start;
      const chars = Math.min(text.length, Math.floor(elapsed / speed));

      setDisplayed(text.slice(0, chars));

      if (chars < text.length) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text]);

  return (
    <p className="whitespace-pre-line leading-relaxed">
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}

export default TypingText;