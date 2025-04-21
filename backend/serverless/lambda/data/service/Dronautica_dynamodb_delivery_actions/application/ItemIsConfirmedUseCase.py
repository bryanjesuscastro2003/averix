from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class ItemIsConfirmedUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, itemId: str, primaryUser: str, secondaryUser: str) -> bool:

        isAuthorized = self.item_repository.item_isAuthorized(itemId, primaryUser, secondaryUser)
        if not isAuthorized:
            raise Exception("Delivery is not authorized")
        return self.item_repository.item_isConfirmed(itemId)