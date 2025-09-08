# Generic Retriver Interface
# Create a store with default values while also able to call with these values at runtime
# Should Include an Interface
#
#

from abc import ABC, abstractmethod
from typing import Any

test_sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Machine learning algorithms can process large datasets efficiently.",
    "Python is a popular programming language for data science.",
    "The weather today is sunny with a temperature of 75 degrees.",
    "Artificial intelligence is transforming various industries worldwide.",
]


class Retriver(ABC):
    def __init__(self) -> None:
        super().__init__()
        # self.var = 'Retriver'

    @abstractmethod
    def query(self, input: list[str], *args, **kwargs) -> Any:
        """Retrive the valuues"""

    def add(self, docs: list[str], *args, **kwargs) -> Any:
        """Add documents to the vector store"""
