import React from "react";
import { KeyboardEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { ask, rag } from "@/utils/ai";

declare global {
  interface Window {
    file: {
      save: (text: string) => Promise<null>;
    };
  }
}

export function Launcher() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("llm");

  const saveText = async (text: string) => {
    await window.file.save(text);
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
        const answerText =
          mode == "llm" ? await ask(question) : await rag(question);
        setAnswer(answerText);
        // saveText(
        //   `<question>${question}</question>\n<answer>${answerText}</answer>`,
        // ); // Use answerText for the answer part
        break;
      }
      case "/": {
        e.preventDefault();
        if (mode == "llm") {
          setMode("rag");
        } else {
          setMode("llm");
        }
        break;
      }
    }
  };

  return (
    <div className="text-2xl">
      <div>
        <Input
          className="h-15 border-none pl-8 outline-none [&]:text-xl [&:focus]:ring-0"
          value={question}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={mode === "llm" ? "Ask AI..." : "Search documents..."}
          autoFocus
        />
        <div id="answer" className="p-8">
          {answer}
        </div>
      </div>
    </div>
  );
}
