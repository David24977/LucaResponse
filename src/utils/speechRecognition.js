export const startListening = (
  onResult,
  onStatusChange,
  onError,
  manuallyStoppedRef,
) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return null;
  }

  const recognition = new SpeechRecognition();

  // --- IDIOMA ROBUSTO ---
  const siteLang = document.documentElement.lang;
  const userPrimaryLang = navigator.language || (navigator.languages && navigator.languages[0]);
  let finalLang = siteLang || userPrimaryLang || "es-ES";

  if (finalLang.startsWith("ca") || finalLang.startsWith("va")) {
    finalLang = "ca-ES";
  } else if (finalLang.startsWith("es")) {
    finalLang = "es-ES";
  }

  recognition.lang = finalLang;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (manuallyStoppedRef.current) {
      recognition.abort();
      return;
    }
    onStatusChange(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted") return;

    // IMPORTANTE: Avisamos del error de silencio o cualquier otro
    onError(event.error);
    onStatusChange(false);
  };

  recognition.onend = () => {
    onStatusChange(false);
    manuallyStoppedRef.current = false;
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Error crítico al iniciar micro:", e);
    return null;
  }

  return recognition;
};