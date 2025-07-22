import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  AlertCircle,
  Users,
  Home,
  Plus,
  RefreshCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  X,
  Shield,
  Key,
  User,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AiBot from '../components/AiBot';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('hostelCurrentUser') || {});
    return {
      name: user.name || 'Admin User',
      email: user.email || 'admin@hostel.com',
      role: user.role || 'admin',
      picture: user.picture || null
    };
  });

  // Refs for chart instances
  const complaintsChartRef = useRef(null);
  const roomsChartRef = useRef(null);
  const visitorsChartRef = useRef(null);
  const aiChatbotRef = useRef(null);

  // Initialize state with local storage data or defaults
  const [dashboardData, setDashboardData] = useState(() => {
    const savedData = localStorage.getItem('dashboardData');
    return savedData ? JSON.parse(savedData) : {
      rooms: 25,
      complaints: 8,
      visitors: 42,
      students: 120,
      staff: 15,
      complaintsData: [5, 8, 6, 10, 7, 4, 9],
      roomTypes: {
        'Single': 10,
        'Double': 8,
        'Suite': 5,
        'Dorm': 2
      },
      visitorTrend: [20, 25, 30, 35, 40, 42],
      recentActivities: [
        { id: 1, type: 'complaint', description: 'Water leakage in room 205', time: '2 hours ago', status: 'pending' },
        { id: 2, type: 'maintenance', description: 'AC repair in room 312', time: '5 hours ago', status: 'in-progress' },
        { id: 3, type: 'visitor', description: 'Visitor check-in for room 108', time: 'Yesterday', status: 'completed' }
      ],
      upcomingEvents: [
        { id: 1, title: 'Hostel Committee Meeting', date: '2023-06-15', time: '10:00 AM' },
        { id: 2, title: 'Fire Safety Drill', date: '2023-06-18', time: '9:00 AM' },
        { id: 3, title: 'Student Orientation', date: '2023-06-20', time: '2:00 PM' }
      ]
    };
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [newRoom, setNewRoom] = useState({ type: '', count: '' });
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: `Hello ${currentUser.name.split(' ')[0]}! How can I assist you with hostel management today?` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
  }, [dashboardData]);

  // Initialize charts
  useEffect(() => {
    const initializeCharts = () => {
      // Destroy existing charts
      if (complaintsChartRef.current) complaintsChartRef.current.destroy();
      if (roomsChartRef.current) roomsChartRef.current.destroy();
      if (visitorsChartRef.current) visitorsChartRef.current.destroy();

      // Complaints Trend Chart (Line)
      const complaintsCtx = document.getElementById('complaintsChart');
      if (complaintsCtx) {
        complaintsChartRef.current = new Chart(complaintsCtx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Complaints',
              data: dashboardData.complaintsData,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      // Room Types Chart (Pie)
      const roomsCtx = document.getElementById('roomsChart');
      if (roomsCtx) {
        roomsChartRef.current = new Chart(roomsCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(dashboardData.roomTypes),
            datasets: [{
              data: Object.values(dashboardData.roomTypes),
              backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(139, 92, 246, 0.7)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: window.innerWidth < 768 ? 'bottom' : 'right',
                labels: {
                  boxWidth: 12
                }
              }
            }
          }
        });
      }

      // Visitors Trend Chart (Bar)
      const visitorsCtx = document.getElementById('visitorsChart');
      if (visitorsCtx) {
        visitorsChartRef.current = new Chart(visitorsCtx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Visitors',
              data: dashboardData.visitorTrend,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(initializeCharts, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (complaintsChartRef.current) complaintsChartRef.current.destroy();
      if (roomsChartRef.current) roomsChartRef.current.destroy();
      if (visitorsChartRef.current) visitorsChartRef.current.destroy();
    };
  }, [dashboardData, activeTab]);

  // Handle window resize for chart responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (complaintsChartRef.current) complaintsChartRef.current.resize();
      if (roomsChartRef.current) roomsChartRef.current.resize();
      if (visitorsChartRef.current) visitorsChartRef.current.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addRandomData = () => {
    setDashboardData(prev => ({
      ...prev,
      rooms: prev.rooms + Math.floor(Math.random() * 3),
      complaints: prev.complaints + Math.floor(Math.random() * 5) - 1,
      visitors: prev.visitors + Math.floor(Math.random() * 10),
      complaintsData: prev.complaintsData.map(value => 
        Math.max(0, value + Math.floor(Math.random() * 3) - 1)
      ),
      visitorTrend: prev.visitorTrend.map((value, i) => 
        i === prev.visitorTrend.length - 1 
          ? prev.visitors + Math.floor(Math.random() * 10)
          : value
      )
    }));
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      localStorage.removeItem('dashboardData');
      setDashboardData({
        rooms: 25,
        complaints: 8,
        visitors: 42,
        students: 120,
        staff: 15,
        complaintsData: [5, 8, 6, 10, 7, 4, 9],
        roomTypes: {
          'Single': 10,
          'Double': 8,
          'Suite': 5,
          'Dorm': 2
        },
        visitorTrend: [20, 25, 30, 35, 40, 42],
        recentActivities: [
          { id: 1, type: 'complaint', description: 'Water leakage in room 205', time: '2 hours ago', status: 'pending' },
          { id: 2, type: 'maintenance', description: 'AC repair in room 312', time: '5 hours ago', status: 'in-progress' },
          { id: 3, type: 'visitor', description: 'Visitor check-in for room 108', time: 'Yesterday', status: 'completed' }
        ],
        upcomingEvents: [
          { id: 1, title: 'Hostel Committee Meeting', date: '2023-06-15', time: '10:00 AM' },
          { id: 2, title: 'Fire Safety Drill', date: '2023-06-18', time: '9:00 AM' },
          { id: 3, title: 'Student Orientation', date: '2023-06-20', time: '2:00 PM' }
        ]
      });
    }
  };

  const addRoomType = () => {
    if (newRoom.type && newRoom.count) {
      setDashboardData(prev => ({
        ...prev,
        roomTypes: {
          ...prev.roomTypes,
          [newRoom.type]: parseInt(newRoom.count)
        },
        rooms: prev.rooms + parseInt(newRoom.count)
      }));
      setNewRoom({ type: '', count: '' });
    }
  };

  const removeRoomType = (type) => {
    const count = dashboardData.roomTypes[type];
    setDashboardData(prev => ({
      ...prev,
      rooms: prev.rooms - count,
      roomTypes: Object.fromEntries(
        Object.entries(prev.roomTypes).filter(([key]) => key !== type)
      )
    }));
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newUserMessage = { sender: 'user', text: userInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        `Based on your data, I notice you have ${dashboardData.complaints} active complaints. Would you like suggestions to reduce these?`,
        `Your visitor trend shows ${dashboardData.visitorTrend[dashboardData.visitorTrend.length - 1]} visitors this month. That's a ${dashboardData.visitorTrend[dashboardData.visitorTrend.length - 1] > dashboardData.visitorTrend[dashboardData.visitorTrend.length - 2] ? 'increase' : 'decrease'} from last month.`,
        `The most common room type is ${Object.entries(dashboardData.roomTypes).sort((a, b) => b[1] - a[1])[0][0]}. Consider adjusting your room distribution based on demand.`,
        `Your occupancy rate is ${Math.round((dashboardData.visitors / (dashboardData.rooms * 2)) * 100)}%. Here are some marketing ideas to improve this...`
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      setChatMessages(prev => [...prev, { sender: 'bot', text: randomResponse }]);
      
      // Auto-scroll to bottom
      if (aiChatbotRef.current) {
        aiChatbotRef.current.scrollTop = aiChatbotRef.current.scrollHeight;
      }
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('hostelCurrentUser');
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, trend, trendValue, onClick }) => {
    const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;
    const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
    
    return (
      <div 
        className={`p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-xl md:text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 md:p-3 rounded-lg bg-gray-50 text-gray-600">
            {icon}
          </div>
        </div>
        {trend && (
          <div className={`mt-2 md:mt-4 flex items-center ${trendColor}`}>
            <TrendIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="text-xs md:text-sm font-medium">{trendValue}% from last week</span>
          </div>
        )}
      </div>
    );
  };

  const ActivityItem = ({ activity }) => {
    let icon, color;
    switch(activity.type) {
      case 'complaint':
        icon = <AlertCircle className="w-4 h-4" />;
        color = 'bg-red-100 text-red-600';
        break;
      case 'maintenance':
        icon = <ClipboardList className="w-4 h-4" />;
        color = 'bg-blue-100 text-blue-600';
        break;
      case 'visitor':
        icon = <Users className="w-4 h-4" />;
        color = 'bg-green-100 text-green-600';
        break;
      default:
        icon = <ClipboardList className="w-4 h-4" />;
        color = 'bg-gray-100 text-gray-600';
    }

    return (
      <div className="flex items-start py-3">
        <div className={`p-2 rounded-lg mr-3 ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
          activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {activity.status}
        </span>
      </div>
    );
  };

  const EventItem = ({ event }) => {
    return (
      <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
        <div className="p-2 rounded-lg mr-3 bg-purple-100 text-purple-600">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{event.title}</p>
          <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
        </div>
      </div>
    );
  };

  // Role-based access control
  const adminFeatures = ['overview', 'rooms', 'analytics', 'settings'];
  const wardenFeatures = ['overview', 'rooms', 'analytics'];
  const guardFeatures = ['overview'];

  const availableTabs = currentUser.role === 'admin' 
    ? adminFeatures 
    : currentUser.role === 'warden' 
      ? wardenFeatures 
      : guardFeatures;

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed right-4 top-16 w-72 md:w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {dashboardData.recentActivities.map(activity => (
              <div key={activity.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                {currentUser.role === 'admin' && 'Here is your complete hostel management overview'}
                {currentUser.role === 'warden' && 'Manage hostel operations and student welfare'}
                {currentUser.role === 'guard' && 'Monitor visitor entries and security'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              {currentUser.role !== 'guard' && (
                <>
                  <button
                    onClick={addRandomData}
                    className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Generate Data</span>
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={resetData}
                      className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Reset Data</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Mobile tabs */}
          <div className="flex items-center mt-4 md:mt-6 space-x-2 overflow-x-auto pb-2 md:hidden">
            {availableTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  activeTab === tab ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Rooms" 
                value={dashboardData.rooms} 
                icon={<Bed className="w-5 h-5" />}
                trend="up"
                trendValue="2.5"
                onClick={() => setActiveTab('rooms')}
              />
              <StatCard 
                title="Active Complaints" 
                value={dashboardData.complaints} 
                icon={<AlertCircle className="w-5 h-5" />}
                trend="down"
                trendValue="1.8"
              />
              <StatCard 
                title="Visitor Entries" 
                value={dashboardData.visitors} 
                icon={<Users className="w-5 h-5" />}
                trend="up"
                trendValue="12.3"
              />
              <StatCard 
                title="Students" 
                value={dashboardData.students} 
                icon={<User className="w-5 h-5" />}
              />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Charts */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-4">Weekly Complaints Trend</h3>
                    <div className="chart-container" style={{ height: '250px', width: '100%' }}>
                      <canvas id="complaintsChart"></canvas>
                    </div>
                  </div>
                  
                  {currentUser.role !== 'guard' && (
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-4">Room Types Distribution</h3>
                      <div className="chart-container" style={{ height: '250px', width: '100%' }}>
                        <canvas id="roomsChart"></canvas>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Recent Activities */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700">Recent Activities</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.recentActivities.slice(0, 5).map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                {currentUser.role !== 'guard' && (
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700">Upcoming Events</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.upcomingEvents.slice(0, 3).map(event => (
                        <EventItem key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentUser.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => navigate('/add-user')}
                          className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex flex-col items-center"
                        >
                          <User className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Add User</span>
                        </button>
                        <button 
                          onClick={() => navigate('/settings')}
                          className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex flex-col items-center"
                        >
                          <Settings className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Settings</span>
                        </button>
                      </>
                    )}
                    {currentUser.role === 'warden' && (
                      <>
                        <button 
                          onClick={() => navigate('/complaints')}
                          className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex flex-col items-center"
                        >
                          <AlertCircle className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Add Complaint</span>
                        </button>
                        <button 
                          onClick={() => navigate('/room-allocation')}
                          className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex flex-col items-center"
                        >
                          <Bed className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Assign Room</span>
                        </button>
                      </>
                    )}
                    {currentUser.role === 'guard' && (
                      <>
                        <button 
                          onClick={() => navigate('/visitor-log')}
                          className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex flex-col items-center"
                        >
                          <Users className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Visitor Log</span>
                        </button>
                        <button 
                          onClick={() => navigate('/security-report')}
                          className="p-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex flex-col items-center"
                        >
                          <Shield className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Security Report</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && currentUser.role !== 'guard' && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-3 md:space-y-0">
              <h2 className="text-xl font-bold text-gray-800">Room Management</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  placeholder="Room type"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Count"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-20"
                  value={newRoom.count}
                  onChange={(e) => setNewRoom({...newRoom, count: e.target.value})}
                />
                <button
                  onClick={addRoomType}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    {currentUser.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(dashboardData.roomTypes).map(([type, count]) => (
                    <tr key={type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((count / dashboardData.rooms) * 100)}%
                      </td>
                      {currentUser.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => removeRoomType(type)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && currentUser.role !== 'guard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-4">Monthly Visitor Trend</h3>
                <div className="chart-container" style={{ height: '300px', width: '100%' }}>
                  <canvas id="visitorsChart"></canvas>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-4">Complaints by Day</h3>
                <div className="space-y-4">
                  {dashboardData.complaintsData.map((count, index) => {
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const percentage = (count / Math.max(...dashboardData.complaintsData)) * 100;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{days[index]}</span>
                          <span className="text-gray-500">{count} complaints</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Avg. Complaints/Day</p>
                        <p className="text-xl font-bold">
                          {(dashboardData.complaintsData.reduce((a, b) => a + b, 0) / 7).toFixed(1)}
                        </p>
                      </div>
                      <AlertCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Avg. Visitors/Month</p>
                        <p className="text-xl font-bold">
                          {(dashboardData.visitorTrend.reduce((a, b) => a + b, 0) / 6)}
                        </p>
                      </div>
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
                <h3 className="font-medium text-gray-700 mb-4">Room Occupancy</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dashboardData.roomTypes).map(([type, count]) => (
                    <div key={type} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{type} Rooms</p>
                          <p className="text-lg font-bold">{count}</p>
                        </div>
                        <Bed className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((count / dashboardData.rooms) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Settings</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="University Hostel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="2023-2024"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Admin User</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">admin@hostel.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Admin</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-gray-500 hover:text-gray-700" disabled>Remove</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Warden</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">warden@hostel.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Warden</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Security Guard</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">guard@hostel.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Guard</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Add New User
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Maintenance</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-red-800">Reset All Data</p>
                        <p className="text-sm text-red-600 mt-1">This will delete all hostel data and cannot be undone.</p>
                      </div>
                      <button
                        onClick={resetData}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-yellow-800">Generate Test Data</p>
                        <p className="text-sm text-yellow-600 mt-1">Populate the system with sample data for testing.</p>
                      </div>
                      <button
                        onClick={addRandomData}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
            <h3 className="font-medium">Hostel Assistant</h3>
            <button onClick={() => setShowChatbot(false)} className="text-white hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div 
            ref={aiChatbotRef}
            className="p-3 h-64 overflow-y-auto space-y-3"
          >
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md rounded-lg px-3 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;