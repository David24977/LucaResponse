import { useEffect, useState } from "react";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let start = null;
    const speed = 40;
    let animationFrameId;

    function animate(timestamp) {
      if (!start) start = timestamp;

      const elapsed = timestamp - start;
      const chars = Math.floor(elapsed / speed);

      setDisplayed(text.slice(0, chars));

      if (chars < text.length) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text]);

  return (
    <p className="whitespace-pre-line">
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}

export default TypingText;