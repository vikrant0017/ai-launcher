from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

from .base import Embedder


class OllamaEmbedding(Embedder):
    def __init__(self):
        self.ollama_ef = OllamaEmbeddingFunction(
            url="http://localhost:11434",
            model_name="nomic-embed-text", # Dim - 768
        )

    def embed(self, texts):
        return self.ollama_ef(texts)
