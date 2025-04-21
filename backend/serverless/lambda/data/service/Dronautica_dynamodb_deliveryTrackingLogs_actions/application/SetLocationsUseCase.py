from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class SetLocationsUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> None:
        itemResponse = self.item_repository.get_item(item.id)
        print(itemResponse)
        if item is None:
            raise Exception("Item not found")
        item.timestamp = itemResponse["timestamp"]    
        item.oldLocation = itemResponse["currentLocation"]
        self.item_repository.set_itemLocatiions(item)

         