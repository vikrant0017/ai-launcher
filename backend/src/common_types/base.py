from collections.abc import Mapping
from typing import Any

from pydantic import BaseModel


class Document(BaseModel):
    content: str | None
    metadata: Mapping[str, Any] | None = None



Documents = list[Document]
