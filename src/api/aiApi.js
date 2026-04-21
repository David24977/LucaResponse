const BASE_URL = import.meta.env.VITE_API_URL;
import { getUUID } from "../utils/uuid";

export async function queryAI(query, activeChatId, history = []) {
  // CONFIGURACIÓN DE OPTIMIZACIÓN:
  // Solo enviamos los últimos 10 mensajes para ahorrar tokens y mantener el contexto relevante.
  const MAX_HISTORY_MESSAGES = 10;
  
  // 1. Recortamos el historial a los últimos X mensajes
  const optimizedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  // 2. Formateamos el historial para la IA
  const context = optimizedHistory.map(msg => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.text
  }));

  const response = await fetch(`${BASE_URL}/ai/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      conversationId: activeChatId,
      history: context, 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Server error");
  }

  return data;
}

export function resetConversation() {
  const newId = getUUID();
  return newId;
}