# In api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ShopOwner, StoreProfile, Offer

class ShopOwnerInline(admin.StackedInline):
    model = ShopOwner
    can_delete = False
    verbose_name_plural = 'Shop Owner Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    # Add 'is_vendor' to the main user form
    fieldsets = UserAdmin.fieldsets + (
        ('User Role', {'fields': ('is_vendor',)}),
    )
    # Show 'is_vendor' in the user list
    list_display = ('username', 'email', 'is_staff', 'is_vendor')

    def get_inlines(self, request, obj=None):
        # Show the ShopOwnerInline ONLY if the user object exists AND is_vendor is True
        if obj and obj.is_vendor:
            return (ShopOwnerInline,)
        return ()

class StoreProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_username', 'category', 'is_approved')
    list_filter = ('is_approved', 'category')
    search_fields = ('name', 'owner__user__username')

    @admin.display(description='Owner Username')
    def owner_username(self, obj):
        return obj.owner.user.username

class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'store', 'start_time', 'end_time', 'is_active', 'is_approved')
    list_filter = ('is_approved', 'is_active', 'store')
    search_fields = ('title', 'store__name')

# Register your models
admin.site.register(User, CustomUserAdmin)
admin.site.register(StoreProfile, StoreProfileAdmin)
admin.site.register(Offer, OfferAdmin)