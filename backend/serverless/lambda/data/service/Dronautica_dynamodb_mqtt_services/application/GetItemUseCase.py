from domain.repository.ItemRepository import ItemRepository
from domain.repository.SlaveRepository import SlaveRepository
from domain.model.ItemModel import ItemModel
from domain.model.SlaveModel import SlaveModel

class GetItemUseCase:
    def __init__(self, item_repository: ItemRepository, slave_repository: SlaveRepository ):
        self.item_repository = item_repository
        self.slave_repository = slave_repository

    def execute(self, slaveId: str) -> dict:
        slaveItem = self.slave_repository.get_item(slaveId)
        if slaveItem is None:
            raise Exception("Slave not found")
        masterId = slaveItem["masterId"]
        masterItem = self.item_repository.get_item(masterId)
        if masterItem is None:
            raise Exception("Master not found")
        return {
            "master": masterItem,
            "slave": slaveItem
        }
