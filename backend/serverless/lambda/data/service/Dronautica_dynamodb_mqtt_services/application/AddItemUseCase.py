from domain.repository.ItemRepository import ItemRepository
from domain.repository.SlaveRepository import SlaveRepository
from domain.model.ItemModel import ItemModel
from domain.model.SlaveModel import SlaveModel

class AddItemUseCase:
    def __init__(self, item_repository: ItemRepository, slave_repository: SlaveRepository ):
        self.item_repository = item_repository
        self.slave_repository = slave_repository

    def execute(self, item: ItemModel, slaveModel: SlaveModel) -> dict:
        items = self.item_repository.get_item_where_participants_lower_than()
        if len(items) == 0:
            item.participants = 1
            itemId = self.item_repository.add_item(item)
        else:
            item.id = items[0]["id"]
            item.participants = int(items[0]["participants"]) + 1
            itemId = self.item_repository.update_item(item)
        slaveModel.masterId = itemId
        slaveId = self.slave_repository.add_item(slaveModel)
        print(slaveId , " h")
        return {
            "masterId": itemId, 
            "slaveId": slaveId
        }
