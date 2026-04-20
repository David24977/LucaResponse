export const getUUID = () => {
  // Si crypto está disponible (Localhost/HTTPS), lo usamos
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Si no (IP privada/HTTP), usamos el generador manual
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};