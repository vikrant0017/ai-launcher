from abc import ABC, abstractmethod
from copy import deepcopy

from pydantic import BaseModel
from unstructured.partition.pdf import partition_pdf
from unstructured.staging.base import elements_to_dicts


class Document(BaseModel):
    metadata: dict
    content: str

from typing import Any

Documents = list[Document]

class Parser(ABC):
    @abstractmethod
    def parse(self, *args, **kwargs) -> Any:
        pass

class SimplePdfParser(Parser):
    def __init__(self) -> None:
       pass

    def parse(self, filename) -> Documents:
        partitions = partition_pdf(filename=filename)
        elements = elements_to_dicts(partitions)
        docs = []
        for el in elements:
            docs.append(Document(content = el["text"], metadata=deepcopy({"type": el["type"], **el["metadata"] })))
        return docs


# file_path = "./mock_files"
# base_file_name = "Backend Engineer Resume"
# parser = SimplePdfParser()
# docs = parser.parse(f'{file_path}/{base_file_name}.pdf')
# pp(docs[0].metadata)
