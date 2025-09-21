import dspy


class ConciseAnswer(dspy.Signature):
    """Provide a short and concise response highlighting only the important information without any extra fluffs. Consider each work as an expense so try to limit the work count to minimal."""

    question = dspy.InputField()
    answer = dspy.OutputField()


class AIAssitant:
    lm: dspy.LM
    _predict: dspy.Predict

    def __init__(self, lm: dspy.LM) -> None:
        self._predict = dspy.Predict(ConciseAnswer)
        self.lm = lm if lm is not None else lm

    @property
    def predict(self) -> dspy.Predict:
        """The prediction module (immutable)."""
        return self._predict

    def ask(self, question: str) -> str:
        with dspy.context(lm=self.lm):
            response = self.predict(question=question)

        answer = response.answer
        return answer
