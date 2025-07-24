# In api/permissions.py
from rest_framework.permissions import BasePermission

class IsVendor(BasePermission):
    """
    Allows access only to users with the 'is_vendor' flag set to True.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_vendor