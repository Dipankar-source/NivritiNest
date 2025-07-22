import { useState, useEffect, useRef } from 'react';
import {
    User,
    Users,
    Clock,
    Calendar,
    Search,
    Plus,
    X,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    Camera,
    QrCode,
    Shield,
    ClipboardList,
    Home,
    Briefcase,
    Truck,
    Package
} from 'lucide-react';
import AiBot from '../components/AiBot';

const VisitorPage = () => {
    // Visitor data state
    const [visitors, setVisitors] = useState(() => {
        const savedVisitors = localStorage.getItem('visitors');
        return savedVisitors ? JSON.parse(savedVisitors) : [
            {
                id: 1,
                name: "Sarah Johnson",
                company: "Tech Solutions Inc.",
                email: "sarah.j@techsolutions.com",
                phone: "+1 (555) 123-4567",
                photo: "https://randomuser.me/api/portraits/women/44.jpg",
                purpose: "Business Meeting",
                category: "Business",
                host: "Mark Williams (Sales Dept)",
                checkIn: "2025-05-10T09:30:00",
                checkOut: "2025-05-10T11:45:00",
                status: "checked-out",
                verification: "facial-recognition",
                notes: "Met with sales team about new software"
            },
            {
                id: 2,
                name: "David Chen",
                company: "Global Logistics",
                email: "david.chen@globallogistics.com",
                phone: "+1 (555) 987-6543",
                photo: "https://randomuser.me/api/portraits/men/32.jpg",
                purpose: "Delivery",
                category: "Delivery",
                host: "Reception",
                checkIn: "2025-05-10T14:15:00",
                checkOut: null,
                status: "checked-in",
                verification: "qr-code",
                notes: "Dropped off packages for accounting"
            },
            {
                id: 3,
                name: "Emma Rodriguez",
                company: "University of Tech",
                email: "emma.rodriguez@utech.edu",
                phone: "+1 (555) 456-7890",
                photo: "https://randomuser.me/api/portraits/women/68.jpg",
                purpose: "Campus Tour",
                category: "Guest",
                host: "Admissions Office",
                checkIn: "2025-05-09T10:00:00",
                checkOut: "2025-05-09T12:30:00",
                status: "checked-out",
                verification: "manual",
                notes: "Prospective student - very interested"
            }
        ];
    });

    // New visitor form state
    const [newVisitor, setNewVisitor] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        purpose: 'Meeting',
        category: 'Business',
        host: '',
        verification: 'manual',
        notes: ''
    });

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        dateRange: 'today'
    });

    // UI states
    const [showForm, setShowForm] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [currentView, setCurrentView] = useState('list'); // list, current, or analytics
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('visitors', JSON.stringify(visitors));
    }, [visitors]);

    // Face detection setup
    useEffect(() => {
        if (showScanner) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [showScanner]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            const photoUrl = canvasRef.current.toDataURL('image/jpeg');
            setNewVisitor({ ...newVisitor, photo: photoUrl });
            setShowScanner(false);
        }
    };

    // Handle form submission
    const handleSubmitVisitor = (e) => {
        e.preventDefault();

        const now = new Date();
        const visitor = {
            id: visitors.length > 0 ? Math.max(...visitors.map(v => v.id)) + 1 : 1,
            ...newVisitor,
            checkIn: now.toISOString(),
            checkOut: null,
            status: "checked-in",
            photo: newVisitor.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(newVisitor.name) + "&background=random"
        };

        setVisitors([visitor, ...visitors]);
        setNewVisitor({
            name: '',
            company: '',
            email: '',
            phone: '',
            purpose: 'Meeting',
            category: 'Business',
            host: '',
            verification: 'manual',
            notes: ''
        });
        setShowForm(false);
    };

    // Handle check out
    const handleCheckOut = (id) => {
        setVisitors(visitors.map(visitor => {
            if (visitor.id === id) {
                return {
                    ...visitor,
                    checkOut: new Date().toISOString(),
                    status: "checked-out"
                };
            }
            return visitor;
        }));
    };

    // Filter visitors
    const filteredVisitors = visitors.filter(visitor => {
        // Search filter
        const matchesSearch =
            filters.search === '' ||
            visitor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            (visitor.company && visitor.company.toLowerCase().includes(filters.search.toLowerCase())) ||
            visitor.host.toLowerCase().includes(filters.search.toLowerCase());

        // Status filter
        const matchesStatus = filters.status === 'all' ||
            (filters.status === 'checked-in' && visitor.status === 'checked-in') ||
            (filters.status === 'checked-out' && visitor.status === 'checked-out');

        // Category filter
        const matchesCategory = filters.category === 'all' || visitor.category === filters.category;

        // Date filter
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const visitorDate = visitor.checkIn.split('T')[0];

        const matchesDate =
            filters.dateRange === 'all' ||
            (filters.dateRange === 'today' && visitorDate === today) ||
            (filters.dateRange === 'week' && (() => {
                const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                return visitorDate >= weekAgo;
            })());

        return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });

    // Visitor categories
    const categories = [
        { value: 'Business', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
        { value: 'Delivery', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
        { value: 'Guest', label: 'Guest', icon: <User className="w-4 h-4" /> },
        { value: 'Student', label: 'Student', icon: <Home className="w-4 h-4" /> },
        { value: 'Vendor', label: 'Vendor', icon: <Package className="w-4 h-4" /> }
    ];

    // Format date/time
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get duration
    const getDuration = (checkIn, checkOut) => {
        if (!checkIn) return 'N/A';
        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();

        const diff = Math.abs(end - start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Visitor Management</h1>
                        <p className="mt-1 text-blue-100 text-sm sm:text-base">Track and manage all campus visitors</p>
                    </div>

                    <div className="mt-3 md:mt-0 flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setCurrentView('list')}
                            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                currentView === 'list'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-700 text-white hover:bg-blue-500'
                            }`}
                        >
                            Visitor Log
                        </button>

                        <button
                            onClick={() => setCurrentView('current')}
                            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                currentView === 'current'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-700 text-white hover:bg-blue-500'
                            }`}
                        >
                            Current Visitors
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
                {currentView === 'list' && (
                    <>
                        {/* Filters and new visitor button */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
                            <div className="w-full flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search visitors..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="checked-in">Checked In</option>
                                        <option value="checked-out">Checked Out</option>
                                    </select>

                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                    >
                                        <option value="all">All Dates</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap w-full md:w-auto justify-center"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                <span className="text-sm sm:text-base">New Visitor</span>
                            </button>
                        </div>

                        {/* Visitors list */}
                        {filteredVisitors.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Desktop headers */}
                                <div className="hidden sm:grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
                                    <div className="col-span-4 sm:col-span-3">Visitor</div>
                                    <div className="col-span-2">Company</div>
                                    <div className="col-span-2">Host</div>
                                    <div className="col-span-2">Check-In</div>
                                    <div className="col-span-2">Duration</div>
                                    <div className="col-span-1">Status</div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {filteredVisitors.map(visitor => (
                                        <div
                                            key={visitor.id}
                                            className="grid grid-cols-1 sm:grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer gap-2 sm:gap-0"
                                            onClick={() => setSelectedVisitor(visitor)}
                                        >
                                            <div className="col-span-4 sm:col-span-3 flex items-center">
                                                <img
                                                    src={visitor.photo}
                                                    alt={visitor.name}
                                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{visitor.name}</p>
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        {categories.find(c => c.value === visitor.category)?.icon}
                                                        <span className="ml-1">{visitor.category}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex items-center text-gray-700 sm:mt-0 mt-2">
                                                <span className="sm:hidden font-medium mr-2">Company:</span>
                                                {visitor.company || 'N/A'}
                                            </div>

                                            <div className="col-span-2 flex items-center text-gray-700">
                                                <span className="sm:hidden font-medium mr-2">Host:</span>
                                                {visitor.host}
                                            </div>

                                            <div className="col-span-2 flex items-center text-gray-700">
                                                <span className="sm:hidden font-medium mr-2">Check-In:</span>
                                                {formatDateTime(visitor.checkIn)}
                                            </div>

                                            <div className="col-span-2 flex items-center text-gray-700">
                                                <span className="sm:hidden font-medium mr-2">Duration:</span>
                                                {getDuration(visitor.checkIn, visitor.checkOut)}
                                            </div>

                                            <div className="col-span-1 flex items-center sm:justify-end mt-2 sm:mt-0">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    visitor.status === 'checked-in'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {visitor.status === 'checked-in' ? 'In' : 'Out'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-200 text-center">
                                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No visitors found</h3>
                                <p className="mt-2 text-gray-500">
                                    {filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all'
                                        ? "Try adjusting your filters or search terms"
                                        : "No visitors have been logged yet. Add your first visitor!"
                                    }
                                </p>
                            </div>
                        )}
                    </>
                )}

                {currentView === 'current' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Currently Checked-In Visitors</h2>

                            {visitors.filter(v => v.status === 'checked-in').length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {visitors.filter(v => v.status === 'checked-in').map(visitor => (
                                        <div key={visitor.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center">
                                                    <img
                                                        src={visitor.photo}
                                                        alt={visitor.name}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{visitor.name}</h3>
                                                        <p className="text-sm text-gray-500">{visitor.company}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckOut(visitor.id);
                                                    }}
                                                    className="px-2 py-1 sm:px-3 sm:py-1 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm hover:bg-red-200 transition-colors"
                                                >
                                                    Check Out
                                                </button>
                                            </div>

                                            <div className="mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                                <p className="flex items-center text-gray-700">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                                                    <span>Checked in: {formatDateTime(visitor.checkIn)}</span>
                                                </p>
                                                <p className="flex items-center text-gray-700">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                                                    <span>Host: {visitor.host}</span>
                                                </p>
                                                <p className="flex items-center text-gray-700">
                                                    <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                                                    <span>Purpose: {visitor.purpose}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-8">
                                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No visitors currently checked in</h3>
                                    <p className="mt-2 text-gray-500">All visitors have checked out or none have arrived yet</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Check-In Options</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setNewVisitor({ ...newVisitor, verification: 'facial-recognition' });
                                    }}
                                    className="p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                >
                                    <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Facial Recognition</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Automated check-in with face detection</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setNewVisitor({ ...newVisitor, verification: 'qr-code' });
                                    }}
                                    className="p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                                >
                                    <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                        <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">QR Code Scan</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Scan pre-registered visitor QR code</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setNewVisitor({ ...newVisitor, verification: 'manual' });
                                    }}
                                    className="p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
                                >
                                    <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                        <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Manual Entry</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Traditional form-based check-in</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visitor details modal */}
                {selectedVisitor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Visitor Details</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedVisitor(null)}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <div className="px-4 sm:px-6 py-4">
                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={selectedVisitor.photo}
                                            alt={selectedVisitor.name}
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-100"
                                        />

                                        <div className="mt-3 sm:mt-4 flex flex-col space-y-2">
                                            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                selectedVisitor.status === 'checked-in'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {selectedVisitor.status === 'checked-in' ? 'Currently Checked In' : 'Checked Out'}
                                            </span>

                                            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 flex items-center">
                                                {categories.find(c => c.value === selectedVisitor.category)?.icon}
                                                <span className="ml-1">{selectedVisitor.category}</span>
                                            </span>

                                            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 flex items-center">
                                                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                <span>Verified by: {selectedVisitor.verification}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedVisitor.name}</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Company</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">{selectedVisitor.company || 'N/A'}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Contact</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">{selectedVisitor.phone}</p>
                                                <p className="text-gray-900 text-sm sm:text-base">{selectedVisitor.email}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Host</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">{selectedVisitor.host}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Purpose</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">{selectedVisitor.purpose}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Check-In</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">{formatDateTime(selectedVisitor.checkIn)}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Check-Out</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">
                                                    {selectedVisitor.checkOut ? formatDateTime(selectedVisitor.checkOut) : 'Still on premises'}
                                                </p>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Duration</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">
                                                    {getDuration(selectedVisitor.checkIn, selectedVisitor.checkOut)}
                                                </p>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Notes</h4>
                                                <p className="text-gray-900 text-sm sm:text-base">
                                                    {selectedVisitor.notes || 'No additional notes'}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedVisitor.status === 'checked-in' && (
                                            <div className="mt-4 sm:mt-6">
                                                <button
                                                    onClick={() => {
                                                        handleCheckOut(selectedVisitor.id);
                                                        setSelectedVisitor(null);
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                                                >
                                                    Check Out Visitor
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <AiBot />

                {/* New visitor form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">New Visitor Check-In</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        setShowForm(false);
                                        setShowScanner(false);
                                    }}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitVisitor} className="px-4 sm:px-6 py-4">
                                {newVisitor.verification === 'facial-recognition' && !newVisitor.photo && (
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="font-medium text-gray-900 mb-2 sm:mb-3">Facial Recognition</h3>
                                        <div className="relative bg-gray-100 rounded-lg overflow-hidden h-48 sm:h-64 flex items-center justify-center">
                                            {showScanner ? (
                                                <>
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                    <canvas ref={canvasRef} className="hidden" />
                                                    <button
                                                        type="button"
                                                        onClick={capturePhoto}
                                                        className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors z-10 text-sm sm:text-base"
                                                    >
                                                        Capture Photo
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowScanner(true)}
                                                    className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                                >
                                                    Start Camera
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                                            Position your face in the frame and click "Capture Photo" when ready
                                        </p>
                                    </div>
                                )}

                                {newVisitor.verification === 'qr-code' && (
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="font-medium text-gray-900 mb-2 sm:mb-3">QR Code Scan</h3>
                                        <div className="bg-gray-100 rounded-lg h-48 sm:h-64 flex items-center justify-center">
                                            <div className="text-center">
                                                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                                <p className="text-xs sm:text-sm text-gray-500">Scanner would be active here in a real implementation</p>
                                            </div>
                                        </div>
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                                            Scan the visitor's QR code using your device camera
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label htmlFor="verification" className="block text-sm font-medium text-gray-700 mb-1">
                                                Verification Method *
                                            </label>
                                            <select
                                                id="verification"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                value={newVisitor.verification}
                                                onChange={(e) => {
                                                    setNewVisitor({ ...newVisitor, verification: e.target.value });
                                                    setShowScanner(false);
                                                }}
                                            >
                                                <option value="manual">Manual Entry</option>
                                                <option value="facial-recognition">Facial Recognition</option>
                                                <option value="qr-code">QR Code Scan</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                Visitor Category *
                                            </label>
                                            <select
                                                id="category"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                value={newVisitor.category}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                            placeholder="Visitor's full name"
                                            value={newVisitor.name}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                                Company/Organization
                                            </label>
                                            <input
                                                type="text"
                                                id="company"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                placeholder="Company name"
                                                value={newVisitor.company}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                placeholder="visitor@example.com"
                                                value={newVisitor.email}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                placeholder="+1 (555) 123-4567"
                                                value={newVisitor.phone}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                                                Purpose of Visit *
                                            </label>
                                            <select
                                                id="purpose"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                value={newVisitor.purpose}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                                            >
                                                <option value="Meeting">Meeting</option>
                                                <option value="Delivery">Delivery</option>
                                                <option value="Interview">Interview</option>
                                                <option value="Tour">Tour</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                                            Host/Contact Person *
                                        </label>
                                        <input
                                            type="text"
                                            id="host"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                            placeholder="Name and department"
                                            value={newVisitor.host}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, host: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            id="notes"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                            placeholder="Any special instructions or notes..."
                                            value={newVisitor.notes}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                                    <button
                                        type="button"
                                        className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                                        onClick={() => {
                                            setShowForm(false);
                                            setShowScanner(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        disabled={newVisitor.verification === 'facial-recognition' && !newVisitor.photo}
                                    >
                                        Check In Visitor
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

export default VisitorPage;