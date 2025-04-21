from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class SetDstateUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> None:
        itemResponse = self.item_repository.get_item(item.id)
        if itemResponse is None:
            raise Exception("Item not found . ")
        item.timestamp = itemResponse["timestamp"]
        response = self.item_repository.set_dState(item)
        if not response:
            raise Exception("Error updating item state . ")
        

