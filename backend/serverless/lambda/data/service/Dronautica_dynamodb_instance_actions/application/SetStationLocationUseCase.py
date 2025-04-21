from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class SetStationLocationUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> None:
        itemResponse = self.item_repository.get_item_by_id(item)
        if itemResponse is None:
            raise Exception("Item not found")
        
        if not itemResponse["isAssociated"]:
            item.capacity = itemResponse["capacity"]
            self.item_repository.set_stationLocation(item)

            