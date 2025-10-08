import React, { useRef } from "react";
import { KeyboardEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { ask, rag } from "@/utils/ai";
import { Button } from "./ui/button";
import { CornerDownLeft } from "lucide-react";

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
  const [isInputDisabled, setInputDisabled] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setQuestion(e.target.value);
  };

  const sendQuestion = async () => {
    setInputDisabled(true);
    const response = await ask(question);
    setAnswer(response);
    setQuestion("");
    setInputDisabled(false);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey && e.key == "Enter") {
      sendQuestion();
    }
  };

  return (
    <div>
      <div id="launcher-inputbox" className="flex items-center">
        <Input
          type="search"
          className="!bg-background border-round focus-visible:border-ring-none h-15 rounded-none border-0 border-b-1 pl-8 outline-none [&:focus]:ring-0"
          value={question}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
          autoFocus
        />

        <Button
          variant="outline"
          className="mx-2 size-10"
          hidden={!question}
          onClick={sendQuestion}
        >
          <CornerDownLeft />
        </Button>
      </div>
      {answer && <div className="p-8">{answer}</div>}
    </div>
  );
}
