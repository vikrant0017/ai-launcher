from pathlib import Path

from ..common_types.base import Document, Documents
from ..parsers.base import Parser


class SimpleMarkdownParser(Parser):
    def parse(self, filename) -> Documents:
        filepath = Path(filename)
        text = filepath.read_text()

        return [
            Document(
                content=text,
                metadata={
                    "filepath": str(filepath.absolute),
                    "filename": filepath.name,
                    "extension": filepath.suffix,
                },
            ),
        ]
