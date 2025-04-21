from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class GetItemsAvailablesByCapacityUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, capacity: str) -> list:
        items = self.item_repository.get_items_availables_by_capacity(capacity)
        return items