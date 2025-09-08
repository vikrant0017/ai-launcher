from unstructured.chunking.basic import chunk_elements
from unstructured.chunking.title import chunk_by_title

from ..common_types.base import Documents
from ..utils.adapters.unstructured import doc_to_el, el_to_doc


def basic_chunking(docs: Documents, *args, **kwargs):
    """Use *args and **kwargs from unstructured `chunk_elements` api.

    Args:
        docs (Documents): The documents to chunk.
        *args: Variable length argument list passed to `chunk_elements`.
        **kwargs: Arbitrary keyword arguments passed to `chunk_elements`.

    See Also:
        https://docs.unstructured.io/open-source/core-functionality/chunking

    """
    elements = doc_to_el(docs)
    chunked_elements = chunk_elements(elements, *args, **kwargs)
    return el_to_doc(chunked_elements)


def by_title_chunking(docs: Documents, *args, **kwargs):
    """Use *args and **kwargs from unstructured `chunk_by_title` api.

    Args:
        docs (Documents): The documents to chunk.
        *args: Variable length argument list passed to chunk_by_title.
        **kwargs: Arbitrary keyword arguments passed to chunk_by_title.

    See Also:
        https://docs.unstructured.io/open-source/core-functionality/chunking

    """
    elements = doc_to_el(docs)
    chunked_elements = chunk_by_title(
        elements, *args, **kwargs,
    )
    return el_to_doc(chunked_elements)
