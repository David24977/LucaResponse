export const startListening = (
  onResult,
  onStatusChange,
  onError,
  manuallyStoppedRef,
) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return null;
  }

  const recognition = new SpeechRecognition();

  // --- IDIOMA ROBUSTO ---
  // Priorizamos el idioma de la web, si no, el del sistema.
  const siteLang = document.documentElement.lang;
  const userPrimaryLang =
    navigator.language || (navigator.languages && navigator.languages[0]);
  let finalLang = siteLang || userPrimaryLang || "es-ES";

  if (finalLang.startsWith("ca") || finalLang.startsWith("va")) {
    finalLang = "ca-ES";
  } else if (finalLang.startsWith("es")) {
    finalLang = "es-ES";
  }

  recognition.lang = finalLang;

  // --- CONFIGURACIÓN DE ESTABILIDAD ---
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1; // Menos carga para el motor de Edge/Windows

  recognition.onstart = () => {
    // Si se ha cancelado justo al empezar (doble clic o Enter rápido)
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
    // 1. Ignoramos si nosotros mismos hemos abortado el micro (al enviar con Enter)
    if (event.error === "aborted") return;

    // 2. Filtro especial para Edge/Safari:
    // Si el micro se cierra por silencio ('no-speech'), no mostramos error molesto.
    if (event.error === "no-speech") {
      console.warn("Reconocimiento finalizado: no se detectó voz.");
      onStatusChange(false);
      return;
    }

    // 3. Otros errores (permisos, red, etc.)
    console.error("Error micro:", event.error);
    onError(event.error);
    onStatusChange(false);
  };

  recognition.onend = () => {
    onStatusChange(false);
    // Resetear el flag para la siguiente vez que el usuario quiera hablar
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
