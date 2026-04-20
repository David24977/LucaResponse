import React from "react";

function Sidebar({ allChats, activeChatId, onChatSelect, onDeleteChat, isOpen, toggleSidebar }) {
  const chatList = Object.values(allChats).sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <>
      {/* Overlay para móviles: Solo visible cuando está abierto en pantallas pequeñas */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Panel Lateral */}
      <aside className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-72 flex flex-col shadow-2xl md:shadow-none`}>
        
        <div className="flex flex-col h-full p-4">
          {/* Cabecera interna del Sidebar */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Historial de Chats
            </h2>
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {chatList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-xs italic">No hay chats guardados</p>
              </div>
            ) : (
              chatList.map((chat) => (
                <div 
                  key={chat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChatId === chat.id 
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
                  }`}
                  onClick={() => {
                    onChatSelect(chat.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm truncate pr-2 ${
                      activeChatId === chat.id 
                        ? "font-bold text-blue-700 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 font-medium"
                    }`}>
                      {chat.title || "Nuevo Chat"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(chat.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[9px] text-gray-500 font-mono">
              DB: LOCAL_STORAGE ({(JSON.stringify(allChats).length / 1024).toFixed(1)} KB)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;