from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from notes.notes import InvalidSequenceNoError, NoteService

note_service = NoteService(Path("/home/vikrant/Notes/__Fleeting Notes"))

router = APIRouter(
    prefix="/notes",
    tags=["notes"],  # Groups routes in OpenAPI docs
)


class ReadNoteRequest(BaseModel):
    seq_no: int | None = None


class WriteNoteRequest(BaseModel):
    content: str | None = None


@router.post("/read")
async def read_note(req: ReadNoteRequest):
    try:
        content = note_service.read_note(seq_no=req.seq_no)
    except InvalidSequenceNoError:
        raise HTTPException(
            status_code=404,
            detail={"success": False, "error": "Invalid Sequence Number"},
        )

    return content


@router.post("/write")
async def write_note(req: WriteNoteRequest):
    if not req.content:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "error": "Content field cannot be empty"},
        )
    return note_service.add_note(req.content)
