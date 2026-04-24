const STORAGE_KEY = "luca_history";

export const chatService = {
  getAllChats: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveChat: (chatId, messages) => {
    const chats = chatService.getAllChats();
    const existingChat = chats[chatId];

    let title = existingChat?.title;

    // Título automático desde la PREGUNTA del usuario
    if (!title && messages.length > 0) {
  const userText = messages[0].text || "";
  
  const clean = userText
    // 1. Quitamos signos de apertura y cierre
    .replace(/[¿?¡!]/g, "")
    // 2. Quitamos "Hola Luca" o "Hola, Luca" al principio (insensible a mayúsculas)
    // El [,\s]* sirve para quitar la coma y el espacio si los hay
    .replace(/^hola[,\s]*luca[,\s]*/i, "")
    // 3. Por si acaso solo dice "Hola" o solo "Luca"
    .replace(/^(hola|luca)[,\s]*/i, "")
    .trim();
  
  // 4. Capitalizamos la primera letra
  const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);

  title = formatted.length > 25 
    ? formatted.substring(0, 25).trim() + "..." 
    : formatted || "Nueva conversación";
}

    chats[chatId] = {
      id: chatId,
      title: title || "Nueva conversación",
      messages: messages.slice(-12),
      lastUpdated: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      console.warn("LocalStorage lleno, limpiando...");
      const chatsArray = Object.values(chats);
      if (chatsArray.length > 1) {
        chatsArray.sort((a, b) => a.lastUpdated - b.lastUpdated);
        const oldestId = chatsArray[0].id === chatId ? chatsArray[1].id : chatsArray[0].id;
        delete chats[oldestId];
        return chatService.saveChat(chatId, messages);
      }
    }
    return chats;
  },

  renameChat: (chatId, newTitle) => {
    const chats = chatService.getAllChats();
    if (chats[chatId] && newTitle.trim()) {
      chats[chatId].title = newTitle.trim();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
    return chats;
  },

  deleteChat: (chatId) => {
    const chats = chatService.getAllChats();
    delete chats[chatId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    return chats;
  }
};