import React from "react";

function Sidebar({ allChats, activeChatId, onChatSelect, onDeleteChat, isOpen, toggleSidebar }) {
  const chatList = Object.values(allChats).sort((a, b) => b.lastUpdated - a.lastUpdated);
  
  // Cálculo de almacenamiento (Límite estándar de 5MB para LocalStorage)
  const usedBytes = JSON.stringify(allChats).length;
  const usedKB = (usedBytes / 1024).toFixed(1);
  const limitMB = 5;
  const usedPercentage = Math.min((usedBytes / (1024 * 1024 * limitMB)) * 100, 100);

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Panel Lateral */}
      <aside className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-72 flex flex-col shadow-2xl md:shadow-none`}>
        
        <div className="flex flex-col h-full p-4">
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
              Historial Local
            </h2>
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {chatList.length === 0 ? (
              <p className="text-center text-gray-400 text-[11px] mt-10 italic font-mono">No hay sesiones guardadas</p>
            ) : (
              chatList.map((chat) => (
                <div 
                  key={chat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChatId === chat.id 
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
                  }`}
                  onClick={() => {
                    onChatSelect(chat.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm truncate pr-2 ${
                      activeChatId === chat.id ? "font-bold text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 font-medium"
                    }`}>
                      {chat.title || "Nuevo Chat"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {new Date(chat.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer del Sidebar: Almacenamiento */}
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="px-2 mb-2 flex justify-between text-[10px] text-gray-500 font-mono font-bold uppercase tracking-tighter">
              <span>Sync Status: Local</span>
              <span>{usedKB}KB / {limitMB}MB</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${usedPercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${usedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;