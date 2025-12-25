from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import BarcodeComponentsViewSet, BarcodesViewSet, InventoryViewSet, OutwardSaleViewSet, BarcodeRelationshipViewSet
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'barcode-components', BarcodeComponentsViewSet)
router.register(r'barcodes', BarcodesViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'outwardsale', OutwardSaleViewSet)
router.register(r'barcode-relationship', BarcodeRelationshipViewSet)

urlpatterns = [
    re_path(r'^inventory/(?P<barcode>[^/.]+)/(?P<labeleddate>[^/.]+)/?$', InventoryViewSet.as_view({'get': 'retrieve_by_barcode_and_date', 'post': 'create'}), name='inventory-retrieve-by-barcode-and-date'),
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]