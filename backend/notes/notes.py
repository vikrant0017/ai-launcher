import re
from dataclasses import dataclass, field
from datetime import datetime
from hashlib import sha256
from pathlib import Path


class InvalidSequenceNoError(Exception):
    pass


@dataclass
class Note:
    content: str
    datetime: datetime | None
    hash: str | None
    tags: list[str] = field(default_factory=list)


@dataclass
class SequencedNote:
    note: Note
    seq_no: int


class NoteService:
    def __init__(self, save_dir: Path):
        if not save_dir.exists():
            save_dir.mkdir(parents=True)

        self.save_dir = save_dir  # config
        self.current_file = "fleeting_notes.md"

    def format(self, note: Note) -> str:
        # add created datetime
        # Add id - hash
        return (
            "<!--\n"
            f"{note.datetime.isoformat()}\n"
            f"{note.hash}\n"
            "-->\n"
            f"{note.content}\n"
            f"{' '.join(['#' + tag for tag in note.tags])}"
            "\n\n***\n\n"  # MD horzontal line
        )

    def parse(self, note_str: str) -> Note:
        note_lines = note_str.split("\n")

        return Note(
            datetime=datetime.fromisoformat(note_lines[1]),
            hash=note_lines[2],
            tags=note_lines[-1].split(" "),
            content="\n".join(note_lines[4 : len(note_lines) - 1]),
        )

    def add_note(self, content: str):
        # Extract tags from content using regex
        tag_pattern = r"#(\w+)"
        tags = re.findall(tag_pattern, content)
        parsed_content = re.sub(tag_pattern, "", content).strip()
        note = Note(
            content=parsed_content,
            datetime=datetime.now(),
            hash=sha256(content.encode("utf-8")).hexdigest(),
            tags=tags,
        )

        fmt_note = self.format(note)
        self.write(content=fmt_note)

        return self.read_note()  # Latest Note

    def write(self, content: str):
        filepath = self.save_dir / self.current_file
        try:
            with filepath.open("a", encoding="utf-8") as f:
                _ = f.write(content)
        except FileNotFoundError as e:
            raise e

    def read_note(self, seq_no: int | None = None):
        """
        If seq_no is not passed, then the latest note in sequence is returned
        """
        filepath = self.save_dir / self.current_file
        file_content = filepath.read_text()

        # THis is a naive way
        file_contents = file_content.split("\n\n***\n\n")[
            0:-1
        ]  # slicing to remove the last empty string split
        if seq_no is None:
            seq_no = len(file_contents) - 1

        try:
            file_content = file_contents[seq_no]
            return SequencedNote(note=self.parse(file_contents[seq_no]), seq_no=seq_no)
        except IndexError as e:
            raise InvalidSequenceNoError("Invalid seq no") from e
