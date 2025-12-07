from django.urls import path
from .views import (
    RegisterUserView, LoginUserView, VerifyTokenView,
    UpdateUsernameView, UpdatePasswordView,
    TaskListCreateView, TaskDetailView,
    CategoryListCreateView, CategoryDetailView,
    DashboardStatsView, CalendarTasksView, WeeklyProgressView,
    OverdueTasksView, TodayTasksView
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('update-username/', UpdateUsernameView.as_view(), name='update-username'),
    path('update-password/', UpdatePasswordView.as_view(), name='update-password'),
    
    # Dashboard endpoints
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/calendar/', CalendarTasksView.as_view(), name='calendar-tasks'),
    path('dashboard/weekly-progress/', WeeklyProgressView.as_view(), name='weekly-progress'),
    path('dashboard/overdue/', OverdueTasksView.as_view(), name='overdue-tasks'),
    path('dashboard/today/', TodayTasksView.as_view(), name='today-tasks'),
    
    # Task endpoints
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    
    # Category endpoints
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
]