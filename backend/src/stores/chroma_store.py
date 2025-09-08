from uuid import uuid4 as rand_uid

from chromadb import Client, PersistentClient
from chromadb.api.models.CollectionCommon import QueryResult

from ..common_types.base import Document, Documents
from ..embedders.base import Embedder
from ..stores.base import Store


class ChromaStore(Store):
    def __init__(
        self, embedder: Embedder, store_name: str, persists=False, path="./chroma"
    ):
        self.embedder = embedder
        self.store = PersistentClient(path=path) if persists else Client()
        self.collection = self.store.create_collection(
            name=store_name, embedding_function=None, get_or_create=True
        )

    def add(self, docs: Documents, store_content=True):
        contents = [doc.content for doc in docs]
        # If metadatas is provided to collection.add(), chroma expects it to be non Empty Mapping
        # Therefore for compatibilty the {'source': 'unknown'} is added
        metadatas = [
            doc.metadata if doc.metadata else {"source": "unknown"} for doc in docs
        ]

        # Convert any non compatible datatype for chromadb metadatas type to a string representation
        # Created a new variable for metas since metadatas is immuatble type 'Mapping'
        metas = []
        for metadata in metadatas:
            m = {}
            for key, value in metadata.items():
                # Chroma expects metadata value to be a str, int, float, bool, or None
                if not value or not isinstance(value, (float, int, bool, str)):
                    m[key] = str(value)
                else:
                    m[key] = value

            metas.append(m)

        embeds = self.embedder.embed(contents)
        ids = [str(rand_uid()) for _ in range(len(docs))]
        self.collection.add(
            ids=ids,
            documents=contents if store_content else None,
            metadatas=metas,
            embeddings=embeds,
        )

    def query(self, texts, k: int = 1, *args, **kwargs):
        embeds = self.embedder.embed(texts)
        results: QueryResult = self.collection.query(
            query_embeddings=embeds, n_results=k, *args, **kwargs
        )
        if results["documents"] is None:
            return None

        documents = results["documents"]
        metadatas = results["metadatas"] or [[]]
        return [
            [
                Document(metadata=metadata, content=content)
                for metadata, content in zip(metadatas, contents, strict=False)
            ]
            for metadatas, contents in zip(metadatas, documents, strict=False)
        ]

    def delete(self, *args, **kwargs):
        self.collection.delete(*args, **kwargs)

    def get(self, *args, **kwargs) -> Documents | None:
        results = self.collection.get(*args, **kwargs)
        if results["documents"] is None:
            return None

        documents = results["documents"]
        metadatas = results["metadatas"] or []
        return [
            Document(metadata=metadata, content=content)
            for metadata, content in zip(metadatas, documents, strict=False)
        ]

    def reset(self):
        return self.store.reset()
