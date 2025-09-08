from collections.abc import Callable
from os import PathLike
from pathlib import Path

from ..common_types.base import Documents
from ..parsers.base import Parser
from ..retrievers.base import Retriver


class FileHandler:
    def __init__(self, retriver: Retriver, parser: Parser, splitter: Callable[[Documents], Documents]):
        self.retriver = retriver
        self.parser = parser
        self.splitter = splitter

    def handle_new_file(self, path: str | PathLike):
        """# Parse the file and embed using retriver
        """
        docs = self.parser.parse(path)
        chunked_docs = self.splitter(docs)
        self.retriver.add(chunked_docs)

    def handle_delete_file(self, path: str | PathLike):
        """# Delete all associated chunks
        """
        path = Path(path)
        self.retriver.delete(where={"filename": path.name})

    def handle_modify_file(self, path: str | PathLike):
        """# Reembed the chunks which was changed
        """
        # TODO: Use chunk specific remembedding
        self.handle_delete_file(path)
        self.handle_new_file(path)
