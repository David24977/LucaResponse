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
        .replace(/[¿?¡!]/g, "")
        .replace(/^(hola|luca)\s+/i, "")
        .trim();
      
      title = clean.length > 25 
        ? clean.substring(0, 25) + "..." 
        : clean || "Nueva conversación";
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