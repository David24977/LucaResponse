const STORAGE_KEY = "luca_history";

export const chatService = {
  // Obtener todos los chats
  getAllChats: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Guardar o actualizar un chat específico
  saveChat: (chatId, messages) => {
  const chats = chatService.getAllChats();
  const existingChat = chats[chatId];

  // 1. Si el chat ya tiene título, lo mantenemos
  let title = existingChat?.title;

  // 2. Si NO tiene título y ya tenemos al menos el primer mensaje de la IA
  if (!title && messages.length >= 2) {
    // Tomamos la respuesta de la IA (índice 1)
    const aiText = messages[1].text;
    
    // Limpiamos el Markdown de la respuesta de la IA para el título
    title = aiText
      .replace(/[#*`]/g, "") // Quitamos #, * y ticks de código
      .split('\n')[0]        // Nos quedamos solo con la primera línea
      .substring(0, 25)      // Cortamos a 25 caracteres
      .trim() + "...";
  } 
  // 3. Fallback: Si solo está la pregunta del usuario aún
  else if (!title && messages.length === 1) {
    title = messages[0].text.substring(0, 20) + "...";
  }

  chats[chatId] = {
    id: chatId,
    title: title || "Nuevo Chat",
    messages: messages.slice(-12),
    lastUpdated: Date.now(),
  };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      // Si entramos aquí, es que el LocalStorage está lleno (QuotaExceededError)
      console.warn("LocalStorage lleno, ejecutando limpieza de chats antiguos...");
      
      // 1. Convertimos los chats en un array para poder ordenarlos
      const chatsArray = Object.values(chats);
      
      if (chatsArray.length > 1) {
        // 2. Ordenamos por el que se actualizó hace más tiempo (el más viejo primero)
        chatsArray.sort((a, b) => a.lastUpdated - b.lastUpdated);
        
        // 3. Identificamos el ID del chat más antiguo (que no sea el que estamos intentando guardar ahora)
        const oldestId = chatsArray[0].id === chatId ? chatsArray[1].id : chatsArray[0].id;
        
        // 4. Borramos ese chat del objeto principal
        delete chats[oldestId];
        
        // 5. Reintentamos guardar (Recursividad controlada)
        return chatService.saveChat(chatId, messages);
      }
    }
    
    return chats;
  },

  // Eliminar un chat
  deleteChat: (chatId) => {
    const chats = chatService.getAllChats();
    delete chats[chatId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    return chats;
  }
};