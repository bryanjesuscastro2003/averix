from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class GetItemByIdUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, itemId: str) -> ItemModel:
        item = self.item_repository.get_item(itemId)
        if item is None:
            raise Exception("Item not found")
        return item