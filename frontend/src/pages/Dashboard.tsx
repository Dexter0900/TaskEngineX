import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiCloud,
  FiWind,
  FiDroplet,
  FiArrowRight
} from "react-icons/fi";
import { LuCircleGauge } from "react-icons/lu";
import { getAllTasks, getTaskStats } from "../api/taskApi";
import type { Task, TaskStatsResponse } from "../types";
import Layout from "../components/Layout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchWeather();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        getAllTasks(),
        getTaskStats(),
      ]);

      setTasks(tasksResponse.tasks);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      // OpenWeatherMap free API (replace with your API key)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=3b59f4d88622529f43723ea4123d29e7&units=metric`
      );
      const data = await response.json();
      setWeather(data);
      console.log("Weather data loaded:", data);
    } catch (error) {
      console.log("Weather fetch failed (API key needed)");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const statusColors = {
    pending: "#f59e0b",
    "in-progress": "#8b5cf6",
    completed: "#10b981",
  };

  const pieData = [
    { name: "Pending", value: stats?.pending || 0, color: "#f59e0b" },
    { name: "In Progress", value: stats?.inProgress || 0, color: "#8b5cf6" },
    { name: "Completed", value: stats?.completed || 0, color: "#10b981" },
  ];

  const priorityData = [
    { name: "Low", value: stats?.lowPriority || 0 },
    { name: "Medium", value: stats?.mediumPriority || 0 },
    { name: "High", value: stats?.highPriority || 0 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your tasks and productivity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.pending || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-900 rounded-lg flex items-center justify-center">
                <FiClock className="text-amber-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.inProgress || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-purple-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.completed || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Priority Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="var(--color-primary)" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weather Widget + Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-linear-to-br from-primary to-primary/50 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weather</h3>
              <FiCloud size={24} />
            </div>
            {weather ? (
              <a
                href={`https://www.google.com/search?q=weather+${encodeURIComponent(weather.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity cursor-pointer"
              >
              <div className="space-y-4">
                {/* Temperature Section */}
                <div>
                  <p className="text-5xl font-medium">{Math.round(weather.main?.temp || 0)}°C</p>
                  <p className="text-base opacity-90 mt-2 capitalize">{weather.weather?.[0]?.description}</p>
                  <p className="text-sm opacity-75 mt-1">{weather.name}</p>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Feels Like */}
                  <div className="flex items-center gap-2">
                    <FiCloud className="text-lg shrink-0" />
                    <div>
                      <p className="text-xs opacity-75">Feels Like</p>
                      <p className="text-base font-semibold">{Math.round(weather.main?.feels_like || 0)}°C</p>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="flex items-center gap-2">
                    <FiDroplet className="text-lg shrink-0" />
                    <div>
                      <p className="text-xs opacity-75">Humidity</p>
                      <p className="text-base font-semibold">{Math.round(weather.main?.humidity || 0)}%</p>
                    </div>
                  </div>

                  {/* Wind Speed */}
                  <div className="flex items-center gap-2">
                    <FiWind className="text-lg shrink-0" />
                    <div>
                      <p className="text-xs opacity-75">Wind Speed</p>
                      <p className="text-base font-semibold">{Math.round(weather.wind?.speed || 0)} m/s</p>
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="flex items-center gap-2">
                    <LuCircleGauge className="text-lg shrink-0" />
                    <div>
                      <p className="text-xs opacity-75">Pressure</p>
                      <p className="text-base font-semibold">{weather.main?.pressure || 0} hPa</p>
                    </div>
                  </div>
                </div>
              </div>
              </a>
            ) : (
              <div>
                <p className="text-sm opacity-75">Weather data unavailable</p>
                <p className="text-xs opacity-60 mt-2">Add OpenWeather API key</p>
              </div>
            )}
          </motion.div>

          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Tasks</h3>
              <Link
                to="/tasks"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                View All
                <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary-500 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Priority: {task.priority} • Status: {task.status}
                    </p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        statusColors[task.status as keyof typeof statusColors],
                    }}
                  ></div>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No tasks yet. Start creating tasks!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}