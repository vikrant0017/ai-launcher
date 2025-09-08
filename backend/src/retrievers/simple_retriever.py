
from ..common_types.base import Documents
from ..stores.base import Store
from .base import Retriver


class SimpleRetriver(Retriver):
    def __init__(self, store: Store, docs=None, k = 1, store_content=True):
        super().__init__()
        self.k = k
        self.store = store
        self.store_content = store_content
        if docs is not None:
            self.add(docs)

    def add(self, docs: Documents):
        self.store.add(docs, self.store_content)

    def query(self, input: list[str], k: int | None=None) -> list[Documents] | None:
        result = self.store.query(texts=input, k=(k or self.k))
        return result

    def delete(self, *args, **kwargs) -> list[Documents] | None:
        result = self.store.delete(*args, **kwargs)
        return result

    # Debugging purposes
    def _get_all(self, *args, **kwargs) -> list[Documents] | None:
        result = self.store.get(*args, **kwargs)
        return result
