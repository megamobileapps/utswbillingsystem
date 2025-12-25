from django.db import models

class BarcodeComponents(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.IntegerField()
    component_left = models.CharField(max_length=100)
    component_right = models.CharField(max_length=100)
    
class Barcodes(models.Model):
    id = models.AutoField(primary_key=True)
    barcode = models.CharField(max_length=200)
    barcodecomponents = models.CharField(max_length=2000)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    barcode = models.CharField(max_length=200)
    brand = models.CharField(max_length=200)
    calculatedmrp = models.IntegerField()
    cp = models.IntegerField()
    fixedprofit = models.IntegerField()
    hsn = models.CharField(max_length=200)
    labeleddate = models.CharField(max_length=200)
    mrp = models.IntegerField()
    netcp = models.IntegerField()
    percentgst = models.IntegerField()
    percentprofit = models.IntegerField()
    productname = models.CharField(max_length=200)
    quantity = models.IntegerField()
    shippingcost = models.IntegerField()    
    unit = models.CharField(max_length=200)
    vendor = models.CharField(max_length=200)    
    last_updated = models.DateTimeField(auto_now=True)

class OutwardSale(models.Model):
    id = models.AutoField(primary_key=True)
    saleto = models.CharField(max_length=200)
    saletophone = models.CharField(max_length=20, blank=True, null=True)
    saletoemail = models.EmailField(blank=True, null=True)
    invoiceno = models.CharField(max_length=50)
    netvalue = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OutwardSaleItem(models.Model):
    outward_sale = models.ForeignKey(OutwardSale, related_name='saleitems', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Add other item-specific fields as needed, e.g., discount, tax
    
    def __str__(self):
        return f'{self.item_name} ({self.quantity})'

class BarcodeRelationship(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.IntegerField()
    children_value = models.CharField(max_length=255)
    parent_value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)