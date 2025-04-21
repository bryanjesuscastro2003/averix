from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class UpdateItemUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> str:
        return self.item_repository.update_item(item)