import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import {
  Menu,
  Clock,
  Filter,
  MessageCircle,
  Plus,
  Search,
  ThumbsUp,
  X,
  User,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Home,
  Wrench,
  ArrowUpDown
} from 'lucide-react';
import AiBot from '../components/AiBot';

const MaintenancePage = () => {
  // Refs for chart instances
  const statusChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  // State for maintenance requests data
  const [maintenanceRequests, setMaintenanceRequests] = useState(() => {
    const savedRequests = localStorage.getItem('maintenanceRequests');
    return savedRequests ? JSON.parse(savedRequests) : [
      {
        id: 1,
        title: "Broken Heating in Room 302",
        description: "The heating system in Room 302 is not working properly. The room is very cold, especially at night.",
        type: "HVAC",
        status: "In Progress",
        priority: "High",
        location: "Science Building",
        date: "2025-04-22",
        scheduledDate: "2025-04-28",
        votes: 15,
        comments: [
          { id: 1, user: "Taylor M.", text: "It's getting worse! Now even during the day it's freezing.", date: "2025-04-23" },
          { id: 2, user: "Maintenance Staff", text: "We've ordered the replacement part. Should arrive by the 27th.", date: "2025-04-24", isStaff: true }
        ]
      },
      {
        id: 2,
        title: "Leaking Faucet in Women's Bathroom",
        description: "The middle sink in the first floor women's bathroom is constantly leaking, causing water wastage and floor damage.",
        type: "Plumbing",
        status: "Scheduled",
        priority: "Medium",
        location: "Library",
        date: "2025-04-24",
        scheduledDate: "2025-05-02",
        votes: 8,
        comments: [
          { id: 1, user: "Maintenance Staff", text: "Scheduled for repair on May 2nd.", date: "2025-04-26", isStaff: true }
        ]
      },
      {
        id: 3,
        title: "Flickering Lights in Hallway",
        description: "The lights in the main hallway of the Business Building have been flickering for the past week. It's distracting during classes.",
        type: "Electrical",
        status: "Open",
        priority: "Medium",
        location: "Business Building",
        date: "2025-04-26",
        scheduledDate: null,
        votes: 12,
        comments: []
      },
      {
        id: 4,
        title: "Broken Door Handle",
        description: "The handle on the main entrance door to the dormitory is loose and about to fall off. It's difficult to open and close the door.",
        type: "Structural",
        status: "Resolved",
        priority: "High",
        location: "Dormitory Block A",
        date: "2025-04-20",
        scheduledDate: "2025-04-21",
        completedDate: "2025-04-21",
        votes: 23,
        comments: [
          { id: 1, user: "Sam K.", text: "This is dangerous, someone could get locked in or out!", date: "2025-04-20" },
          { id: 2, user: "Maintenance Staff", text: "Emergency repair completed. Door handle has been replaced.", date: "2025-04-21", isStaff: true }
        ]
      },
      {
        id: 5,
        title: "Clogged Drain in Shower",
        description: "The shower drain in the second floor men's locker room is completely clogged. Water is backing up during use.",
        type: "Plumbing",
        status: "In Progress",
        priority: "Medium",
        location: "Athletics Building",
        date: "2025-04-25",
        scheduledDate: "2025-04-29",
        votes: 7,
        comments: [
          { id: 1, user: "Maintenance Staff", text: "Initial assessment done. Will need specialized equipment to clear the blockage completely.", date: "2025-04-27", isStaff: true }
        ]
      },
      {
        id: 6,
        title: "Damaged Ceiling Tile",
        description: "There's a water-damaged ceiling tile in Room 105 that looks like it could fall at any moment.",
        type: "Structural",
        status: "Scheduled",
        priority: "Low",
        location: "Humanities Building",
        date: "2025-04-23",
        scheduledDate: "2025-05-05",
        votes: 5,
        comments: [
          { id: 1, user: "Maintenance Staff", text: "Scheduled for replacement during the upcoming maintenance window.", date: "2025-04-25", isStaff: true }
        ]
      },
      {
        id: 7,
        title: "AC Not Working in Computer Lab",
        description: "The air conditioning in the main computer lab is not functioning. Room is overheating and affecting the computers' performance.",
        type: "HVAC",
        status: "Resolved",
        priority: "High",
        location: "Technology Center",
        date: "2025-04-19",
        scheduledDate: "2025-04-20",
        completedDate: "2025-04-20",
        votes: 31,
        comments: [
          { id: 1, user: "Prof. Johnson", text: "This is affecting my ability to teach the programming class.", date: "2025-04-19" },
          { id: 2, user: "Maintenance Staff", text: "Emergency repair completed. The system needed a refrigerant recharge.", date: "2025-04-20", isStaff: true }
        ]
      }
    ];
  });

  // State for new maintenance request form
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'Electrical',
    priority: 'Medium',
    location: ''
  });

  // State for showing request form
  const [showForm, setShowForm] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    status: 'All',
    priority: 'All',
    location: 'All',
    sortBy: 'date'
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('list');

  // State for selected request (for detail view)
  const [selectedRequest, setSelectedRequest] = useState(null);

  // State for new comment
  const [newComment, setNewComment] = useState('');

  // State for mobile menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Save maintenance requests to local storage
  useEffect(() => {
    localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  // Initialize and update charts
  useEffect(() => {
    // Destroy existing charts
    if (statusChartRef.current) statusChartRef.current.destroy();
    if (typeChartRef.current) typeChartRef.current.destroy();
    if (monthlyChartRef.current) monthlyChartRef.current.destroy();

    if (activeTab === 'analytics') {
      // Status distribution chart
      const statusCounts = maintenanceRequests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {});

      const statusCtx = document.getElementById('statusChart');
      if (statusCtx) {
        statusChartRef.current = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(statusCounts),
            datasets: [{
              data: Object.values(statusCounts),
              backgroundColor: [
                'rgba(234, 88, 12, 0.8)',   // Open - Orange
                'rgba(59, 130, 246, 0.8)',  // In Progress - Blue
                'rgba(234, 179, 8, 0.8)',   // Scheduled - Yellow
                'rgba(22, 163, 74, 0.8)'    // Resolved - Green
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
                  boxWidth: 12,
                  padding: 20
                }
              }
            }
          }
        });
      }

      // Type distribution chart
      const typeCounts = maintenanceRequests.reduce((acc, request) => {
        acc[request.type] = (acc[request.type] || 0) + 1;
        return acc;
      }, {});

      const typeCtx = document.getElementById('typeChart');
      if (typeCtx) {
        typeChartRef.current = new Chart(typeCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(typeCounts),
            datasets: [{
              label: 'Requests by Type',
              data: Object.values(typeCounts),
              backgroundColor: 'rgba(79, 70, 229, 0.8)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              },
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: window.innerWidth < 768 ? 45 : 0
                }
              }
            }
          }
        });
      }

      // Monthly distribution chart
      const monthlyData = maintenanceRequests.reduce((acc, request) => {
        const month = request.date.substring(0, 7); // YYYY-MM format
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      // Sort months
      const sortedMonths = Object.keys(monthlyData).sort();
      
      const monthlyCtx = document.getElementById('monthlyChart');
      if (monthlyCtx) {
        monthlyChartRef.current = new Chart(monthlyCtx, {
          type: 'line',
          data: {
            labels: sortedMonths.map(m => {
              const [year, month] = m.split('-');
              return `${month}/${year.substring(2)}`;
            }),
            datasets: [{
              label: 'Maintenance Requests by Month',
              data: sortedMonths.map(m => monthlyData[m]),
              borderColor: 'rgba(79, 70, 229, 1)',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              },
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: window.innerWidth < 768 ? 45 : 0
                }
              }
            }
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (statusChartRef.current) statusChartRef.current.destroy();
      if (typeChartRef.current) typeChartRef.current.destroy();
      if (monthlyChartRef.current) monthlyChartRef.current.destroy();
    };
  }, [activeTab, maintenanceRequests]);

  // Handle window resize for chart responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (statusChartRef.current) statusChartRef.current.resize();
      if (typeChartRef.current) typeChartRef.current.resize();
      if (monthlyChartRef.current) monthlyChartRef.current.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle submitting a new maintenance request
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const request = {
      id: maintenanceRequests.length > 0 ? Math.max(...maintenanceRequests.map(r => r.id)) + 1 : 1,
      ...newRequest,
      status: 'Open',
      date,
      scheduledDate: null,
      completedDate: null,
      votes: 0,
      comments: []
    };
    
    setMaintenanceRequests([request, ...maintenanceRequests]);
    setNewRequest({
      title: '',
      description: '',
      type: 'Electrical',
      priority: 'Medium',
      location: ''
    });
    
    setShowForm(false);
  };

  // Handle voting on a request
  const handleVote = (id) => {
    setMaintenanceRequests(maintenanceRequests.map(request => {
      if (request.id === id) {
        return { ...request, votes: request.votes + 1 };
      }
      return request;
    }));
  };

  // Handle adding a comment
  const handleAddComment = (id) => {
    if (!newComment.trim()) return;
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    setMaintenanceRequests(maintenanceRequests.map(request => {
      if (request.id === id) {
        const newCommentObj = {
          id: request.comments.length > 0 ? Math.max(...request.comments.map(c => c.id)) + 1 : 1,
          user: "You",
          text: newComment,
          date
        };
        return { ...request, comments: [...request.comments, newCommentObj] };
      }
      return request;
    }));
    
    setNewComment('');
  };

  // Filter and sort maintenance requests
  const filteredRequests = maintenanceRequests.filter(request => {
    // Search filter
    const matchesSearch = request.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                         request.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         request.location.toLowerCase().includes(filters.search.toLowerCase());
    
    // Type filter
    const matchesType = filters.type === 'All' || request.type === filters.type;
    
    // Status filter
    const matchesStatus = filters.status === 'All' || request.status === filters.status;
    
    // Priority filter
    const matchesPriority = filters.priority === 'All' || request.priority === filters.priority;

    // Location filter
    const matchesLocation = filters.location === 'All' || request.location.includes(filters.location);
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesLocation;
  }).sort((a, b) => {
    // Sort based on selected sort criteria
    if (filters.sortBy === 'date') {
      return new Date(b.date) - new Date(a.date); // Newest first
    } else if (filters.sortBy === 'priority') {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority]; // High to low
    } else if (filters.sortBy === 'votes') {
      return b.votes - a.votes; // Most votes first
    }
    return 0;
  });

  // Types, statuses, priorities, and locations for filters
  const types = ['All', ...new Set(maintenanceRequests.map(r => r.type))];
  const statuses = ['All', 'Open', 'In Progress', 'Scheduled', 'Resolved'];
  const priorities = ['All', 'Low', 'Medium', 'High'];
  const locations = ['All', ...new Set(maintenanceRequests.map(r => r.location))];

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-orange-100 text-orange-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-4 h-4" />;
      case 'In Progress': return <Menu className="w-4 h-4" />;
      case 'Scheduled': return <Calendar className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Electrical': return <span className="text-yellow-500">⚡</span>;
      case 'Plumbing': return <span className="text-blue-500">🚿</span>;
      case 'HVAC': return <span className="text-gray-500">❄️</span>;
      case 'Structural': return <span className="text-brown-500">🏗️</span>;
      case 'Cleaning': return <span className="text-green-500">🧹</span>;
      case 'Technology': return <span className="text-indigo-500">💻</span>;
      default: return <span className="text-gray-500">🔧</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2 text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Campus Maintenance Portal</h1>
                <p className="hidden sm:block text-xs md:text-sm text-indigo-100">Report issues and track maintenance requests</p>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-2">
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'list' 
                    ? 'bg-white text-indigo-600' 
                    : 'bg-indigo-700 text-white hover:bg-indigo-500'
                }`}
              >
                Requests
              </button>
              
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-indigo-600' 
                    : 'bg-indigo-700 text-white hover:bg-indigo-500'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col space-y-2">
            <button 
              onClick={() => {
                setActiveTab('list');
                setShowMobileMenu(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                activeTab === 'list' 
                  ? 'bg-white text-indigo-600' 
                  : 'text-white hover:bg-indigo-500'
              }`}
            >
              Maintenance Requests
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('analytics');
                setShowMobileMenu(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-white text-indigo-600' 
                  : 'text-white hover:bg-indigo-500'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {activeTab === 'list' && (
          <>
            {/* Filters and new request button */}
            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center sm:w-auto"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">New Request</span>
                  <span className="sm:hidden">Request</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                <select
                  className="text-xs sm:text-sm pl-2 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  className="text-xs sm:text-sm pl-2 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                
                <select
                  className="text-xs sm:text-sm pl-2 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select
                  className="text-xs sm:text-sm pl-2 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                
                <div className="col-span-2 sm:col-span-1 relative">
                  <select
                    className="text-xs sm:text-sm pl-2 pr-6 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="votes">Sort by Votes</option>
                  </select>
                  <ArrowUpDown className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Maintenance requests list */}
            {filteredRequests.length > 0 ? (
              <div className="space-y-3">
                {filteredRequests.map(request => (
                  <div 
                    key={request.id} 
                    className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            {getTypeIcon(request.type)} <span className="ml-1">{request.type}</span>
                          </span>
                        </div>
                        
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="mt-1 text-sm sm:text-base text-gray-600 line-clamp-2">{request.description}</p>
                        
                        <div className="mt-3 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-x-2 gap-y-1">
                          <span className="flex items-center">
                            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {request.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Reported: {request.date}
                          </span>
                          {request.scheduledDate && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Scheduled: {request.scheduledDate}
                            </span>
                          )}
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {request.comments.length} comments
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        className="flex-shrink-0 flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-full hover:bg-indigo-50 transition-colors ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(request.id);
                        }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{request.votes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                <h3 className="mt-3 text-base sm:text-lg font-medium text-gray-900">No maintenance requests found</h3>
                <p className="mt-1 text-sm sm:text-base text-gray-500">
                  {filters.search || filters.type !== 'All' || filters.status !== 'All' || filters.priority !== 'All' || filters.location !== 'All'
                    ? "Try adjusting your filters or search terms"
                    : "Be the first to report an issue by creating a new maintenance request"
                  }
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Create New Request
                </button>
              </div>
            )}
            <AiBot />

            {/* Maintenance request details */}
            {selectedRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Request Details</h2>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={() => setSelectedRequest(null)}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  
                  <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1">{selectedRequest.status}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center">
                        {getTypeIcon(selectedRequest.type)} <span className="ml-1">{selectedRequest.type}</span>
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex items-center">
                        <Home className="w-3 h-3 mr-1" />
                        {selectedRequest.location}
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{selectedRequest.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">{selectedRequest.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Request Information</h4>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-400" />
                            <span>Reported on: {selectedRequest.date}</span>
                          </p>
                          {selectedRequest.scheduledDate && (
                            <p className="flex items-center">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-400" />
                              <span>Scheduled for: {selectedRequest.scheduledDate}</span>
                            </p>
                          )}
                          {selectedRequest.completedDate && (
                            <p className="flex items-center">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-400" />
                              <span>Completed on: {selectedRequest.completedDate}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Community Support</h4>
                          <button 
                            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-full hover:bg-indigo-50 transition-colors text-xs sm:text-sm"
                            onClick={() => handleVote(selectedRequest.id)}
                          >
                            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{selectedRequest.votes} votes</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {selectedRequest.votes > 10 
                            ? "This issue has significant community support" 
                            : selectedRequest.votes > 5 
                              ? "This issue has moderate community support"
                              : "This issue needs more community support"
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Comments section */}
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Comments ({selectedRequest.comments.length})
                      </h4>
                      
                      {selectedRequest.comments.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                          {selectedRequest.comments.map(comment => (
                            <div key={comment.id} className="flex">
                              <div className={`flex-shrink-0 mr-2 sm:mr-3 ${comment.isStaff ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <User className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 p-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center text-xs sm:text-sm">
                                  <span className={`font-medium ${comment.isStaff ? 'text-indigo-600' : 'text-gray-900'}`}>
                                    {comment.user}
                                  </span>
                                  <span className="mx-1 text-gray-500">•</span>
                                  <span className="text-gray-500">{comment.date}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500 italic">No comments yet</p>
                      )}
                      
                      <div className="mt-3 sm:mt-4">
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleAddComment(selectedRequest.id)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New maintenance request form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">New Request</h2>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={() => setShowForm(false)}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitRequest} className="px-4 sm:px-6 py-4">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          placeholder="Brief description of the issue"
                          value={newRequest.title}
                          onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          id="description"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          placeholder="Detailed description of the issue..."
                          value={newRequest.description}
                          onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            id="type"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                            value={newRequest.type}
                            onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                          >
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Structural">Structural</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Technology">Technology</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority *
                          </label>
                          <select
                            id="priority"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                            value={newRequest.priority}
                            onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          id="location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          placeholder="Building and room number"
                          value={newRequest.location}
                          onChange={(e) => setNewRequest({...newRequest, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Maintenance Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-indigo-900 text-sm sm:text-base">Total Requests</h3>
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1 sm:mt-2">
                  {maintenanceRequests.length}
                </p>
              </div>
              
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-green-900 text-sm sm:text-base">Resolved</h3>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
                  {maintenanceRequests.filter(r => r.status === 'Resolved').length}
                </p>
              </div>
              
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-orange-900 text-sm sm:text-base">Pending</h3>
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">
                  {maintenanceRequests.filter(r => r.status !== 'Resolved').length}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Status Distribution</h3>
                <div className="h-48 sm:h-64">
                  <canvas id="statusChart"></canvas>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Request Types</h3>
                <div className="h-48 sm:h-64">
                  <canvas id="typeChart"></canvas>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg lg:col-span-2">
                <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Monthly Trends</h3>
                <div className="h-48 sm:h-64">
                  <canvas id="monthlyChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MaintenancePage;