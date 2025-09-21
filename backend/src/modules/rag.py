import dspy


class RAGSignature(dspy.Signature):
    """Respond to the question based on the context and context only. Respond with 'No relevant sources' explicity if the context is not relevant"""

    context = dspy.InputField()
    question = dspy.InputField()
    response = dspy.OutputField()


class RAG(dspy.Module):
    def __init__(self, lm: dspy.LM):  # Dependency Injection
        self.respond = dspy.ChainOfThought(RAGSignature)
        self.lm = lm

    def forward(self, contexts: list[str], question: str):
        with dspy.context(lm=self.lm):
            result = self.respond(context=contexts, question=question)
        return result
