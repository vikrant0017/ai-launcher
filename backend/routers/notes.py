from pathlib import Path

from fastapi import APIRouter
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from notes.notes import NoteService

note_service = NoteService(Path("/home/vikrant/Notes/__Fleeting Notes"))

router = APIRouter(
    prefix="/notes",
    tags=["notes"],  # Groups routes in OpenAPI docs
)


@router.post("/read")
async def read_note(req: Request):
    req = await req.json()
    seq_no = req.get("seq_no", None)
    content = note_service.read_note(seq_no=seq_no)
    return content


@router.post("/write")
async def write_note(req: Request):
    note = await req.json()
    if not note.get("content"):
        return JSONResponse(
            content={"success": False, "error": "Invalid JSON Format"},
            status_code=401,
        )
    content = note["content"]
    return note_service.add_note(content)
