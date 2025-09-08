import logging
import os

# test_sentences = [
#     "The quick brown fox jumps over the lazy dog.",
#     "Machine learning algorithms can process large datasets efficiently.",
#     "Python is a popular programming language for data science.",
#     "The weather today is sunny with a temperature of 75 degrees.",
#     "Artificial intelligence is transforming various industries worldwide.",
#     "Neehad is a a 31 year old male who has a lot of problems with the society and loathes the concept of religion. He wants to be free from societal and religious obligations"
# ]
from pathlib import Path

from src.embedders.ollama_embedding import OllamaEmbedding
from src.handlers.file_handler import FileHandler
from src.llm import load_ollama_lm
from src.modules.rag import RAG
from src.parsers.simple_parser import SimpleMarkdownParser
from src.retrievers.simple_retriever import SimpleRetriver
from src.stores.chroma_store import ChromaStore
from src.test_splitters.recursive_splitter import recursive_chunker
from track_files import FileTracker

# TODO Create path if not
WATCH_DIR = Path(os.getenv("WATCH_DIR", "./mock_files/watch_dir")).expanduser()
TRACK_FILEPATH = Path(os.getenv("TRACK_FILEPATH", ".tracked_files")).expanduser()
STORE_PATH = Path(os.getenv("STORE_PATH", "./chroma")).expanduser()

logging.basicConfig(level=logging.WARNING)
# My app log
logger = logging.getLogger("src")
logger.setLevel(logging.INFO)

logger.info("Starting")
load_ollama_lm()
embedder = OllamaEmbedding()
store = ChromaStore(embedder, store_name="rag", persists=True, path=str(STORE_PATH))
parser = SimpleMarkdownParser()
retriver = SimpleRetriver(store=store, k=1)
ragsy = RAG(retriever=retriver)


file_tracker = FileTracker(filepath=TRACK_FILEPATH, watch_dir=WATCH_DIR)
file_handler = FileHandler(parser=parser, retriver=retriver, splitter=recursive_chunker)


def sync_files(x=None):
    "Sync all files in the watch dir with the vector store"
    tracking_results = file_tracker(write=True)
    logger.info("Syncing Files")
    if filepaths := tracking_results.new_files:
        for filepath in filepaths:
            logger.info(f"Embedding new file at {filepath}")
            file_handler.handle_new_file(path=filepath)

    if filepaths := tracking_results.mod_files:
        for filepath in filepaths:
            logger.info(f"Re-mbedding modified file at {filepath}")
            file_handler.handle_new_file(path=filepath)
            file_handler.handle_modify_file(path=filepath)

    if filepaths := tracking_results.del_files:
        for filepath in filepaths:
            print(f"Removing embeddings for deleted file at {filepath}")
            file_handler.handle_delete_file(path=filepath)


def rag(question):
    sync_files()
    logger.info("Asking context...")
    return ragsy([question])
