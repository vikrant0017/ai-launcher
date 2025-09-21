import dspy

from config import app_config


def load_gemini_lm():
    GEMINI_API_KEY = app_config.gemini_api_key
    lm = dspy.LM(
        "gemini/gemini-2.5-flash-lite", api_key=GEMINI_API_KEY, temperature=0.5
    )
    return lm


def load_ollama_lm():
    lm = dspy.LM(
        "ollama_chat/qwen3:1.7b", api_base="http://localhost:11434", api_key=""
    )
    # dspy.configure(lm=lm)
    return lm
