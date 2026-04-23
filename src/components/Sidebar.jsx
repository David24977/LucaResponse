import React, { useState } from "react";

function Sidebar({ allChats, activeChatId, onChatSelect, onDeleteChat, onRenameChat, isOpen, toggleSidebar }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const chatList = Object.values(allChats).sort((a, b) => b.lastUpdated - a.lastUpdated);
  
  const usedBytes = JSON.stringify(allChats).length;
  const usedKB = (usedBytes / 1024).toFixed(1);
  const usedPercentage = Math.min((usedBytes / (1024 * 1024 * 5)) * 100, 100);

  const handleRename = (e, chatId, currentTitle) => {
    e.stopPropagation();
    setMenuOpenId(null);
    const newTitle = window.prompt("Renombrar chat:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      onRenameChat(chatId, newTitle);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`fixed top-0 left-0 z-[70] h-screen transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-72 flex flex-col shadow-2xl md:shadow-none`}>
        
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b dark:border-gray-800 shrink-0">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest font-mono">Historial</h2>
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 custom-scrollbar">
            {chatList.length === 0 ? (
              <p className="text-center text-gray-400 text-[10px] mt-10 font-mono italic opacity-50 uppercase tracking-tighter">Vacío</p>
            ) : (
              chatList.map((chat) => (
                <div 
                  key={chat.id}
                  className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    activeChatId === chat.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent shadow-sm"
                  }`}
                  onClick={() => {
                    onChatSelect(chat.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className={`text-sm truncate pr-6 font-bold ${
                      activeChatId === chat.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {chat.title || "Nueva conversación"}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5 font-mono">
                      {new Date(chat.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Botón 3 puntitos */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>

                    {/* Menú flotante (Rename/Delete) */}
                    {menuOpenId === chat.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                        <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                          <button 
                            onClick={(e) => handleRename(e, chat.id, chat.title)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                          >
                            ✏️ Rename
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div className="h-4" />
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="px-1 mb-2 flex justify-between text-[9px] text-gray-500 font-bold font-mono uppercase">
              <span>Memory</span>
              <span>{usedKB}KB / 5MB</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${usedPercentage}%` }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;