import { useState } from "react";

function QueryInput({ onQuery, disabled = false }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanQuery = query.trim();
    if (!cleanQuery || disabled) return;

    onQuery(cleanQuery);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your question..."
        disabled={disabled}
        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-blue-500 px-5 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </form>
  );
}

export default QueryInput;