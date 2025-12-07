"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Search,
  Plus,
  X,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Home,
  BookOpen,
  Heart,
  Users,
  Mail,
  Brain,
  FileText,
  ShoppingBag,
  Wrench,
  DollarSign,
  Activity,
  Target,
  Book,
  GraduationCap,
  Dumbbell,
  Utensils,
  Calendar as CalendarIcon,
  TrendingUp,
  AlertCircle,
  Edit2,
  Clock
} from "lucide-react";

const iconMap: any = {
  Briefcase, Home, BookOpen, Heart, Users, Mail, Brain, FileText,
  ShoppingBag, Wrench, DollarSign, Activity, Target, Book,
  GraduationCap, Dumbbell, Utensils, Calendar: CalendarIcon
};

export default function DashboardPage() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const [stats, setStats] = useState({
    total_tasks: 0,
    in_progress: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any>({ tasks: [], count: 0, completed: 0, completion_rate: 0 });
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarTasks, setCalendarTasks] = useState<any>({});
  const [weeklyProgress, setWeeklyProgress] = useState<any>(null);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    category: "",
    due_date: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const priorityColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-red-100 text-red-700 border-red-300",
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  const colorMap: any = {
    blue: "bg-blue-100 text-blue-600 border-blue-300",
    green: "bg-green-100 text-green-600 border-green-300",
    purple: "bg-purple-100 text-purple-600 border-purple-300",
    red: "bg-red-100 text-red-600 border-red-300",
    yellow: "bg-yellow-100 text-yellow-600 border-yellow-300",
    pink: "bg-pink-100 text-pink-600 border-pink-300",
    orange: "bg-orange-100 text-orange-600 border-orange-300",
    teal: "bg-teal-100 text-teal-600 border-teal-300",
    indigo: "bg-indigo-100 text-indigo-600 border-indigo-300",
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const fullName = localStorage.getItem('userFullName');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    setUserFullName(fullName || "User");
    fetchDashboardData(token);
    fetchCalendarData(token, currentMonth, currentYear);
    fetchWeeklyProgress(token);
    fetchOverdueTasks(token);
    fetchTodayTasks(token);
  }, [router]);

  useEffect(() => {
  const handleUsernameUpdate = () => {
    const updatedName = localStorage.getItem('userFullName');
    if (updatedName) {
      setUserFullName(updatedName);
    }
  };

  window.addEventListener('usernameUpdated', handleUsernameUpdate);
  
  return () => {
    window.removeEventListener('usernameUpdated', handleUsernameUpdate);
  };
}, []);

  const fetchDashboardData = async (token: string, search: string = "") => {
    try {
      const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      const tasksUrl = search 
        ? `http://localhost:8000/api/tasks/?search=${encodeURIComponent(search)}`
        : 'http://localhost:8000/api/tasks/';
      
      const tasksResponse = await fetch(tasksUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }

      const categoriesResponse = await fetch('http://localhost:8000/api/categories/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const fetchOverdueTasks = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/overdue/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOverdueTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
    }
  };

  const fetchTodayTasks = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/today/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== TODAY TASKS RESPONSE ===');
        console.log('Full response:', data);
        console.log('Tasks count:', data.count);
        console.log('Tasks array:', data.tasks);
        console.log('Tasks length:', data.tasks?.length);
        setTodayTasks(data);
      } else {
        console.error('Failed to fetch today tasks, status:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    }
  };

  const fetchCalendarData = async (token: string, month: number, year: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/dashboard/calendar/?month=${month}&year=${year}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCalendarTasks(data.tasks_by_date);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchWeeklyProgress = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/weekly-progress/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWeeklyProgress(data);
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchDashboardData(token, query);
    }
  };

  const handleCreateTask = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError("Authentication token not found");
      router.push('/auth/login');
      return;
    }
    
    if (!newTask.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          category: newTask.category || null,
          due_date: newTask.due_date || null,
        }),
      });

      if (response.ok) {
        setSuccess("Task created successfully!");
        setShowCreateModal(false);
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
          category: "",
          due_date: "",
        });
        refreshAllData(token);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create task");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError("An error occurred while creating the task");
    }
  };

  const handleEditTask = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem('authToken');
    
    if (!token || !selectedTask) return;

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${selectedTask.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          priority: selectedTask.priority,
          status: selectedTask.status,
          category: selectedTask.category || null,
          due_date: selectedTask.due_date || null,
        }),
      });

      if (response.ok) {
        setSuccess("Task updated successfully!");
        setShowEditModal(false);
        setSelectedTask(null);
        refreshAllData(token);
      } else {
        setError("Failed to update task");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError("An error occurred while updating the task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem('authToken');
    
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok || response.status === 204) {
        setSuccess("Task deleted successfully!");
        refreshAllData(token);
      } else {
        setError("Failed to delete task");
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError("An error occurred while deleting the task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSuccess("Task updated successfully!");
        refreshAllData(token);
      } else {
        setError("Failed to update task");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError("An error occurred while updating the task");
    }
  };

  const refreshAllData = (token: string) => {
    fetchDashboardData(token);
    fetchCalendarData(token, currentMonth, currentYear);
    fetchWeeklyProgress(token);
    fetchOverdueTasks(token);
    fetchTodayTasks(token);
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getParentCategories = () => {
    return categories.filter((cat: any) => !cat.parent);
  };

  const getSubcategories = (parentId: number) => {
    return categories.filter((cat: any) => cat.parent === parentId);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    router.push('/auth/login');
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const changeMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCalendarData(token, newMonth, newYear);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = calendarTasks[dateKey] || [];
      const today = new Date();
      const isToday = day === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();
      
      days.push(
        <div
          key={day}
          className={`p-2 min-h-[100px] border border-gray-200 rounded-lg ${
            isToday ? 'bg-green-50 border-green-400' : 'bg-white hover:bg-gray-50'
          } transition-colors`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
            {day}
            {isToday && <span className="ml-1 text-xs">(Today)</span>}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task: any) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : task.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="text-green-600" size={28} />
            Calendar View
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-semibold text-gray-700 min-w-[180px] text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  const renderWeeklyProgress = () => {
    if (!weeklyProgress) return null;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={28} />
            Weekly Progress
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {weeklyProgress.week_summary.completion_rate}%
            </div>
            <div className="text-sm text-gray-600">
              {weeklyProgress.week_summary.completed_tasks} of {weeklyProgress.week_summary.total_tasks} tasks
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {weeklyProgress.daily_progress.map((day: any) => (
            <div
              key={day.date}
              className={`p-4 rounded-xl border-2 transition-all ${
                day.is_today
                  ? 'bg-green-50 border-green-400 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className={`text-xs font-semibold mb-1 ${
                  day.is_today ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {day.day_short}
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  day.is_today ? 'text-green-700' : 'text-gray-800'
                }`}>
                  {new Date(day.date).getDate()}
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                      day.completion_rate === 100
                        ? 'bg-green-500'
                        : day.completion_rate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${day.completion_rate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  {day.completed_tasks}/{day.total_tasks}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal || !selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
            <button 
              onClick={() => { setShowEditModal(false); setSelectedTask(null); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
              <input
                type="text"
                value={selectedTask.title}
                onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={selectedTask.description || ""}
                onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => setSelectedTask({...selectedTask, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={selectedTask.due_date ? new Date(selectedTask.due_date).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSelectedTask({...selectedTask, due_date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete Task
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedTask(null); }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditTask}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-yellow-50 overflow-hidden">
      <div className="w-64 bg-white shadow-lg flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
              {!imageError ? (
                <img 
                  src="/taskmango/taskmango.png" 
                  alt="Task Mango" 
                  className="w-8 h-8"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-white font-bold text-lg">TM</span>
              )}
            </div>
            <span className="text-xl font-bold text-gray-800">Task Mango</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-green-50 rounded-lg font-medium transition-colors">
            <Bell size={20} />
            <span>Notifications</span>
          </button>
        </nav>

       <div className="p-4 border-t border-gray-200 space-y-2">
   <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        router.push('/settings');
      }}
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
    >
      <Settings size={20} />
      <span>Settings</span>
    </button>
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
    >
      <LogOut size={20} />
      <span>Log out</span>
    </button>
</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 p-6 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by task title or category..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="ml-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>New task</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <p className="text-red-600">{error}</p>
                <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
                  <X size={20} />
                </button>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <p className="text-green-600">{success}</p>
                <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* OVERDUE TASKS ALERT BANNER */}
            {overdueTasks.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="text-red-600" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                      <Clock size={20} />
                      {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-red-700 mb-4">
                      You have tasks that are past their due date. Complete them as soon as possible!
                    </p>
                    <div className="space-y-2">
                      {overdueTasks.slice(0, 3).map((task: any) => (
                        <div key={task.id} className="bg-white rounded-lg p-3 border border-red-200 flex items-center justify-between hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{task.title}</h4>
                            <p className="text-sm text-red-600">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleTaskClick(task)}
                            className="ml-4 p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                      {overdueTasks.length > 3 && (
                        <p className="text-sm text-red-600 font-medium text-center pt-2">
                          +{overdueTasks.length - 3} more overdue tasks
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {userFullName}! 👋
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with your tasks today.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <LayoutDashboard size={40} className="text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Total Tasks</h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckSquare size={20} className="text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.total_tasks}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">In Progress</h3>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <CheckSquare size={20} className="text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.in_progress}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Completed</h3>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckSquare size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Overdue</h3>
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.overdue}</p>
              </div>
            </div>

            {/* TODAY'S FOCUS & YOUR TASKS - SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* LEFT: TODAY'S FOCUS - Cute Box */}
              <div className="bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 rounded-3xl shadow-xl p-8 border-2 border-yellow-300 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-200 rounded-full opacity-20 -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-2xl shadow-lg">
                        <CalendarIcon className="text-white" size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Today's Focus</h2>
                        <p className="text-sm text-gray-600">Stay on track! 🎯</p>
                      </div>
                    </div>
                    <div className="text-right bg-white px-4 py-2 rounded-xl shadow-md">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {todayTasks.completion_rate}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {todayTasks.completed}/{todayTasks.count}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${todayTasks.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>

                  {todayTasks.tasks && todayTasks.tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-green-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Check size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear! 🎉</h3>
                      <p className="text-gray-600">No tasks due today. Enjoy your day!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {todayTasks.tasks && todayTasks.tasks.map((task: any, index: number) => (
                        <div 
                          key={task.id}
                          className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border-l-4 border-green-400"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleUpdateTaskStatus(
                                task.id, 
                                task.status === 'completed' ? 'pending' : 'completed'
                              )}
                              className={`mt-1 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                task.status === 'completed' 
                                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 scale-110' 
                                  : 'border-gray-300 hover:border-green-500 hover:scale-110'
                              }`}
                            >
                              {task.status === 'completed' && (
                                <Check size={18} className="text-white font-bold" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-base mb-1 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(task.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleTaskClick(task)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Edit2 size={18} className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: YOUR TASKS */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                      <CheckSquare className="text-white" size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {searchQuery ? `Search: "${searchQuery}"` : "All Tasks"}
                      </h2>
                      <p className="text-sm text-gray-600">{tasks.length} total tasks</p>
                    </div>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckSquare size={48} className="text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {searchQuery ? "No matches found" : "Ready to start?"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery 
                        ? `Try a different search term`
                        : "Create your first task to get organized!"
                      }
                    </p>
                    {!searchQuery && (
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        <Plus size={20} />
                        <span>Create Task</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {tasks.map((task: any) => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleUpdateTaskStatus(
                              task.id, 
                              task.status === 'completed' ? 'pending' : 'completed'
                            )}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              task.status === 'completed' 
                                ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600' 
                                : 'border-gray-300 hover:border-purple-500'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <Check size={16} className="text-white" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
                            )}
                            {task.category_details && (
                              <p className="text-xs text-gray-400 mt-1">
                                📁 {task.category_details.full_name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                              {task.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {renderWeeklyProgress()}
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={2}
                  placeholder="Add task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={newTask.category === ""}
                        onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-600 font-medium">No Category</span>
                    </label>
                    
                    {getParentCategories().map((parent: any) => {
                      const Icon = iconMap[parent.icon] || CheckSquare;
                      const subcategories = getSubcategories(parent.id);
                      const isExpanded = expandedCategories.has(parent.id);
                      
                      return (
                        <div key={parent.id} className="mb-2">
                          <div className="flex items-center gap-2">
                            {subcategories.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleCategory(parent.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown size={16} className="text-gray-500" />
                                ) : (
                                  <ChevronRight size={16} className="text-gray-500" />
                                )}
                              </button>
                            )}
                            <label className={`flex items-center gap-3 flex-1 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${!subcategories.length ? 'ml-6' : ''}`}>
                              <input
                                type="radio"
                                name="category"
                                value={parent.id}
                                checked={newTask.category === parent.id.toString()}
                                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                                className="w-4 h-4 text-green-600 focus:ring-green-500"
                              />
                              <div className={`p-2 rounded-lg ${colorMap[parent.color] || 'bg-gray-100'}`}>
                                <Icon size={16} />
                              </div>
                              <span className="font-medium text-gray-700">{parent.name}</span>
                            </label>
                          </div>
                          
                          {isExpanded && subcategories.length > 0 && (
                            <div className="ml-10 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                              {subcategories.map((sub: any) => {
                                const SubIcon = iconMap[sub.icon] || CheckSquare;
                                return (
                                  <label
                                    key={sub.id}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name="category"
                                      value={sub.id}
                                      checked={newTask.category === sub.id.toString()}
                                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <div className={`p-1.5 rounded ${colorMap[sub.color] || 'bg-gray-100'}`}>
                                      <SubIcon size={14} />
                                    </div>
                                    <span className="text-sm text-gray-600">{sub.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {renderEditModal()}
    </div>
  );
}