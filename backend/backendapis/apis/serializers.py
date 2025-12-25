from rest_framework import serializers
from .models import BarcodeComponents, Barcodes, Inventory, OutwardSale, OutwardSaleItem, BarcodeRelationship
from apis.models import (
    BarcodeRelationship,
    BarcodeComponents,
    Barcodes,
    Inventory,
    OutwardSale,
    OutwardSaleItem,

    )
class BarcodeComponentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarcodeComponents
        fields = ['id', 'level', 'component_left', 'component_right']

class BarcodesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barcodes
        fields = ['id', 'barcode', 'barcodecomponents', 'description', 'created_at', 'updated_at']

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ['id', 'barcode', 'brand', 'calculatedmrp', 'cp', 'fixedprofit', 'hsn', 'labeleddate', 'mrp', 'netcp', 'percentgst', 'percentprofit', 'productname', 'quantity', 'shippingcost', 'unit', 'vendor', 'last_updated']

class OutwardSaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutwardSaleItem
        fields = ['item_name', 'quantity', 'price']

class OutwardSaleSerializer(serializers.ModelSerializer):
    saleitems = OutwardSaleItemSerializer(many=True)

    class Meta:
        model = OutwardSale
        fields = ['id', 'saleto', 'saletophone', 'saletoemail', 'invoiceno', 'netvalue', 'saleitems', 'created_at', 'updated_at']

    def create(self, validated_data):
        saleitems_data = validated_data.pop('saleitems')
        outward_sale = OutwardSale.objects.create(**validated_data)
        for saleitem_data in saleitems_data:
            OutwardSaleItem.objects.create(outward_sale=outward_sale, **saleitem_data)
        return outward_sale

class BarcodeRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarcodeRelationship
        fields = ['id', 'level', 'children_value', 'parent_value', 'created_at', 'updated_at']