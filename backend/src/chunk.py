# File[md,pdf,etc] -> Extract & Partition -> Chunk -> Other pipeline
# Partition is just structruing based on the semantics of the document
# Chunk is splitting/combining in chunks for vector storage, may not need the entire metadata

from copy import deepcopy

from unstructured.chunking.basic import chunk_elements
from unstructured.chunking.title import chunk_by_title
from unstructured.staging.base import elements_from_dicts, elements_to_dicts

from ingest import Document, Documents


def basic_chunking(docs: Documents):
    # TODO: Put Doc -> El and El -> doc into a util
    # This is required since I want a uniform type for modules
    elements = elements_from_dicts(
        [
            {**dict(doc), "type": doc.metadata["type"], "text": doc.content}
            for doc in docs
        ],
    )
    chunked_elements = chunk_elements(elements, max_characters=400)
    dict_chunked_elements = elements_to_dicts(chunked_elements)
    return [
        Document(
            content=el["text"],
            metadata=deepcopy({"type": el["type"], **el["metadata"]}),
        )
        for el in dict_chunked_elements
    ]


def bytitle_chunking(docs: Documents):
    # TODO: Put Doc -> El and El -> doc into a util
    # This is required since I want a uniform type for modules
    elements = elements_from_dicts(
        [
            {**dict(doc), "type": doc.metadata["type"], "text": doc.content}
            for doc in docs
        ],
    )
    chunked_elements = chunk_by_title(
        elements, max_characters=1000, combine_text_under_n_chars=100,
    )
    dict_chunked_elements = elements_to_dicts(chunked_elements)
    return [
        Document(
            content=el["text"],
            metadata=deepcopy({"type": el["type"], **el["metadata"]}),
        )
        for el in dict_chunked_elements
    ]
