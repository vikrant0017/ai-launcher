import { createRoot } from "react-dom/client";
import { KeyboardEvent, useState } from "react";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");

  const fetchAnswer = async (): Promise<string> => {
    const response = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const jsonResponse = await response.json();
    return jsonResponse.response;
  };

  const saveText = async (text: string) => {
    await window.electronAPI.save(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setQuestion(e.target.value);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLElement>) => {
    // e.preventDefault(); // Prevent default tab behavior (e.g., focus change)
    switch (e.key) {
      // On Enter Save it directly as note
      case "Enter": {
        e.preventDefault();
        saveText(`<note>${question}</note>`);
        setQuestion("");
        break;
      }
      // On Tab get the response (save automatically)
      case "Tab": {
        e.preventDefault();
        (e.target as HTMLElement).blur();
        // Added curly braces to allow lexical declaration
        // e.preventDefault(); // Prevent default tab behavior
        const answerText = await fetchAnswer();
        setAnswer(answerText);
        saveText(
          `<question>${question}</question>\n<answer>${answerText}</answer>`,
        ); // Use answerText for the answer part
        break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <input
          type="text"
          name="ask"
          id="ask"
          value={question}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-4 text-xl bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          placeholder="Type to search..."
          autoFocus
        />
        <div
          id="answer"
          className="mt-4 p-4 text-gray-200 bg-gray-800 rounded-lg min-h-[50px] empty:hidden"
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.body);
root.render(<App />);
