export const startListening = (
  onResult,
  onStatusChange,
  onError,
  manuallyStoppedRef
) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return null;
  }

  const recognition = new SpeechRecognition();

  // --- LÓGICA DE IDIOMA SIN INVENTOS ---
  // Priorizamos el idioma del documento (HTML lang) porque es el más fiable.
  // Si no está definido, buscamos el primero del usuario. Fallback: Castellano.
  const siteLang = document.documentElement.lang;
  const userPrimaryLang = navigator.language || (navigator.languages && navigator.languages[0]);
  
  recognition.lang = siteLang || userPrimaryLang || "es-ES";

  // --- CONFIGURACIÓN PARA FLUIDEZ ---
  recognition.interimResults = false; // Solo resultados finales para evitar saltos
  recognition.continuous = false;     // Se para al terminar de hablar (más estable)

  recognition.onstart = () => {
    // Si el usuario ya pulsó Enter muy rápido, cancelamos
    if (manuallyStoppedRef.current) {
      recognition.abort(); 
      return;
    }
    onStatusChange(true);
  };

  recognition.onresult = (event) => {
    // Obtenemos la transcripción de forma segura
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    // Ignoramos el error "aborted" porque es el que lanzamos nosotros al enviar
    if (event.error === 'aborted') return;
    
    console.error("Error micro:", event.error);
    onError(event.error);
    onStatusChange(false);
  };

  recognition.onend = () => {
    // Limpieza de estados
    onStatusChange(false);
    // IMPORTANTE: Reseteamos el flag de parada manual para la siguiente escucha
    manuallyStoppedRef.current = false;
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Error al iniciar recognition:", e);
    return null;
  }

  return recognition;
};