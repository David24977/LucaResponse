export const startListening = (onResult, onStatusChange, onError) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return null;
  }

  const recognition = new SpeechRecognition();

  const userLangs = navigator.languages || [navigator.language];

// 1. Detectem què tens a la llista
const tieneValencia = userLangs.some(l => l.startsWith('ca') || l.startsWith('va'));
const tieneCastellano = userLangs.some(l => l.startsWith('es'));

// 2. Lògica de PRIORITAT (De la terreta cap a fora)
if (tieneValencia) {
    // Si està el valencià a la llista, Luca t'escolta en la teua llengua
    recognition.lang = 'ca-ES'; 
} else if (tieneCastellano) {
    // Si no, t'escolta en castellà 
    recognition.lang = 'es-ES';
} else {
    // I si no hi ha res de l'anterior, gastem l'anglés
    recognition.lang = userLangs[0] || 'en-US';
}

  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => onStatusChange(true);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    const errorMessages = {
      "no-speech": "No te he oído bien, ¿puedes repetirlo?",
      "audio-capture": "No encuentro tu micrófono.",
      "not-allowed": "Permiso de micrófono denegado.",
    };
    onError(errorMessages[event.error] || "Algo ha fallado con el micro.");
    onStatusChange(false);
  };

  recognition.onend = () => onStatusChange(false);

  recognition.start();
  return recognition;
};
