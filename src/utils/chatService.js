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
    
    // Si es el primer mensaje, generamos un título
    const existingChat = chats[chatId];
    const title = existingChat?.title || 
                  (messages[0]?.text.substring(0, 30) + "..." || "Nuevo Chat");

    chats[chatId] = {
      id: chatId,
      title: title,
      messages: messages.slice(-12), // Mantenemos tu límite de 12
      lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
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