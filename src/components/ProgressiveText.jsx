import { useEffect, useState } from "react";

function ProgressiveText({ text }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (!text) return;

    const length = text.length;
    const parts = [
      text.slice(0, Math.max(1, Math.floor(length * 0.35))),
      text.slice(0, Math.max(2, Math.floor(length * 0.7))),
      text,
    ];

    let i = 0;

    const interval = setInterval(() => {
      setVisibleText(parts[i]);
      i++;

      if (i >= parts.length) {
        clearInterval(interval);
      }
    }, 220);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="whitespace-pre-line leading-relaxed">
      {visibleText}
    </p>
  );
}

export default ProgressiveText;