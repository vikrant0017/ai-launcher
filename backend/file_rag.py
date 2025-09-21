import logging
from pathlib import Path

from src.embedders.ollama_embedding import OllamaEmbedding
from src.llm import load_ollama_lm
from src.modules.rag import RAG
from src.parsers.simple_parser import SimpleMarkdownParser
from src.retrievers.simple_retriever import SimpleRetriver
from src.stores.chroma_store import ChromaStore
from src.utils.track_files import FileTracker

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger("src")
logger.setLevel(logging.DEBUG)


class FileExtensionNotSupportedError(Exception):
    def __init__(self, message="File Extension not supported"):
        self.message = message
        super().__init__(self.message)


class DocumentRAG:
    def __init__(self, parser, retriver, generator) -> None:
        self.parser = parser
        self.retriver = retriver
        self.generator = generator

    def add_document(self, filepath: str | Path):
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError("path doens't exist")
        file_ext = path.suffix
        parsed_file = None
        if file_ext in [".md", ".txt"]:
            parsed_file = self.parser.parse(path)
        else:
            raise FileExtensionNotSupportedError(
                f"No parser found for files with '{file_ext}' extension"
            )
        self.retriver.add(parsed_file)

    def remove_document(self, filepath: str | Path):
        path = Path(filepath)
        self.retriver.delete(where={"filepath": str(path.absolute())})

    def query(self, question: str):
        logger.debug(f"Question: {question}")
        contexts = self.retriver.query([question])
        logger.debug(f"Contexts: {contexts}")
        if contexts and contexts[0]:
            return self.generator(
                [c.content for c in contexts[0] if c.content], question
            )
        return None


class DocumentRAGHandler:
    def __init__(self, doc_rag: DocumentRAG) -> None:
        self.doc_rag = doc_rag

    def handle_new_file(self, filepath: str | Path):
        self.doc_rag.add_document(Path(filepath))

    def handle_deleted_file(self, filepath: str | Path):
        self.doc_rag.remove_document(filepath=filepath)

    def handle_modified_file(self, filepath: str):
        path = Path(filepath)
        self.handle_deleted_file(path)
        self.handle_new_file(path)


class RAGService:
    def __init__(self, watch_dir: Path, data_dir: Path):
        self.file_tracker = None

        lm = load_ollama_lm()
        embedder = OllamaEmbedding()
        store = ChromaStore(
            embedder, store_name="rag", persists=True, path=str(data_dir / "chroma")
        )
        parser = SimpleMarkdownParser()
        retriver = SimpleRetriver(store=store, k=1)
        generator = RAG(lm)
        self.raggy = DocumentRAG(parser=parser, retriver=retriver, generator=generator)

        doc_rag_handler = DocumentRAGHandler(self.raggy)

        if watch_dir:
            self.file_tracker = FileTracker(
                state_filepath=data_dir / ".tracked",
                watch_dir=watch_dir,
            )
            self.file_tracker.attach(doc_rag_handler)

    def query(self, q: str):
        if self.file_tracker:
            self.file_tracker.sync()
        return self.raggy.query(q)
