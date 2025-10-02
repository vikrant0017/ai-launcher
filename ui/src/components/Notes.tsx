import { KeyboardEvent } from "react";
import Editor from "./Editor";
import { Button } from "./ui/button";
import NoteService, { SequenceNote, Note } from "../utils/notes";

export default function Notes() {
  const [value, setValue] = useState("");
  const [note, setNote] = useState<SequenceNote | null>(null);
  const [lenNotes, setLenNotes] = useState(0);

  const handlePrev = async () => {
    if (!note) return;
    const noteRes = await NoteService.read_note(note.seq_no - 1);
    if (!noteRes) return;
    setNote(noteRes);
  };

  const handleNext = async () => {
    if (!note) return;
    const noteRes = await NoteService.read_note(note.seq_no + 1);
    if (!noteRes) return;
    setNote(noteRes);
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey && e.key == "Enter") {
      e.preventDefault();
      const note = await NoteService.save_note(value);
      setNote(note);
      setLenNotes(note?.seq_no ? note.seq_no + 1 : 0);
      setValue("");
    }
  };

  const renderNotesViewer = () => (
    <>
      <div
        className="space-y-6 border border-gray-700 bg-gray-900 p-6 pl-8 leading-7 text-gray-100 [&:not(:first-child)]:mt-6"
        id="notes"
      >
        <div className="text-lg text-gray-100">{note && note.note.content}</div>
        <div className="text-sm font-medium text-gray-400">
          {note?.note?.datetime &&
            new Date(note.note.datetime).toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-2">
          {note &&
            note?.note?.tags &&
            note?.note?.tags.map((tag, index) => (
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
          disabled={note?.seq_no == 0}
          onClick={handlePrev}
          className="border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
        >
          Prev
        </Button>
        <Button
          disabled={note?.seq_no == lenNotes - 1}
          onClick={handleNext}
          className="border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
        >
          Next
        </Button>
      </div>
    </>
  );

  return (
    <div>
      <Editor
        value={value}
        onValueChange={setValue}
        onKeyDown={handleKeyPress}
      />
      {!!lenNotes && renderNotesViewer()}
    </div>
  );
}
