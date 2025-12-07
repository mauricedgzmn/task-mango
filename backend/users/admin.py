from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Task, Category


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'full_name', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'full_name']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('full_name',)}),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'priority', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'created_at']
    list_filter = ['color']
    search_fields = ['name']