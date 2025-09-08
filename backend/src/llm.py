import os

import dotenv
import dspy

dotenv.load_dotenv()

def load_gemini_lm():
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    lm = dspy.LM("gemini/gemini-2.5-flash", api_key=GEMINI_API_KEY, temperature=0.5)
    dspy.configure(lm=lm)


def load_ollama_lm():
    lm = dspy.LM("ollama_chat/qwen3:1.7b", api_base="http://localhost:11434", api_key="")
    dspy.configure(lm=lm)
    return lm
