from abc import ABC, abstractmethod
from domain.model.SlaveModel import SlaveModel

class SlaveRepository(ABC):
    @abstractmethod
    def add_item(self, slave: SlaveModel) -> str:
        pass
    
    @abstractmethod
    def get_item(self, slave_id: str) -> SlaveModel:
        pass

