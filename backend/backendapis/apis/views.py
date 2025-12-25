from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BarcodeComponents, Barcodes, Inventory, OutwardSale, BarcodeRelationship
from .serializers import BarcodeComponentsSerializer, BarcodesSerializer, InventorySerializer, OutwardSaleSerializer, BarcodeRelationshipSerializer
from rest_framework import filters

class BarcodeComponentsViewSet(viewsets.ModelViewSet):
    queryset = BarcodeComponents.objects.all()
    serializer_class = BarcodeComponentsSerializer

    # serializer_class = BarcodeComponentsSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['level', 'component_left', 'component_right']

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Handle 'id' for auto-increment
        if 'id' in data:
            del data['id']

        component = data.get('component')
        if component:
            parts = component.split('###')
            if len(parts) == 2:
                data['component_left'] = parts[0]
                data['component_right'] = parts[1]
                del data['component'] # Remove the original component field
            else:
                return Response({"detail": "Component field must be in 'left###right' format."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"detail": "Component field is required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class BarcodesViewSet(viewsets.ModelViewSet):
    queryset = Barcodes.objects.all()
    serializer_class = BarcodesSerializer

    # serializer_class = BarcodesSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['barcode', 'barcodecomponents']

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['barcode', 'brand', 'productname', 'vendor']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Transform the data to the desired nested structure
        transformed_data = [{'itemdetails': item} for item in serializer.data]
        
        return Response(transformed_data)


    def retrieve_by_barcode_and_date(self, request, barcode=None, labeleddate=None):
        inventory = get_object_or_404(Inventory, barcode=barcode, labeleddate=labeleddate)
        serializer = self.get_serializer(inventory)
        return Response({'itemdetails': serializer.data})

    def create(self, request, *args, **kwargs):
        barcode = self.kwargs.get('barcode')
        labeleddate = self.kwargs.get('labeleddate')

        if not barcode or not labeleddate:
            return Response({"detail": "Barcode and labeleddate are required in the URL."}, status=status.HTTP_400_BAD_REQUEST)

        # The inventory data is nested in the 'itemdetails' key
        item_details = request.data.get('itemdetails')
        if not item_details:
            return Response({"detail": "Missing 'itemdetails' in request body."}, status=status.HTTP_400_BAD_REQUEST)


        # Get the valid field names for the Inventory model
        valid_field_names = [f.name for f in Inventory._meta.get_fields()]

        # Use the URL data for the key fields, and the item_details for the rest.
        data = item_details.copy()
        data['barcode'] = barcode
        data['labeleddate'] = labeleddate

        # Filter the data to only include valid field names
        filtered_data = {key: value for key, value in data.items() if key in valid_field_names}

        # Ensure 'id' is not passed for creation, let the DB handle it.
        if 'id' in filtered_data:
            del filtered_data['id']

        try:
            # Check if an inventory item with this barcode and labeleddate already exists.
            # If it does, update it. If not, create a new one.
            inventory, created = Inventory.objects.get_or_create(
                barcode=barcode,
                labeleddate=labeleddate,
                defaults=filtered_data
            )

            if created:
                serializer = self.get_serializer(inventory)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # If the item already exists, update it with the new data.
                serializer = self.get_serializer(inventory, data=filtered_data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
        except IntegrityError as e:
            return Response({
                "detail": f"IntegrityError: {e}",
                "received_data": request.data,
                "filtered_data_used": filtered_data
            }, status=status.HTTP_400_BAD_REQUEST)

class OutwardSaleViewSet(viewsets.ModelViewSet):
    queryset = OutwardSale.objects.all()
    serializer_class = OutwardSaleSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['saleto', 'invoiceno', 'saletophone']

class BarcodeRelationshipViewSet(viewsets.ModelViewSet):
    queryset = BarcodeRelationship.objects.all()
    serializer_class = BarcodeRelationshipSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['level', 'parent_value', 'children_value']