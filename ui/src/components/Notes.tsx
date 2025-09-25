import React, { useState } from "react";
import { KeyboardEvent } from "react";
import Editor from "./Editor";
import { Button } from "./ui/button";

interface Note {
  content: string;
  date: string;
  hash: string;
  tags: Array<string>;
}

interface SequencedNote {
  note: Note;
  seq_no: number;
}

export default function Notes() {
  const [value, setValue] = useState("");
  const [note, setNote] = useState<SequencedNote>();

  const handlePrev = async () => {
    if (!note) return;
    const response = await fetch("http://localhost:8001/notes/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seq_no: note["seq_no"] - 1 }),
    });

    const jsonRes = await response.json();
    setNote(jsonRes);
  };

  const handleNext = async () => {
    if (!note) return;
    const response = await fetch("http://localhost:8001/notes/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seq_no: note.seq_no + 1 }),
    });
    const jsonRes = await response.json();
    setNote(jsonRes);
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey && e.key == "Enter") {
      e.preventDefault();
      const response = await fetch("http://localhost:8001/notes/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: value }),
      });
      if (response.status == 200) {
        const jsonRes = await response.json();
        setNote(jsonRes);
        setValue("");
      }
    }
  };
  return (
    <div>
      <Editor
        value={value}
        onValueChange={setValue}
        onKeyDown={handleKeyPress}
      />
      <div
        className="space-y-6 border border-gray-700 bg-gray-900 p-6 pl-8 leading-7 text-gray-100 [&:not(:first-child)]:mt-6"
        id="notes"
      >
        <div className="text-lg text-gray-100">{note && note.note.content}</div>
        <div className="text-sm font-medium text-gray-400">
          {note && new Date(note.note.datetime).toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-2">
          {note &&
            note.note.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full border border-blue-700/50 bg-blue-900/50 px-3 py-1 text-xs text-blue-300"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
      <div className="mt-6 flex justify-between px-8">
        <Button
          onClick={handlePrev}
          className="border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
        >
          Prev
        </Button>
        <Button
          onClick={handleNext}
          className="border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
