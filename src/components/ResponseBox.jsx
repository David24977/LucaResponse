function ResponseBox({ response }) {

  if (!response) return null;

  const lines = response.split("\n");

  return (
    <div className="mt-6 w-[650px] bg-white p-6 rounded-lg shadow text-gray-800 leading-relaxed">

      {lines.map((line, i) => (
        <p key={i} className="mb-2">{line}</p>
      ))}

    </div>
  );
}

export default ResponseBox;