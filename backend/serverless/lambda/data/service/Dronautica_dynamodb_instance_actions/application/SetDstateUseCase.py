from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class SetDstateUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel, refresh = False) -> int:
        activeActions = ["TAKEOFF","STARTUP","GETDAT1", "GETDAT2", "GETMFST","TRACKING", "LANDST1", "DOLANDST3", "DOLANDST2", "LANDST2", "LANDST3", "MOVINGFORWARD", "POINTINGN", "SPINNING", "BUSY_ST_2"]
        itemResponse = self.item_repository.get_item_by_id(item)
        if itemResponse is None:
            raise Exception("Item not found")
        item.capacity = itemResponse["capacity"]
        if itemResponse["dstate"] in activeActions and not refresh and item.dstate != "UNAVAILABLE":
            return 1
        self.item_repository.set_dstate(item)
        return 0
        