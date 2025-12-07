from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
from .models import Task, Category
from .serializers import (
    UserSerializer, TaskSerializer, CategorySerializer, 
    DashboardStatsSerializer
)

User = get_user_model()


class RegisterUserView(APIView):
    def post(self, request, *args, **kwargs):
        full_name = request.data.get('full_name')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not all([email, password, confirm_password]):
            return Response(
                {"message": "Email, password, and confirm password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {"message": "Passwords do not match!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "User with this email already exists!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                username=full_name if full_name else email,
                email=email,
                password=password,
                full_name=full_name
            )
            
            # Create hierarchical default categories for new user
            category_structure = [
                {
                    'name': 'Work/Professional',
                    'color': 'blue',
                    'icon': 'Briefcase',
                    'subcategories': [
                        {'name': 'Meetings', 'color': 'blue', 'icon': 'Users'},
                        {'name': 'Emails', 'color': 'blue', 'icon': 'Mail'},
                        {'name': 'Deep Work', 'color': 'indigo', 'icon': 'Brain'},
                        {'name': 'Admin', 'color': 'blue', 'icon': 'FileText'},
                    ]
                },
                {
                    'name': 'Personal/Home',
                    'color': 'green',
                    'icon': 'Home',
                    'subcategories': [
                        {'name': 'Errands', 'color': 'green', 'icon': 'ShoppingBag'},
                        {'name': 'Chores', 'color': 'green', 'icon': 'Wrench'},
                        {'name': 'Family', 'color': 'pink', 'icon': 'Heart'},
                        {'name': 'Finances', 'color': 'green', 'icon': 'DollarSign'},
                        {'name': 'Health', 'color': 'red', 'icon': 'Activity'},
                    ]
                },
                {
                    'name': 'Learning/Growth',
                    'color': 'purple',
                    'icon': 'BookOpen',
                    'subcategories': [
                        {'name': 'Skill Development', 'color': 'purple', 'icon': 'Target'},
                        {'name': 'Reading', 'color': 'purple', 'icon': 'Book'},
                        {'name': 'Courses', 'color': 'indigo', 'icon': 'GraduationCap'},
                    ]
                },
                {
                    'name': 'Health & Wellness',
                    'color': 'red',
                    'icon': 'Heart',
                    'subcategories': [
                        {'name': 'Exercise', 'color': 'red', 'icon': 'Dumbbell'},
                        {'name': 'Meal Prep', 'color': 'orange', 'icon': 'Utensils'},
                        {'name': 'Appointments', 'color': 'red', 'icon': 'Calendar'},
                    ]
                },
            ]
            
            for parent_data in category_structure:
                subcategories = parent_data.pop('subcategories', [])
                parent_cat = Category.objects.create(user=user, **parent_data)
                
                for sub_data in subcategories:
                    Category.objects.create(user=user, parent=parent_cat, **sub_data)
            
            return Response(
                {"message": "User created successfully!", "email": user.email}, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"message": f"Registration failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginUserView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        
        if not all([email, password]):
            return Response(
                {"message": "Email and password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                return Response({
                    "message": "Login successful!", 
                    "user": {
                        "id": user.id,
                        "email": user.email, 
                        "full_name": user.full_name or user.username
                    },
                    "token": str(access_token)
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"message": "Invalid credentials"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {"message": "Invalid credentials"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class VerifyTokenView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'valid': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'full_name': request.user.full_name or request.user.username
            }
        }, status=status.HTTP_200_OK)


class UpdateUsernameView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        username = request.data.get('username')
        
        if not username or not username.strip():
            return Response(
                {"message": "Username cannot be empty"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user.full_name = username.strip()
            user.username = username.strip()
            user.save()
            
            return Response({
                "message": "Username updated successfully!",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "full_name": user.full_name
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": f"Failed to update username: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UpdatePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not all([current_password, new_password]):
            return Response(
                {"message": "Current password and new password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {"message": "Current password is incorrect"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 6:
            return Response(
                {"message": "New password must be at least 6 characters long"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user.set_password(new_password)
            user.save()
            
            return Response({
                "message": "Password updated successfully!"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": f"Failed to update password: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# DASHBOARD VIEWS

class DashboardStatsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        
        # Get current time for overdue calculation
        now = timezone.now()
        
        # Count overdue tasks (due_date is in the past and not completed)
        overdue_count = tasks.filter(
            due_date__lt=now,
            status__in=['pending', 'in_progress']
        ).count()
        
        stats = {
            'total_tasks': tasks.count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'completed': tasks.filter(status='completed').count(),
            'pending': tasks.filter(status='pending').count(),
            'high_priority': tasks.filter(priority='high').count(),
            'categories_count': Category.objects.filter(user=user).count(),
            'overdue': overdue_count,
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OverdueTasksView(APIView):
    """Get all overdue tasks"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Get tasks that are past due date and not completed
        overdue_tasks = Task.objects.filter(
            user=user,
            due_date__lt=now,
            status__in=['pending', 'in_progress']
        ).order_by('due_date')
        
        serializer = TaskSerializer(overdue_tasks, many=True)
        return Response({
            'count': overdue_tasks.count(),
            'tasks': serializer.data
        }, status=status.HTTP_200_OK)


class TodayTasksView(APIView):
    """Get all tasks due today"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get today's date
        now = timezone.now()
        today = now.date()
        
        print(f"=== Today Tasks Debug ===")
        print(f"Current time: {now}")
        print(f"Today date: {today}")
        
        # Get ALL tasks for this user to debug
        all_tasks = Task.objects.filter(user=user)
        print(f"Total tasks for user: {all_tasks.count()}")
        
        for task in all_tasks:
            if task.due_date:
                print(f"Task: {task.title}, Due: {task.due_date}, Due date only: {task.due_date.date()}")
        
        # Get tasks due today - using date comparison
        today_tasks = Task.objects.filter(
            user=user,
            due_date__date=today
        ).order_by('priority', 'due_date')
        
        print(f"Tasks due today: {today_tasks.count()}")
        
        serializer = TaskSerializer(today_tasks, many=True)
        
        # Calculate stats
        completed_count = today_tasks.filter(status='completed').count()
        total_count = today_tasks.count()
        
        return Response({
            'count': total_count,
            'completed': completed_count,
            'completion_rate': round((completed_count / total_count * 100) if total_count > 0 else 0, 1),
            'tasks': serializer.data
        }, status=status.HTTP_200_OK)


class CalendarTasksView(APIView):
    """Get tasks grouped by date for calendar view"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get month and year from query params (default to current month)
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)
        
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response(
                {"message": "Invalid month or year"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get first and last day of the month
        first_day = datetime(year, month, 1)
        if month == 12:
            last_day = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day = datetime(year, month + 1, 1) - timedelta(days=1)
        
        # Get all tasks for the user with due dates in this month
        tasks = Task.objects.filter(
            user=user,
            due_date__gte=first_day,
            due_date__lte=last_day
        ).order_by('due_date')
        
        # Group tasks by date
        tasks_by_date = {}
        for task in tasks:
            if task.due_date:
                date_key = task.due_date.strftime('%Y-%m-%d')
                if date_key not in tasks_by_date:
                    tasks_by_date[date_key] = []
                
                tasks_by_date[date_key].append({
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'priority': task.priority,
                    'status': task.status,
                    'due_date': task.due_date,
                    'category': {
                        'id': task.category.id,
                        'name': task.category.name,
                        'color': task.category.color,
                        'icon': task.category.icon,
                        'full_name': task.category.full_name if hasattr(task.category, 'full_name') else task.category.name
                    } if task.category else None
                })
        
        return Response({
            'month': month,
            'year': year,
            'tasks_by_date': tasks_by_date
        }, status=status.HTTP_200_OK)


class WeeklyProgressView(APIView):
    """Get weekly progress statistics"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get the current week (Monday to Sunday)
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        # Get tasks for each day of the week
        weekly_data = []
        for i in range(7):
            day = start_of_week + timedelta(days=i)
            day_start = datetime.combine(day, datetime.min.time())
            day_end = datetime.combine(day, datetime.max.time())
            
            # Make timezone aware
            day_start = timezone.make_aware(day_start)
            day_end = timezone.make_aware(day_end)
            
            tasks = Task.objects.filter(
                user=user,
                due_date__gte=day_start,
                due_date__lte=day_end
            )
            
            completed = tasks.filter(status='completed').count()
            total = tasks.count()
            
            weekly_data.append({
                'date': day.strftime('%Y-%m-%d'),
                'day_name': day.strftime('%A'),
                'day_short': day.strftime('%a'),
                'total_tasks': total,
                'completed_tasks': completed,
                'completion_rate': round((completed / total * 100) if total > 0 else 0, 1),
                'is_today': day == today
            })
        
        # Calculate overall week stats
        week_tasks = Task.objects.filter(
            user=user,
            due_date__gte=timezone.make_aware(datetime.combine(start_of_week, datetime.min.time())),
            due_date__lte=timezone.make_aware(datetime.combine(end_of_week, datetime.max.time()))
        )
        
        total_week_tasks = week_tasks.count()
        completed_week_tasks = week_tasks.filter(status='completed').count()
        
        return Response({
            'week_start': start_of_week.strftime('%Y-%m-%d'),
            'week_end': end_of_week.strftime('%Y-%m-%d'),
            'daily_progress': weekly_data,
            'week_summary': {
                'total_tasks': total_week_tasks,
                'completed_tasks': completed_week_tasks,
                'completion_rate': round((completed_week_tasks / total_week_tasks * 100) if total_week_tasks > 0 else 0, 1)
            }
        }, status=status.HTTP_200_OK)


# TASK VIEWS

class TaskListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tasks = Task.objects.filter(user=request.user)
        
        # Search by title or category
        search_query = request.query_params.get('search')
        if search_query:
            tasks = tasks.filter(
                Q(title__icontains=search_query) | 
                Q(category__name__icontains=search_query) |
                Q(category__parent__name__icontains=search_query)
            )
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        # Filter by priority if provided
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            tasks = tasks.filter(priority=priority_filter)
        
        # Filter by category if provided
        category_filter = request.query_params.get('category')
        if category_filter:
            tasks = tasks.filter(category_id=category_filter)
        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return Task.objects.get(pk=pk, user=user)
        except Task.DoesNotExist:
            return None
    
    def get(self, request, pk):
        task = self.get_object(pk, request.user)
        if not task:
            return Response(
                {"message": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        task = self.get_object(pk, request.user)
        if not task:
            return Response(
                {"message": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        if not task:
            return Response(
                {"message": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        task.delete()
        return Response(
            {"message": "Task deleted successfully"}, 
            status=status.HTTP_204_NO_CONTENT
        )


# CATEGORY VIEWS

class CategoryListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return Category.objects.get(pk=pk, user=user)
        except Category.DoesNotExist:
            return None
    
    def get(self, request, pk):
        category = self.get_object(pk, request.user)
        if not category:
            return Response(
                {"message": "Category not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        category = self.get_object(pk, request.user)
        if not category:
            return Response(
                {"message": "Category not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        category = self.get_object(pk, request.user)
        if not category:
            return Response(
                {"message": "Category not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        category.delete()
        return Response(
            {"message": "Category deleted successfully"}, 
            status=status.HTTP_204_NO_CONTENT
        )