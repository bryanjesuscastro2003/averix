from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel  


class AddItemUseCase:
    def __init__(self, item_repository: ItemModel):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> str:
        return self.item_repository.add_item(item)