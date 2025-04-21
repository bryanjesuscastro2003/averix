from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel


class PackageItemUseCase:
    def __init__(self, item_repository: ItemRepository):
        self.item_repository = item_repository

    def execute(self, item: ItemModel) -> None:
        itemResponse = self.item_repository.get_item_by_id(item)
        if itemResponse is None:
            raise Exception("Item not found")
        item.capacity = itemResponse["capacity"]
        credId = self.item_repository.set_credentialsId(item)
        logsId = self.item_repository.set_logsId(item)
        mqttId = self.item_repository.set_mqttId(item)
