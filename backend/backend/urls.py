from django.contrib import admin
from django.urls import path
from users.views import (
    RegisterUserView, 
    LoginUserView, 
    VerifyTokenView,
    UpdateUsernameView,        # ADD THIS
    UpdatePasswordView,        # ADD THIS
    DashboardStatsView,
    CalendarTasksView,
    WeeklyProgressView,
    OverdueTasksView,
    TodayTasksView,
    TaskListCreateView,
    TaskDetailView,
    CategoryListCreateView,
    CategoryDetailView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints
    path('api/users/register/', RegisterUserView.as_view(), name='register_user'),
    path('api/users/login/', LoginUserView.as_view(), name='login_user'),
    path('api/users/verify-token/', VerifyTokenView.as_view(), name='verify_token'),
    path('api/users/update-username/', UpdateUsernameView.as_view(), name='update_username'),      # ADD THIS
    path('api/users/update-password/', UpdatePasswordView.as_view(), name='update_password'),      # ADD THIS
    
    # Dashboard endpoints
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/dashboard/calendar/', CalendarTasksView.as_view(), name='calendar_tasks'),
    path('api/dashboard/weekly-progress/', WeeklyProgressView.as_view(), name='weekly_progress'),
    path('api/dashboard/overdue/', OverdueTasksView.as_view(), name='overdue_tasks'),
    path('api/dashboard/today/', TodayTasksView.as_view(), name='today_tasks'),
    
    # Task endpoints
    path('api/tasks/', TaskListCreateView.as_view(), name='task_list_create'),
    path('api/tasks/<int:pk>/', TaskDetailView.as_view(), name='task_detail'),
    
    # Category endpoints
    path('api/categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('api/categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
]