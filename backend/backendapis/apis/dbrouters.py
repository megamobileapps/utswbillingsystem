
from apis.models import (
    BarcodeRelationship,
    BarcodeComponents,
    Barcodes,
    Inventory,
    OutwardSale,
    OutwardSaleItem,

    )


class UDBRouters(object):
    def __init__(self):
        self.invTables = [
            BarcodeRelationship,
            BarcodeComponents,
            Barcodes,
            Inventory,
            OutwardSale,
            OutwardSaleItem
                ]

    def db_for_read(self, model, **hints):
        """ reading SomeModel from otherdb """
        if model in self.invTables:
            return 'inv'
        else:
            return 'v1'
        return None

    def db_for_write(self, model, **hints):
        """ writing SomeModel to otherdb """
        if model in self.invTables:
            return 'inv'
        else:
            return 'v1'
        return None