const STORAGE_KEY = "luca_history";

export const chatService = {
  // Obtener todos los chats
  getAllChats: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Guardar o actualizar un chat específico
  saveChat: (chatId, messages) => {
    let chats = chatService.getAllChats();
    
    const existingChat = chats[chatId];
    const title = existingChat?.title || 
                  (messages[0]?.text.substring(0, 30) + "..." || "Nuevo Chat");

    chats[chatId] = {
      id: chatId,
      title: title,
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