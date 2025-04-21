from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class GetItemsUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self) -> str:
        return self.item_repository.get_items()