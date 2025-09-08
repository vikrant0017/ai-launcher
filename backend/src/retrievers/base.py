from abc import ABC, abstractmethod
from typing import Any

from ..common_types.base import Documents


class Retriver(ABC):
    def __init__(self) -> None:
        super().__init__()

    @abstractmethod
    def query(self, input: list[str], *args, **kwargs) -> Any:
        """Retrive the valuues"""

    @abstractmethod
    def add(self, docs: Documents, *args, **kwargs) -> Any:
        """Add documents to the vector store"""

    @abstractmethod
    def delete(self, *args, **kwargs) -> Any:
        """Delete documents"""
