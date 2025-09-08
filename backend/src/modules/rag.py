import dspy

from ..retrievers.base import Retriver


class RAGSignature(dspy.Signature):
    """Respond to the question based on the context and context only. Respond with 'No relevant sources' explicity if the context is not relevant"""

    context = dspy.InputField()
    question = dspy.InputField()
    response = dspy.OutputField()


class RAG(dspy.Module):
    def __init__(self, retriever: Retriver):  # Dependency Injection
        self.respond = dspy.ChainOfThought(RAGSignature)
        self.retriver = retriever

    def forward(self, questions: list[str]):
        contexts = [c.content for c in self.retriver.query(questions)[0]]
        return self.respond(context=contexts, question=questions[0])
