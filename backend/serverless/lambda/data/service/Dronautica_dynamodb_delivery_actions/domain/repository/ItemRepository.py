from abc import ABC, abstractmethod
from domain.model.ItemModel import ItemModel 


class ItemRepository(ABC):
    @abstractmethod
    def add_item(self, item: ItemModel) -> str:
        pass
    
    @abstractmethod
    def verify_primaryUser(self, primaryUser: str, deliveryId: str) -> bool:
        pass

    @abstractmethod
    def verify_secondaryUser(self, secondaryUser: str, deliveryId: str) -> bool:
        pass
    
    @abstractmethod
    def get_item(self, itemId: str) -> ItemModel:
        pass 
    
    @abstractmethod
    def get_itemByInstanceId(self, instanceId: str) -> ItemModel:
        pass

    @abstractmethod
    def update_item(self, item: ItemModel) -> ItemModel: 
        pass 

    @abstractmethod
    def confirm_item(self, item: ItemModel) -> ItemModel: 
        pass 

    @abstractmethod
    def item_isConfirmed(self, itemId: str) -> bool:
        pass
    
    @abstractmethod
    def set_dState(self, item: ItemModel) -> bool: 
        pass 
    
    @abstractmethod
    def get_items(self, primaryUser: str) -> list:
        pass 

    @abstractmethod
    def item_isAuthorized(self, itemId: str, primaryUser: str, secondaryUser: str):
        pass 
    
    @abstractmethod
    def set_cost_and_distance(self, item: ItemModel) -> bool:
        pass

