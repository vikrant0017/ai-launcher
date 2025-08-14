import { createRoot } from "react-dom/client";
import { KeyboardEvent, useState } from "react";
import React from 'react'
import { Input } from "@/components/ui/input";
import { ThemeProvider } from "./components/ThemeProvider";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");

  const fetchAnswer = async (): Promise<string> => {
    // TODO: Use an Enviroment Variable for server and also expose a interface instead
    // const response = await fetch("http://localhost:8000/ask", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ question }),
    // });

    // const jsonResponse = await response.json();
    // return jsonResponse.response;
    return 'Hello Vigilante'
  };

/*   const saveText = async (text: string) => {
    await window.electronAPI.save(text);
  }; */
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
        // saveText(`<note>${question}</note>`);
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
        // saveText(
        //   `<question>${question}</question>\n<answer>${answerText}</answer>`,
        // ); // Use answerText for the answer part
        break;
      }
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="text-2xl">
      <div>
        <Input
          className="pl-8 outline-none border-none [&:focus]:ring-0 [&]:text-xl h-15"
          value={question}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type to search..."
          autoFocus
        />
        <div
          id="answer"
          className="p-8"
        >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus veniam id assumenda soluta numquam? Dolores, magni assumenda! Possimus minus sit accusantium odio vero laborum aliquam cupiditate ut mollitia, autem perspiciatis?
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
};

const root = createRoot(document.body);
root.render(<App />);
