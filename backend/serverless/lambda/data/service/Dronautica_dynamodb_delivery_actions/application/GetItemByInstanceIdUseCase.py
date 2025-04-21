from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class GetItemByInstanceIdUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, instanceId: str) -> ItemModel:
        response = self.item_repository.get_itemByInstanceId(instanceId)
        if response is None:
            raise Exception("Item not found")
        return response
