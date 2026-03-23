import { useEffect, useState } from "react";

function TypingText({ text }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= text.length) return;

    const timeout = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, 15);

    return () => clearTimeout(timeout);
  }, [index, text.length]);

  return (
    <p className="whitespace-pre-line">
      {text.slice(0, index)}
      {index < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}

export default TypingText;