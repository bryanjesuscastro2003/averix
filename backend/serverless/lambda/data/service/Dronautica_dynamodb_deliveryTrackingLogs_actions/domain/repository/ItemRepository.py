from abc import ABC, abstractmethod
from domain.model.ItemModel import ItemModel 


class ItemRepository(ABC):
    @abstractmethod
    def add_item(self, item: ItemModel) -> str:
        pass

    @abstractmethod
    def get_item(self, item_id: str) -> ItemModel:
        pass

    @abstractmethod
    def set_itemLocatiions(self, item: ItemModel) -> None:
        pass