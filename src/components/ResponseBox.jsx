import { useEffect, useState } from "react";
import TypingText from "./TypingText";

function ResponseBox({ response }) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1024px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const listener = (e) => setIsMobile(e.matches);

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  if (!response) return null;

  return (
    <div className="w-full flex justify-center px-4">
      <div className="mt-6 w-full max-w-[650px] bg-white p-6 rounded-lg shadow text-gray-800 leading-relaxed">

        {isMobile ? (
          <p className="whitespace-pre-line">{response}</p>
        ) : (
          <TypingText text={response} />
        )}

      </div>
    </div>
  );
}

export default ResponseBox;