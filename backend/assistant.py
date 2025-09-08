import os

import dotenv

import dspy
dotenv.load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
lm = dspy.LM("gemini/gemini-2.5-flash-lite", api_key=GEMINI_API_KEY, temperature=0.5)
dspy.configure(lm=lm)


class ConciseAnswer(dspy.Signature):
    """Provide a short and concise response highlighting only the important information without any extra fluffs. Consider each work as an expense so try to limit the work count to minimal."""

    question = dspy.InputField()
    answer = dspy.OutputField()


qa = dspy.Predict(ConciseAnswer)


def ask(question: str):
    response = qa(question=question)
    answer = response.answer
    return answer
