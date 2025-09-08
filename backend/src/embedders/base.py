from abc import ABC, abstractmethod
from typing import Any


class Embedder(ABC):
    """Abstract base class for embedding models."""

    @abstractmethod
    def embed(self, texts: list[str]) -> list[Any]:
        """Generate embeddings for the given text(s).

        Args:
            text: A list of string to embed

        Returns:
            A list of embedding vectors

        """
