import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  Target,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const AnalyticsDashboard = ({ projectId }) => {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overallCompletionRate: 0,
    userStats: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAnalytics = {
      totalTasks: 45,
      completedTasks: 28,
      inProgressTasks: 12,
      todoTasks: 5,
      overallCompletionRate: 62.2,
      userStats: [
        { userName: 'John Doe', userEmail: 'john@example.com', total: 8, completed: 6, completionRate: 75 },
        { userName: 'Jane Smith', userEmail: 'jane@example.com', total: 7, completed: 5, completionRate: 71.4 },
        { userName: 'Mike Johnson', userEmail: 'mike@example.com', total: 6, completed: 4, completionRate: 66.7 },
        { userName: 'Sarah Williams', userEmail: 'sarah@example.com', total: 9, completed: 8, completionRate: 88.9 },
        { userName: 'Tom Brown', userEmail: 'tom@example.com', total: 5, completed: 2, completionRate: 40 },
      ]
    };
    setAnalytics(mockAnalytics);
  }, [projectId]);

  const StatCard = ({ icon: Icon, title, value, color, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const PerformanceChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="semester">Semester</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {analytics.userStats.map((student, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {student.userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{student.userName}</p>
                <p className="text-sm text-gray-500">{student.userEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{student.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{student.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">{student.completionRate}%</p>
                <p className="text-xs text-gray-500">Rate</p>
              </div>
              <div className="w-24">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      student.completionRate >= 80 ? 'bg-green-500' :
                      student.completionRate >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${student.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProgressOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Status Distribution</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.completedTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">In Progress</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.inProgressTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(analytics.inProgressTasks / analytics.totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">To Do</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.todoTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(analytics.todoTasks / analytics.totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {analytics.overallCompletionRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Top Performer</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {analytics.userStats.reduce((prev, current) => 
                prev.completionRate > current.completionRate ? prev : current
              ).userName}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Active Students</span>
            </div>
            <span className="text-lg font-bold text-yellow-600">
              {analytics.userStats.filter(s => s.completionRate > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">Track student progress and assignment performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          title="Total Tasks" 
          value={analytics.totalTasks} 
          color="bg-blue-500"
          trend={12}
        />
        <StatCard 
          icon={CheckCircle} 
          title="Completed" 
          value={analytics.completedTasks} 
          color="bg-green-500"
          trend={8}
        />
        <StatCard 
          icon={Clock} 
          title="In Progress" 
          value={analytics.inProgressTasks} 
          color="bg-yellow-500"
          trend={-3}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Completion Rate" 
          value={`${analytics.overallCompletionRate.toFixed(1)}%`} 
          color="bg-purple-500"
          trend={5}
        />
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['overview', 'performance', 'detailed'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === view
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {selectedView === 'overview' && <ProgressOverview />}
          {selectedView === 'performance' && <PerformanceChart />}
          {selectedView === 'detailed' && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Detailed analytics view coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
