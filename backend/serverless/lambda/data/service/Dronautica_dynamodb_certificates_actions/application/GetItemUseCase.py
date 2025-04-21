from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel  


class GetItemUseCase:
    def __init__(self, item_repository: ItemModel):
        self.item_repository = item_repository

    def execute(self, id: str) -> ItemModel:
        response = self.item_repository.get_item(id)
        if response is None:
            raise Exception("Item not found")
        return response