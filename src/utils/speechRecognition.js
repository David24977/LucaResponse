export const startListening = (onResult, onStatusChange) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;

  recognition.onstart = () => onStatusChange(true);
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (e) => {
    console.error("Speech Error:", e.error);
    onStatusChange(false);
  };

  recognition.onend = () => onStatusChange(false);

  recognition.start();
  return recognition;
};