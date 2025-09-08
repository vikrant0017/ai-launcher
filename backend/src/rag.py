# Setup Embedding with ChromaDB and OllamaEmbeddings
# Text -> OllamaEmbeddingFuntion -> VectorEmbeddings -> StoreInChroma
#

from uuid import uuid4 as rand_uid

import dotenv
import dspy
import mlflow
from chromadb import Client
from chromadb.utils.embedding_functions.ollama_embedding_function import (
    OllamaEmbeddingFunction,  # Wrapper for ollama embedding api /api/embed
)
from mlflow.dspy import autolog

from retriever import Retriver

dotenv.load_dotenv()

autolog()

# Optional: Set a tracking URI and an experiment
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("DSPy")

lm = dspy.LM("ollama_chat/qwen3:1.7b", api_base="http://localhost:11434", api_key="")
dspy.configure(lm=lm)
store = Client()

# Synthetic test sentences for RAG retrieval testing


class SimpleRetriver(Retriver):
    def __init__(self, docs=None, k=1):
        super().__init__()
        self.k = k
        store = Client()
        ollama_ef = OllamaEmbeddingFunction(
            url="http://localhost:11434",
            model_name="nomic-embed-text",  # Dim - 768
        )
        self.collection = store.create_collection(
            name="documents", embedding_function=ollama_ef
        )  # type: ignore
        if docs:
            self.add(docs)

    def add(self, docs):
        ids = [str(rand_uid()) for _ in range(len(docs))]
        self.collection.add(ids=ids, documents=docs)

    def query(self, input: list[str], k: int | None = None) -> list[list[str]] | None:
        result = self.collection.query(query_texts=input, n_results=(k or self.k))
        return result["documents"]


class RAGSignature(dspy.Signature):
    """Respond to the question based on the context and context only"""

    context = dspy.InputField()
    question = dspy.InputField()
    response = dspy.OutputField()


class RAG(dspy.Module):
    def __init__(self, retriever: Retriver):  # Dependency Injection
        self.respond = dspy.ChainOfThought(RAGSignature)
        self.retriver = retriever

    def forward(self, questions: list[str]):
        context = self.retriver.query(questions)
        return self.respond(context=context, question=questions[0])


test_sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Machine learning algorithms can process large datasets efficiently.",
    "Python is a popular programming language for data science.",
    "The weather today is sunny with a temperature of 75 degrees.",
    "Artificial intelligence is transforming various industries worldwide.",
]
rag = RAG(retriever=SimpleRetriver(docs=test_sentences, k=1))
