from abc import ABC, abstractmethod
from domain.model.ItemModel import ItemModel 


class ItemRepository(ABC):
    @abstractmethod
    def add_item(self, item: ItemModel) -> str:
        pass
    
    @abstractmethod
    def update_item(self, item: ItemModel) -> str:
        pass

    @abstractmethod
    def get_items(self) -> list[ItemModel]:
        pass

    @abstractmethod
    def get_item(self, id: str) -> ItemModel:
        pass
    
    @abstractmethod
    def get_item_where_participants_lower_than() -> list[ItemModel]:
        pass