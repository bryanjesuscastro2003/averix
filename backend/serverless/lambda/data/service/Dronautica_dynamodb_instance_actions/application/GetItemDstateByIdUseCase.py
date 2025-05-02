from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class GetItemDstateByIdUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, id: str) -> str:
        return self.item_repository.get_itemDstate(id)