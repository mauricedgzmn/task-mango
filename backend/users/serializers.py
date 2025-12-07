from rest_framework import serializers
from .models import CustomUser, Task, Category

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'full_name', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        return user


class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name', 'full_name', 'color', 'icon', 'task_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_full_name(self, obj):
        if obj.parent:
            return f"{obj.parent.name} > {obj.name}"
        return obj.name


class TaskSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'due_date', 'completed_at', 'category', 'category_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'completed_at']
    
    def validate(self, data):
        if data.get('status') == 'completed' and not data.get('completed_at'):
            from django.utils import timezone
            data['completed_at'] = timezone.now()
        return data


class DashboardStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    pending = serializers.IntegerField()
    high_priority = serializers.IntegerField()
    categories_count = serializers.IntegerField()
    overdue = serializers.IntegerField()  # NEW: Added overdue count