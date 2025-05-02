from abc import ABC, abstractmethod
from domain.model.ItemModel import ItemModel 


class ItemRepository(ABC):
    @abstractmethod
    def put_item(self, item: ItemModel) -> str:
        pass

    @abstractmethod
    def get_item_by_id(self, item: ItemModel) -> ItemModel:
        pass
    
    @abstractmethod
    def get_item_by_name(self, item: ItemModel) -> ItemModel:
        pass
    
    @abstractmethod
    def get_items_availables(self) -> list:
        pass 
    
    @abstractmethod
    def get_items_availables_by_capacity(self, capacity: str) -> list:
        pass
    
    @abstractmethod
    def set_dstate(self, item: ItemModel) -> str:
        pass

    @abstractmethod
    def set_credentialsId(self, item: ItemModel) -> str:
        pass
    
    @abstractmethod
    def set_logsId(self, item: ItemModel) -> str:
        pass
    
    @abstractmethod
    def set_mqttId(self, item: ItemModel) -> str:
        pass

    @abstractmethod
    def set_stationLocation(self, item: ItemModel) -> None:
        pass

    @abstractmethod
    def get_items(self) -> list:
        pass

    @abstractmethod
    def get_itemDstate(self, id: str) -> str:
        pass 
    
 