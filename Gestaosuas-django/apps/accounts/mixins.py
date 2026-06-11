from django.contrib.auth.mixins import AccessMixin
from django.shortcuts import redirect

class RoleRequiredMixin(AccessMixin):
    """Verify that the current user has one of the allowed roles."""
    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        
        user_role = getattr(request.user.profile, 'role', 'user')
        if user_role not in self.allowed_roles and not request.user.is_superuser:
            return self.handle_no_permission()
            
        return super().dispatch(request, *args, **kwargs)
