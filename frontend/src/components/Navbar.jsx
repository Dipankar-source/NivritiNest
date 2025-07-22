import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Home, 
  BedDouble, 
  FileText, 
  Wrench, 
  Users as VisitorsIcon, 
  Megaphone, 
  ChevronDown,
  Bell,
  Mail,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const menuItems = [
  { label: 'Dashboard', icon: <Home size={16} />, path: '/dashboard' },
  { label: 'Room Allocation', icon: <BedDouble size={16} />, path: '/room-allocation' },
  { label: 'Complaints', icon: <FileText size={16} />, path: '/complaints' },
  { label: 'Maintenance', icon: <Wrench size={16} />, path: '/maintenance' },
  { label: 'Visitors', icon: <VisitorsIcon size={16} />, path: '/visitors' },
  { label: 'Notices', icon: <Megaphone size={16} />, path: '/notices' },
];

const Navbar = () => {
  const { toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user data and notifications/messages
  useEffect(() => {
    const storedUserData = localStorage.getItem('hostelCurrentUser');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData({
        ...parsedData,
        picture: parsedData.picture || parsedData.profileImage || null
      });
      
      // Simulate loading notifications and messages
      setNotifications([
        { id: 1, text: 'New complaint submitted', time: '10 mins ago', read: false },
        { id: 2, text: 'Maintenance request approved', time: '2 hours ago', read: true },
        { id: 3, text: 'Visitor check-in for Room 205', time: 'Yesterday', read: true }
      ]);
      
      setMessages([
        { id: 1, sender: 'Warden', text: 'About the upcoming inspection...', time: '1 day ago', read: false },
        { id: 2, sender: 'Admin', text: 'Monthly report is due tomorrow', time: '2 days ago', read: true }
      ]);
    }
  }, []);

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      role: 'user'
    };
    localStorage.setItem('hostelCurrentUser', JSON.stringify(user));
    setUserData(user);
    navigate('/dashboard');
  };

  const handleGoogleLoginFailure = () => {
    console.log('Google login failed');
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('hostelCurrentUser');
    setUserData(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const markAsRead = (type, id) => {
    if (type === 'notification') {
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, read: true} : n
      ));
    } else {
      setMessages(messages.map(m => 
        m.id === id ? {...m, read: true} : m
      ));
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navbar */}
        <div className="hidden md:flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hostel Manager</h1>
            <div className="flex space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Messages */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Mail className="h-5 w-5 text-blue-100 dark:text-gray-100" />
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              
              {showMessages && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium">
                    Messages
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {messages.length > 0 ? (
                      messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!message.read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                          onClick={() => markAsRead('message', message.id)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{message.sender}</span>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-sm truncate">{message.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No messages</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => navigate('/messages')}
                    >
                      View all messages
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-100" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium">
                    Notifications
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                          onClick={() => markAsRead('notification', notification.id)}
                        >
                          <p className="text-sm">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => navigate('/notifications')}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile - Now just a direct link to accounts */}
            <div className="relative">
              {userData ? (
                <button 
                  onClick={() => navigate('/accounts')}
                  className="flex items-center space-x-1 focus:outline-none"
                >
                  {userData.picture || userData.profileImage ? (
                    <img 
                      src={userData.picture || userData.profileImage} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full object-contain"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {userData.name.charAt(0)}
                    </div>
                  )}
                </button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  theme="filled_blue"
                  size="medium"
                  shape="pill"
                  text="signin_with"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between h-16">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-100" />
          </button>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>

          <div className="flex items-center space-x-2">
            {userData ? (
              <>
                <button 
                  onClick={() => setShowMessages(!showMessages)}
                  className="p-2 relative"
                >
                  <Mail className="h-5 w-5 text-blue-100" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 relative"
                >
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-100" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => navigate('/accounts')}
                  className="p-2"
                >
                  {userData.picture || userData.profileImage ? (
                    <img 
                      src={userData.picture || userData.profileImage} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {userData.name.charAt(0)}
                    </div>
                  )}
                </button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                theme="filled_blue"
                size="medium"
                shape="pill"
                text="signin_with"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full ${
                    location.pathname === item.path
                      ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Notifications */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div 
              className="bg-white dark:bg-indigo-200 w-full max-w-sm h-full"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-indigo-200' : ''}`}
                      onClick={() => markAsRead('notification', notification.id)}
                    >
                      <p className="text-sm">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Messages */}
      <AnimatePresence>
        {showMessages && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end"
            onClick={() => setShowMessages(false)}
          >
            <motion.div 
              className="bg-white dark:bg-indigo-200 w-full max-w-sm h-full"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Messages</h3>
                <button onClick={() => setShowMessages(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${!message.read ? 'bg-blue-50 dark:bg-indigo-200' : ''}`}
                      onClick={() => markAsRead('message', message.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{message.sender}</span>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-sm mt-1">{message.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No messages</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;