from django.contrib import admin
from .models import BarcodeComponents

@admin.register(BarcodeComponents)
class BarcodeComponentsAdmin(admin.ModelAdmin):
    list_display = ('level', 'component_left', 'component_right')
    search_fields = ['level', 'component_left', 'component_right']
    # prepopulated_fields = {'slug': []}  # If you need to prepopulate any fields, specify them here
