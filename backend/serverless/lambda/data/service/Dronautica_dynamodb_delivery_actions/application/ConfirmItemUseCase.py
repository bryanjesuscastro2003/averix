from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class ConfirmItemUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> ItemModel:
        itemResponse = self.item_repository.get_item_to_confirm(item.id)
        if itemResponse is None:
            raise Exception("Item not found")
        item.timestamp = itemResponse["timestamp"]
        return self.item_repository.confirm_item(item)