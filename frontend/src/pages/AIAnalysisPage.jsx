import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import {
  BarChart3,
  Bell,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Home,
  Info,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Share2,
  ThumbsUp,
  User,
  Users,
  Wrench,
  X,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AIAnalysisPage = () => {
  // Refs for chart instances
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const sentimentChartRef = useRef(null);

  // State for data
  const [complaints, setComplaints] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [notices, setNotices] = useState([]);
  const [roomAllocations, setRoomAllocations] = useState([]);

  // State for AI analysis
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('openAiKey') || '');
  const [error, setError] = useState(null);

  // State for UI
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Fetch data from local storage
  useEffect(() => {
    try {
      const savedComplaints = localStorage.getItem('complaints');
      const savedMaintenance = localStorage.getItem('maintenanceRequests');
      const savedNotices = localStorage.getItem('notices');
      const savedRooms = localStorage.getItem('hostelRooms');

      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));
      if (savedMaintenance) setMaintenanceRequests(JSON.parse(savedMaintenance));
      if (savedNotices) setNotices(JSON.parse(savedNotices));
      if (savedRooms) setRoomAllocations(JSON.parse(savedRooms));
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
      setError("Failed to load data from storage");
    }
  }, []);

  // Initialize charts when data changes
  useEffect(() => {
    // Destroy existing charts
    if (categoryChartRef.current) categoryChartRef.current.destroy();
    if (trendChartRef.current) trendChartRef.current.destroy();
    if (sentimentChartRef.current) sentimentChartRef.current.destroy();

    // Only proceed if we have data
    if (complaints.length > 0 || maintenanceRequests.length > 0) {
      try {
        // Category distribution chart
        const categoryData = {};
        
        complaints.forEach(complaint => {
          categoryData[complaint.category] = (categoryData[complaint.category] || 0) + 1;
        });
        
        maintenanceRequests.forEach(request => {
          categoryData[request.type] = (categoryData[request.type] || 0) + 1;
        });

        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
          categoryChartRef.current = new Chart(categoryCtx, {
            type: 'bar',
            data: {
              labels: Object.keys(categoryData),
              datasets: [{
                label: 'Issues by Category',
                data: Object.values(categoryData),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
                x: { ticks: { autoSkip: false } }
              }
            }
          });
        }

        // Trend chart (last 6 months)
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - i);
          months.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`);
        }

        const trendData = new Array(6).fill(0);
        
        [...complaints, ...maintenanceRequests].forEach(item => {
          const itemDate = new Date(item.date);
          const monthDiff = (currentDate.getFullYear() - itemDate.getFullYear()) * 12 + 
                            currentDate.getMonth() - itemDate.getMonth();
          
          if (monthDiff >= 0 && monthDiff < 6) {
            trendData[5 - monthDiff]++;
          }
        });

        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
          trendChartRef.current = new Chart(trendCtx, {
            type: 'line',
            data: {
              labels: months,
              datasets: [{
                label: 'Issues Reported',
                data: trendData,
                borderColor: 'rgba(234, 88, 12, 1)',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                tension: 0.3,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
          });
        }

        // Sentiment analysis chart (mock data)
        const sentimentCtx = document.getElementById('sentimentChart');
        if (sentimentCtx) {
          sentimentChartRef.current = new Chart(sentimentCtx, {
            type: 'doughnut',
            data: {
              labels: ['Positive', 'Neutral', 'Negative'],
              datasets: [{
                data: [35, 45, 20],
                backgroundColor: [
                  'rgba(22, 163, 74, 0.8)',
                  'rgba(234, 179, 8, 0.8)',
                  'rgba(220, 38, 38, 0.8)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { 
                  position: 'right',
                  labels: { boxWidth: 12, padding: 20 }
                } 
              }
            }
          });
        }
      } catch (err) {
        console.error("Error initializing charts:", err);
        setError("Failed to initialize data visualizations");
      }
    }

    return () => {
      if (categoryChartRef.current) categoryChartRef.current.destroy();
      if (trendChartRef.current) trendChartRef.current.destroy();
      if (sentimentChartRef.current) sentimentChartRef.current.destroy();
    };
  }, [complaints, maintenanceRequests]);

  // Call OpenAI API
  const callOpenAI = async (prompt) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error("API call failed:", err);
      throw err;
    }
  };

  // Parse AI response into structured format
  const parseAiResponse = (response) => {
    try {
      const lines = response.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      return lines.map((text, id) => ({ id, text }));
    } catch (err) {
      console.error("Error parsing AI response:", err);
      return [{ id: 1, text: response }];
    }
  };

  // Get AI suggestions
  const getAiSuggestions = async () => {
    if (!openAiKey) {
      setShowKeyModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiSuggestions([]);
    setCategorySuggestions({});

    try {
      const allData = [...complaints, ...maintenanceRequests];
      
      if (allData.length === 0) {
        setError("No data available to analyze");
        return;
      }

      // Get general suggestions
      const generalPrompt = `Analyze these campus issues and provide 3-5 actionable suggestions:
        ${JSON.stringify(allData.slice(0, 10))}
        
        Respond in numbered format:
        1. [Suggestion 1]
        2. [Suggestion 2]`;

      const generalResponse = await callOpenAI(generalPrompt);
      setAiSuggestions(parseAiResponse(generalResponse));

      // Get category-specific suggestions
      const categories = {};
      allData.forEach(item => {
        const category = item.category || item.type || 'General';
        if (!categories[category]) categories[category] = [];
        categories[category].push(item);
      });

      for (const category in categories) {
        const categoryPrompt = `Analyze these ${category} issues and provide 3 specific suggestions:
          ${JSON.stringify(categories[category].slice(0, 5))}
          
          Respond in numbered format:
          1. [Suggestion 1]
          2. [Suggestion 2]`;

        const categoryResponse = await callOpenAI(categoryPrompt);
        setCategorySuggestions(prev => ({
          ...prev,
          [category]: parseAiResponse(categoryResponse)
        }));
      }
    } catch (err) {
      console.error("Error getting AI suggestions:", err);
      setError(err.message || "Failed to get AI suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  // Save API key to local storage
  const saveApiKey = () => {
    if (!openAiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    localStorage.setItem('openAiKey', openAiKey);
    setShowKeyModal(false);
    setError(null);
  };

  // Get current suggestions based on selected category
  const getCurrentSuggestions = () => {
    if (selectedCategory === 'All') return aiSuggestions;
    return categorySuggestions[selectedCategory] || [];
  };

  // Get all available categories
  const getAllCategories = () => {
    const categories = new Set();
    complaints.forEach(complaint => categories.add(complaint.category));
    maintenanceRequests.forEach(request => categories.add(request.type));
    return ['All', ...Array.from(categories)].filter(Boolean);
  };

  // Get stats for dashboard
  const getStats = () => {
    const totalIssues = complaints.length + maintenanceRequests.length;
    const openIssues = complaints.filter(c => c.status !== 'Resolved').length + 
                      maintenanceRequests.filter(r => r.status !== 'Resolved').length;
    
    return [
      {
        title: 'Total Issues',
        value: totalIssues,
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'bg-indigo-100 text-indigo-600'
      },
      {
        title: 'Open Issues',
        value: openIssues,
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'bg-orange-100 text-orange-600'
      },
      {
        title: 'Avg Resolution',
        value: '3.2 days',
        icon: <Clock className="w-5 h-5" />,
        color: 'bg-blue-100 text-blue-600'
      },
      {
        title: 'Satisfaction',
        value: '78%',
        icon: <ThumbsUp className="w-5 h-5" />,
        color: 'bg-green-100 text-green-600'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Campus AI Analysis
              </h1>
              <p className="mt-1 text-indigo-100">Data-driven insights and AI-powered recommendations</p>
            </div>
            
            <button
              onClick={getAiSuggestions}
              disabled={isLoading}
              className={`mt-4 md:mt-0 px-4 py-2 rounded-lg flex items-center transition-colors ${
                isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {isLoading ? (
                'Analyzing...'
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-1" />
                  Generate Insights
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {getStats().map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-xl md:text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Category</h3>
            <div className="h-64">
              <canvas id="categoryChart"></canvas>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Analysis (Last 6 Months)</h3>
            <div className="h-64">
              <canvas id="trendChart"></canvas>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
            <div className="h-64">
              <canvas id="sentimentChart"></canvas>
            </div>
          </div>
        </div>

        {/* AI Suggestions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI-Powered Recommendations</h2>
              <p className="text-sm text-gray-500 mt-1">
                {aiSuggestions.length > 0 
                  ? 'Based on analysis of your campus data' 
                  : 'Generate insights to see recommendations'}
              </p>
            </div>
            
            <div className="mt-3 sm:mt-0">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={aiSuggestions.length === 0}
              >
                {getAllCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Recommendations' : `${category} Issues`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {getCurrentSuggestions().length > 0 ? (
              getCurrentSuggestions().map(suggestion => (
                <div key={suggestion.id} className="p-4 sm:p-6">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedSuggestion(expandedSuggestion === suggestion.id ? null : suggestion.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-600">
                          <Info className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{suggestion.text}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedCategory === 'All' ? 'General Recommendation' : `${selectedCategory} Issue`}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-500 ml-2">
                      {expandedSuggestion === suggestion.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {expandedSuggestion === suggestion.id && (
                    <div className="mt-4 pl-11">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation Plan</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          <li>Assess current situation related to this issue</li>
                          <li>Form a committee or assign responsible personnel</li>
                          <li>Develop a timeline for implementation</li>
                          <li>Allocate necessary resources</li>
                          <li>Communicate changes to stakeholders</li>
                        </ul>
                      </div>
                      
                      <div className="mt-3 flex space-x-3">
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                          Create Task
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                          Share
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                          Bookmark
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-500">Analyzing data and generating recommendations...</p>
                  </div>
                ) : (
                  <>
                    <Zap className="w-10 h-10 text-gray-400 mx-auto" />
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No recommendations yet</h3>
                    <p className="mt-2 text-gray-500">
                      Click "Generate Insights" to get AI-powered recommendations based on your data
                    </p>
                    <button
                      onClick={getAiSuggestions}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center mx-auto"
                    >
                      <Zap className="w-5 h-5 mr-1" />
                      Generate Insights
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Issues</h2>
            <p className="text-sm text-gray-500 mt-1">Most recently reported complaints and maintenance requests</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {[...complaints, ...maintenanceRequests]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((issue, index) => (
                <div key={index} className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        issue.status === 'Resolved' ? 'bg-green-100 text-green-600' : 
                        issue.priority === 'High' ? 'bg-red-100 text-red-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {issue.category ? (
                          <Wrench className="w-5 h-5" />
                        ) : (
                          <MessageCircle className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {issue.category || issue.type} • {issue.date} • {issue.status}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            
            {complaints.length === 0 && maintenanceRequests.length === 0 && (
              <div className="p-8 text-center">
                <Info className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="mt-3 text-lg font-medium text-gray-900">No issues found</h3>
                <p className="mt-2 text-gray-500">
                  Submit complaints or maintenance requests to see them analyzed here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">OpenAI API Key Required</h3>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                To generate AI-powered insights, please enter your OpenAI API key. 
                This key will be stored locally in your browser and only used to fetch suggestions.
              </p>
              
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-...your-api-key"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  disabled={!openAiKey.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    !openAiKey.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPage;