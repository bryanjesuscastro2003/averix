from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class PutItemUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> str:
        itemResponse = self.item_repository.get_item_by_name(item)
        if itemResponse is None:
            itemId = self.item_repository.put_item(item)
            return itemId
        else:
            raise Exception("Item already exists, please select another instance name . ")

        