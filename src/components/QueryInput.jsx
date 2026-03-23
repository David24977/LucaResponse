import { useState } from "react";

function QueryInput({ onQuery }) {

  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!query.trim()) return;
    onQuery(query);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex w-full max-w-xl gap-2 md:gap-3">

      <input
        type="text"
        placeholder="Ask anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 p-3 border rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500
        dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />

      <button
        onClick={handleSubmit}
        className="px-4 md:px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Ask
      </button>

    </div>
  );
}

export default QueryInput;