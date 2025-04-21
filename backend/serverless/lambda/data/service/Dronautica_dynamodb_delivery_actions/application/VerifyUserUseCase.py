from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class VerifyUserUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, isPrimaryUser: bool, value: str, deliveryId: str) -> bool:
        if isPrimaryUser:
            return self.item_repository.verify_primaryUser(value, deliveryId)
        return self.item_repository.verify_secondaryUser(value, deliveryId)


        

