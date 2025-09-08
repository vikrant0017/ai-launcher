from copy import deepcopy

from unstructured.documents.elements import Element
from unstructured.staging.base import elements_from_dicts, elements_to_dicts

from ...common_types.base import Document, Documents


def el_to_doc(elements: list[Element]) -> Documents:
    """Convert unstructured Element Type to Document Type"""
    elements_dict = elements_to_dicts(elements)
    return [
        Document(
            content=el["text"],
            metadata=deepcopy({"type": el["type"], **el["metadata"]}),
        )
        for el in elements_dict
    ]


def doc_to_el(docs: Documents) -> list[Element]:
    """Convert Document Type -> Element Type"""
    return elements_from_dicts(
        [
            {**dict(doc), "type": doc.metadata["type"], "text": doc.content}
            for doc in docs
        ],
    )
