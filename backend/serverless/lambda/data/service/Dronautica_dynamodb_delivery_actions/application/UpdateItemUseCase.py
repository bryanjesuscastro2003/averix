from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class UpdateItemUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> ItemModel:
        itemResponse = self.item_repository.get_item(item.id)
        if itemResponse is None:
            raise Exception("Item not found")
        item.timestamp = itemResponse["timestamp"]
        return self.item_repository.update_item(item)