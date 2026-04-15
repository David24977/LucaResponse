const BASE_URL = import.meta.env.VITE_API_URL;

function getOrCreateConversationId() {
  let conversationId = localStorage.getItem("conversationId");

  if (!conversationId) {
    conversationId = crypto.randomUUID();
    localStorage.setItem("conversationId", conversationId);
  }

  

  return conversationId;
}

export function resetConversation() {
  const newId = crypto.randomUUID();
  localStorage.setItem("conversationId", newId);
}


export async function queryAI(query) {
  const response = await fetch(`${BASE_URL}/ai/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      conversationId: getOrCreateConversationId(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Server error");
  }

  return data;
}