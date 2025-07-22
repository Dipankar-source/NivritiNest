import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import {
  AlertTriangle,
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
  BarChart3
} from 'lucide-react';
import AiBot from '../components/AiBot';

const ComplaintsPage = () => {
  // Refs for chart instances
  const statusChartRef = useRef(null);
  const categoryChartRef = useRef(null);

  // State for complaints data
  const [complaints, setComplaints] = useState(() => {
    const savedComplaints = localStorage.getItem('complaints');
    return savedComplaints ? JSON.parse(savedComplaints) : [
      {
        id: 1,
        title: "Slow Wi-Fi in Dorm Block C",
        description: "The internet connection in Block C has been extremely slow for the past week, making it impossible to attend online classes or submit assignments.",
        category: "Infrastructure",
        status: "In Progress",
        priority: "High",
        date: "2025-04-25",
        votes: 24,
        comments: [
          { id: 1, user: "Jane D.", text: "I'm having the same issue!", date: "2025-04-26" },
          { id: 2, user: "Admin", text: "IT team has been notified and will check the routers tomorrow.", date: "2025-04-27", isAdmin: true }
        ]
      },
      {
        id: 2,
        title: "Cafeteria Food Quality",
        description: "The quality of food has deteriorated significantly in the last month. Many students have reported feeling unwell after eating lunch.",
        category: "Cafeteria",
        status: "Under Review",
        priority: "High", 
        date: "2025-04-26",
        votes: 32,
        comments: [
          { id: 1, user: "Mark L.", text: "I found something strange in my soup yesterday.", date: "2025-04-27" }
        ]
      },
      {
        id: 3,
        title: "Library Closing Too Early",
        description: "The library now closes at 8 PM instead of 10 PM, which is not enough time for many students who have evening classes.",
        category: "Academic",
        status: "Open",
        priority: "Medium",
        date: "2025-04-28",
        votes: 15,
        comments: []
      },
      {
        id: 4,
        title: "Leaking Roof in Science Building",
        description: "There's a significant leak in the ceiling of Room 302 in the Science Building. It's causing damage and disrupting classes.",
        category: "Infrastructure",
        status: "Resolved",
        priority: "High",
        date: "2025-04-20",
        votes: 18,
        comments: [
          { id: 1, user: "Admin", text: "Maintenance has fixed the issue as of April 25th. Please let us know if you notice any further problems.", date: "2025-04-25", isAdmin: true }
        ]
      },
      {
        id: 5,
        title: "Lack of Vegetarian Options",
        description: "As a vegetarian student, I find it difficult to get proper nutritious meals as there are very limited vegetarian options in the cafeteria.",
        category: "Cafeteria",
        status: "In Progress",
        priority: "Medium",
        date: "2025-04-24",
        votes: 22,
        comments: [
          { id: 1, user: "Admin", text: "We're working with our catering service to add more vegetarian options starting next week.", date: "2025-04-26", isAdmin: true }
        ]
      }
    ];
  });

  // State for new complaint form
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    priority: 'Medium'
  });

  // State for showing complaint form
  const [showForm, setShowForm] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    priority: 'All'
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('list');

  // State for selected complaint (for detail view)
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // State for new comment
  const [newComment, setNewComment] = useState('');

  // Save complaints to local storage
  useEffect(() => {
    localStorage.setItem('complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Initialize and update charts
  useEffect(() => {
    // Destroy existing charts
    if (statusChartRef.current) statusChartRef.current.destroy();
    if (categoryChartRef.current) categoryChartRef.current.destroy();

    if (activeTab === 'analytics') {
      // Status distribution chart
      const statusCounts = complaints.reduce((acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1;
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
                'rgba(234, 179, 8, 0.8)',   // Under Review - Yellow
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

      // Category distribution chart
      const categoryCounts = complaints.reduce((acc, complaint) => {
        acc[complaint.category] = (acc[complaint.category] || 0) + 1;
        return acc;
      }, {});

      const categoryCtx = document.getElementById('categoryChart');
      if (categoryCtx) {
        categoryChartRef.current = new Chart(categoryCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
              label: 'Complaints by Category',
              data: Object.values(categoryCounts),
              backgroundColor: 'rgba(99, 102, 241, 0.8)',
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
                  maxRotation: window.innerWidth < 768 ? 45 : 0,
                  minRotation: window.innerWidth < 768 ? 45 : 0
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
      if (categoryChartRef.current) categoryChartRef.current.destroy();
    };
  }, [activeTab, complaints]);

  // Handle submitting a new complaint
  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const complaint = {
      id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
      ...newComplaint,
      status: 'Open',
      date,
      votes: 0,
      comments: []
    };
    
    setComplaints([complaint, ...complaints]);
    setNewComplaint({
      title: '',
      description: '',
      category: 'Infrastructure',
      priority: 'Medium'
    });
    
    setShowForm(false);
  };

  // Handle voting on a complaint
  const handleVote = (id) => {
    setComplaints(complaints.map(complaint => {
      if (complaint.id === id) {
        return { ...complaint, votes: complaint.votes + 1 };
      }
      return complaint;
    }));
  };

  // Handle adding a comment
  const handleAddComment = (id) => {
    if (!newComment.trim()) return;
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    setComplaints(complaints.map(complaint => {
      if (complaint.id === id) {
        const newCommentObj = {
          id: complaint.comments.length > 0 ? Math.max(...complaint.comments.map(c => c.id)) + 1 : 1,
          user: "You",
          text: newComment,
          date
        };
        return { ...complaint, comments: [...complaint.comments, newCommentObj] };
      }
      return complaint;
    }));
    
    setNewComment('');
  };

  // Filter complaints based on current filters
  const filteredComplaints = complaints.filter(complaint => {
    // Search filter
    const matchesSearch = complaint.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                         complaint.description.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.category === 'All' || complaint.category === filters.category;
    
    // Status filter
    const matchesStatus = filters.status === 'All' || complaint.status === filters.status;
    
    // Priority filter
    const matchesPriority = filters.priority === 'All' || complaint.priority === filters.priority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Categories, statuses and priorities for filters
  const categories = ['All', ...new Set(complaints.map(c => c.category))];
  const statuses = ['All', 'Open', 'In Progress', 'Under Review', 'Resolved'];
  const priorities = ['All', 'Low', 'Medium', 'High'];

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
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Under Review': return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Student Complaints Portal</h1>
            <p className="mt-1 text-indigo-100 text-sm sm:text-base">Voice your concerns and track their resolution</p>
          </div>
          
          <div className="w-full md:w-auto flex space-x-2">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'list' 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-indigo-700 text-white hover:bg-indigo-500'
              }`}
            >
              Complaints
            </button>
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-indigo-700 text-white hover:bg-indigo-500'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        {activeTab === 'list' && (
          <>
            {/* Filters and new complaint button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 space-y-4 md:space-y-0">
              <div className="w-full flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <select
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto  px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm sm:text-base "
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                New
              </button>
            </div>

            {/* Scrollable complaints list */}
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[70vh]">
              {filteredComplaints.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {filteredComplaints.map(complaint => (
                    <div 
                      key={complaint.id} 
                      className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(complaint.status)}`}>
                              {getStatusIcon(complaint.status)}
                              <span className="ml-1">{complaint.status}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {complaint.category}
                            </span>
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{complaint.title}</h3>
                          <p className="mt-1 text-gray-600 text-sm sm:text-base line-clamp-2">{complaint.description}</p>
                          
                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span>{complaint.date}</span>
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span>{complaint.comments.length} comments</span>
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-full hover:bg-indigo-50 transition-colors ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(complaint.id);
                          }}
                        >
                          <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">{complaint.votes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 sm:p-10 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">No complaints found</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    {filters.search || filters.category !== 'All' || filters.status !== 'All' || filters.priority !== 'All'
                      ? "Try adjusting your filters or search terms"
                      : "Be the first to report an issue by creating a new complaint"
                    }
                  </p>
                </div>
              )}
            </div>

            <AiBot />

            {/* Complaint Detail Modal */}
            {selectedComplaint && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Complaint Details</h2>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={() => setSelectedComplaint(null)}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  
                  <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(selectedComplaint.status)}`}>
                        {getStatusIcon(selectedComplaint.status)}
                        <span className="ml-1">{selectedComplaint.status}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {selectedComplaint.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{selectedComplaint.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-4">{selectedComplaint.description}</p>
                    
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-2">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>Submitted on {selectedComplaint.date}</span>
                      </span>
                      <div className="flex items-center ml-auto">
                        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-indigo-600" />
                        <span>{selectedComplaint.votes} supports</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Comments ({selectedComplaint.comments.length})</h4>
                      
                      {selectedComplaint.comments.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                          {selectedComplaint.comments.map(comment => (
                            <div key={comment.id} className={`p-3 sm:p-4 rounded-lg ${comment.isAdmin ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50 border border-gray-100'}`}>
                              <div className="flex items-center mb-2">
                                <div className={`p-1 sm:p-2 rounded-full ${comment.isAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <div className="ml-2">
                                  <p className={`text-xs sm:text-sm font-medium ${comment.isAdmin ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    {comment.user} {comment.isAdmin && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-1">Admin</span>}
                                  </p>
                                  <p className="text-xs text-gray-500">{comment.date}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm sm:text-base">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base mb-4 sm:mb-6">No comments yet. Be the first to comment!</p>
                      )}
                      
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add your comment..."
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(selectedComplaint.id);
                            }
                          }}
                        />
                        <button
                          className="px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                          onClick={() => handleAddComment(selectedComplaint.id)}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New complaint form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Submit New Complaint</h2>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={() => setShowForm(false)}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitComplaint} className="px-4 sm:px-6 py-4">
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                        placeholder="Brief title of your complaint"
                        value={newComplaint.title}
                        onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 text-sm sm:text-base"
                        placeholder="Detailed description of the issue"
                        value={newComplaint.description}
                        onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Category</label>
                        <select
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          value={newComplaint.category}
                          onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
                        >
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Academic">Academic</option>
                          <option value="Cafeteria">Cafeteria</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Dormitory">Dormitory</option>
                          <option value="Administration">Administration</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          value={newComplaint.priority}
                          onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                      >
                        Submit Complaint
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                Complaints Analytics
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-100">
                  <p className="text-xs sm:text-sm font-medium text-indigo-700">Total Complaints</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{complaints.length}</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {complaints.filter(c => c.status !== 'Resolved').length} open issues
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm font-medium text-blue-700">Average Supports</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">
                    {complaints.length > 0 
                      ? Math.round(complaints.reduce((sum, c) => sum + c.votes, 0) / complaints.length) 
                      : 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {complaints.reduce((sum, c) => sum + c.votes, 0)} total votes
                  </p>
                </div>
                
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100">
                  <p className="text-xs sm:text-sm font-medium text-orange-700">Most Common Category</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 truncate">
                    {complaints.length > 0 
                      ? Object.entries(
                          complaints.reduce((acc, c) => {
                            acc[c.category] = (acc[c.category] || 0) + 1;
                            return acc;
                          }, {})
                        ).sort((a, b) => b[1] - a[1])[0][0]
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Based on {complaints.length} complaints</p>
                </div>
                
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                  <p className="text-xs sm:text-sm font-medium text-green-700">Resolution Rate</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">
                    {complaints.length > 0 
                      ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {complaints.filter(c => c.status === 'Resolved').length} resolved issues
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Complaint Status Distribution</h3>
                  <div className="h-48 sm:h-64">
                    <canvas id="statusChart"></canvas>
                  </div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Complaints by Category</h3>
                  <div className="h-48 sm:h-64">
                    <canvas id="categoryChart"></canvas>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Complaints</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {complaints.slice(0, 5).map(complaint => (
                        <tr key={complaint.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                          setSelectedComplaint(complaint);
                          setActiveTab('list');
                        }}>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">{complaint.title}</div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-500">{complaint.category}</div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {complaint.date}
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {complaint.votes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComplaintsPage;