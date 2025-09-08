from abc import ABC, abstractmethod

from ..common_types.base import Documents


class Store(ABC):
    @abstractmethod
    def add(self, documents, *args, **kwargs):
        """Add documents"""

    @abstractmethod
    def delete(self, *args, **kwargs):
        """Delete Docs"""

    @abstractmethod
    def reset(self) -> bool:
        """Delete all the data"""

    @abstractmethod
    def query(self, texts, *args, **kwargs) -> list[Documents] | None:
        """Query"""

    # For debugging
    @abstractmethod
    def get(self, texts, *args, **kwargs) -> Documents | None:
        """Query ALL"""
