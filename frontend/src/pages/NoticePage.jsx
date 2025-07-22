import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  AlertCircle,
  CheckCircle,
  Info,
  Megaphone,
  Calendar,
  Clock,
  Pin,
  Search,
  Plus,
  X,
  ChevronDown,
  Bookmark,
  Share2,
  ThumbsUp,
  MessageCircle,
  User,
  Users,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import AiBot from '../components/AiBot';

const NoticePage = () => {
  // Notice data state
  const [notices, setNotices] = useState(() => {
    const savedNotices = localStorage.getItem('notices');
    return savedNotices ? JSON.parse(savedNotices) : [
      {
        id: 1,
        title: "Campus Power Maintenance",
        content: "There will be scheduled power maintenance on May 15th from 8:00 AM to 12:00 PM. All academic buildings will be affected. Please save your work and log off computers before this time.",
        category: "Maintenance",
        priority: "High",
        audience: ["Students", "Faculty"],
        author: "Facilities Department",
        date: "2025-05-05",
        expiry: "2025-05-16",
        pinned: true,
        likes: 24,
        comments: [
          { id: 1, user: "Alex Johnson", text: "Will the library have backup power?", date: "2025-05-05T10:30:00" },
          { id: 2, user: "Facilities Dept", text: "Yes, the library will have limited backup power for essential systems.", date: "2025-05-05T11:15:00", isOfficial: true }
        ]
      },
      {
        id: 2,
        title: "Summer Internship Opportunities",
        content: "Applications are now open for summer internships with our industry partners. Deadline for submission is May 30th. Visit the career center for more information.",
        category: "Career",
        priority: "Medium",
        audience: ["Students"],
        author: "Career Services",
        date: "2025-05-03",
        expiry: "2025-05-31",
        pinned: false,
        likes: 56,
        comments: []
      },
      {
        id: 3,
        title: "New Cafeteria Menu Options",
        content: "Starting next week, we're introducing new healthy menu options in the main cafeteria, including vegan and gluten-free choices.",
        category: "General",
        priority: "Low",
        audience: ["Students", "Faculty", "Staff"],
        author: "Food Services",
        date: "2025-05-01",
        expiry: "2025-05-31",
        pinned: false,
        likes: 102,
        comments: [
          { id: 1, user: "Taylor Smith", text: "Finally! Been waiting for more vegan options.", date: "2025-05-01T14:20:00" }
        ]
      }
    ];
  });

  // New notice form state
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    audience: [],
    expiry: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    priority: 'All',
    audience: 'All',
    sortBy: 'date',
    showExpired: false
  });

  // UI states
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pinned, myNotices

  // Categories, priorities, and audiences
  const categories = ['All', 'General', 'Academic', 'Career', 'Events', 'Maintenance', 'Security'];
  const priorities = ['All', 'Low', 'Medium', 'High'];
  const audienceOptions = ['All', 'Students', 'Faculty', 'Staff', 'Administration'];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notices', JSON.stringify(notices));
  }, [notices]);

  // Handle form submission
  const handleSubmitNotice = (e) => {
    e.preventDefault();
    
    const now = new Date();
    const notice = {
      id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
      ...newNotice,
      author: "You", // In a real app, this would be the logged-in user
      date: now.toISOString().split('T')[0],
      pinned: false,
      likes: 0,
      comments: []
    };
    
    setNotices([notice, ...notices]);
    setNewNotice({
      title: '',
      content: '',
      category: 'General',
      priority: 'Medium',
      audience: [],
      expiry: ''
    });
    setShowForm(false);
  };

  // Handle liking a notice
  const handleLike = (id) => {
    setNotices(notices.map(notice => {
      if (notice.id === id) {
        return { ...notice, likes: notice.likes + 1 };
      }
      return notice;
    }));
  };

  // Handle adding a comment
  const handleAddComment = (id) => {
    if (!newComment.trim()) return;
    
    const now = new Date();
    const comment = {
      id: Date.now(), // Simple unique ID
      user: "You", // In a real app, this would be the logged-in user
      text: newComment,
      date: now.toISOString()
    };
    
    setNotices(notices.map(notice => {
      if (notice.id === id) {
        return { ...notice, comments: [...notice.comments, comment] };
      }
      return notice;
    }));
    setNewComment('');
  };

  // Handle pinning/unpinning a notice
  const handlePinNotice = (id) => {
    setNotices(notices.map(notice => {
      if (notice.id === id) {
        return { ...notice, pinned: !notice.pinned };
      }
      return notice;
    }));
  };

  // Filter and sort notices
  const filteredNotices = notices.filter(notice => {
    // Check if notice is expired
    const isExpired = notice.expiry && new Date(notice.expiry) < new Date();
    if (isExpired && !filters.showExpired) return false;
    
    // Search filter
    const matchesSearch = 
      notice.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      notice.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      notice.author.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.category === 'All' || notice.category === filters.category;
    
    // Priority filter
    const matchesPriority = filters.priority === 'All' || notice.priority === filters.priority;
    
    // Audience filter
    const matchesAudience = filters.audience === 'All' || notice.audience.includes(filters.audience);
    
    // Tab filter
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'pinned' && notice.pinned) || 
      (activeTab === 'myNotices' && notice.author === "You");
    
    return matchesSearch && matchesCategory && matchesPriority && matchesAudience && matchesTab;
  }).sort((a, b) => {
    // Sort based on selected sort criteria
    if (filters.sortBy === 'date') {
      return new Date(b.date) - new Date(a.date); // Newest first
    } else if (filters.sortBy === 'priority') {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority]; // High to low
    } else if (filters.sortBy === 'likes') {
      return b.likes - a.likes; // Most likes first
    }
    return 0;
  });

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <AlertCircle className="w-4 h-4" />;
      case 'Medium': return <Info className="w-4 h-4" />;
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Audience icons
  const getAudienceIcons = (audience) => {
    return audience.map(aud => {
      switch (aud) {
        case 'Students': return <GraduationCap key={aud} className="w-4 h-4" />;
        case 'Faculty': return <User key={aud} className="w-4 h-4" />;
        case 'Staff': return <Briefcase key={aud} className="w-4 h-4" />;
        case 'Administration': return <Users key={aud} className="w-4 h-4" />;
        default: return null;
      }
    });
  };

  // Check if notice is expired
  const isNoticeExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Campus Notice Board</h1>
              <p className="mt-1 text-purple-100">Important announcements and updates for the campus community</p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 md:mt-0 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Notice
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all' ? 'bg-white text-purple-600' : 'bg-purple-700 text-white hover:bg-purple-500'
              }`}
            >
              All Notices
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pinned' ? 'bg-white text-purple-600' : 'bg-purple-700 text-white hover:bg-purple-500'
              }`}
            >
              Pinned Notices
            </button>
            <button
              onClick={() => setActiveTab('myNotices')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'myNotices' ? 'bg-white text-purple-600' : 'bg-purple-700 text-white hover:bg-purple-500'
              }`}
            >
              My Notices
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.audience}
                onChange={(e) => setFilters({...filters, audience: e.target.value})}
              >
                {audienceOptions.map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
              
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="likes">Sort by Popularity</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={filters.showExpired}
                onChange={(e) => setFilters({...filters, showExpired: e.target.checked})}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ml-2 text-sm font-medium text-gray-700">Show expired</span>
            </label>
          </div>
        </div>

        {/* Notices list */}
        {filteredNotices.length > 0 ? (
          <div className="space-y-4">
            {filteredNotices.map(notice => (
              <div 
                key={notice.id} 
                className={`bg-white p-6 rounded-xl shadow-sm border ${notice.pinned ? 'border-purple-300 border-l-4 border-l-purple-600' : 'border-gray-200'} hover:shadow-md transition-shadow relative`}
              >
                {notice.pinned && (
                  <div className="absolute top-4 right-4">
                    <Pin className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                
                {isNoticeExpired(notice.expiry) && (
                  <div className="absolute top-4 left-4 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <BellOff className="w-3 h-3 mr-1" />
                    Expired
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getPriorityColor(notice.priority)}`}>
                        {getPriorityIcon(notice.priority)}
                        <span className="ml-1">{notice.priority}</span>
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {notice.category}
                      </span>
                      <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getAudienceIcons(notice.audience)}
                        <span>{notice.audience.join(', ')}</span>
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900">{notice.title}</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">{notice.content}</p>
                    
                    <div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>Posted by: {notice.author}</span>
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Posted: {notice.date}</span>
                      </span>
                      {notice.expiry && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Expires: {notice.expiry}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="flex space-x-4">
                    <button 
                      className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors"
                      onClick={() => handleLike(notice.id)}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>{notice.likes}</span>
                    </button>
                    
                    <button 
                      className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors"
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{notice.comments.length}</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => handlePinNotice(notice.id)}
                    >
                      <Pin className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => {/* Share functionality would go here */}}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => {/* Bookmark functionality would go here */}}
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No notices found</h3>
            <p className="mt-2 text-gray-500">
              {filters.search || filters.category !== 'All' || filters.priority !== 'All' || filters.audience !== 'All'
                ? "Try adjusting your filters or search terms"
                : "No notices have been posted yet. Be the first to create one!"
              }
            </p>
          </div>
        )}

        <AiBot />

        {/* Notice details modal */}
        {selectedNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Notice Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setSelectedNotice(null)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getPriorityColor(selectedNotice.priority)}`}>
                    {getPriorityIcon(selectedNotice.priority)}
                    <span className="ml-1">{selectedNotice.priority}</span>
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedNotice.category}
                  </span>
                  <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {getAudienceIcons(selectedNotice.audience)}
                    <span>{selectedNotice.audience.join(', ')}</span>
                  </span>
                  {selectedNotice.pinned && (
                    <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </span>
                  )}
                  {isNoticeExpired(selectedNotice.expiry) && (
                    <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <BellOff className="w-3 h-3 mr-1" />
                      Expired
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedNotice.title}</h3>
                <div className="prose max-w-none text-gray-700 mb-6 whitespace-pre-line">
                  {selectedNotice.content}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notice Information</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Posted by: {selectedNotice.author}</span>
                      </p>
                      <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Posted on: {selectedNotice.date}</span>
                      </p>
                      {selectedNotice.expiry && (
                        <p className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Expires on: {selectedNotice.expiry}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">Engagement</h4>
                      <button 
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded-full hover:bg-purple-50 transition-colors"
                        onClick={() => handleLike(selectedNotice.id)}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{selectedNotice.likes} likes</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      This notice has been viewed {Math.floor(selectedNotice.likes * 3.5)} times and shared {Math.floor(selectedNotice.likes / 2)} times.
                    </p>
                  </div>
                </div>
                
                {/* Comments section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Comments ({selectedNotice.comments.length})</h4>
                  
                  {selectedNotice.comments.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {selectedNotice.comments.map(comment => (
                        <div key={comment.id} className="flex">
                          <div className={`flex-shrink-0 mr-3 ${comment.isOfficial ? 'text-purple-600' : 'text-gray-600'}`}>
                            <User className="w-8 h-8 rounded-full bg-gray-200 p-1.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center text-sm">
                              <span className={`font-medium ${comment.isOfficial ? 'text-purple-600' : 'text-gray-900'}`}>
                                {comment.user}
                              </span>
                              <span className="mx-1 text-gray-500">•</span>
                              <span className="text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                              {comment.isOfficial && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Official
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No comments yet</p>
                  )}
                  
                  <div className="mt-4">
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleAddComment(selectedNotice.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

        {/* New notice form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Notice</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setShowForm(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitNotice} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Notice title"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Detailed notice content..."
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        id="category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={newNotice.category}
                        onChange={(e) => setNewNotice({...newNotice, category: e.target.value})}
                      >
                        {categories.filter(c => c !== 'All').map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        id="priority"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                      >
                        {priorities.filter(p => p !== 'All').map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {audienceOptions.filter(a => a !== 'All').map(audience => (
                        <label key={audience} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            checked={newNotice.audience.includes(audience)}
                            onChange={(e) => {
                              const newAudience = e.target.checked
                                ? [...newNotice.audience, audience]
                                : newNotice.audience.filter(a => a !== audience);
                              setNewNotice({...newNotice, audience: newAudience});
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700">{audience}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="expiry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={newNotice.expiry}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewNotice({...newNotice, expiry: e.target.value})}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Notices will automatically expire and be archived after this date
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Publish Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NoticePage;