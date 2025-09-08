from collections.abc import Sequence

from chonkie import RecursiveChunker

from ..common_types.base import Document, Documents


def recursive_chunker(docs: Documents):
    chunker = RecursiveChunker().from_recipe("markdown", chunk_size=1000)
    chunked_docs: Documents = []
    for doc in docs:
        if not doc.content:
            continue

        chunks = chunker(doc.content)
        for chunk in chunks:
            if not isinstance(chunk, Sequence):
                chunked_docs.append(
                    Document(
                        content=chunk.text,
                        metadata={**(doc.metadata or {})},
                    ),
                )

    return chunked_docs
