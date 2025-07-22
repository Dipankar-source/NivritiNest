import { useState, useEffect } from 'react';
import { User, Save, ArrowLeft, Camera, AlertCircle, CheckCircle, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { nav } from 'framer-motion/client';

const Accounts = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: null,
    role: 'user'
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('hostelCurrentUser') || 'null');
        
        if (currentUser) {
          // Get complete data from users list
          const storedUsers = JSON.parse(localStorage.getItem('hostelUsers') || '[]');
          const fullUserData = storedUsers.find(user => user.email === currentUser.email) || currentUser;
          
          const userProfileImage = fullUserData.picture || fullUserData.profileImage || null;
          
          setUserData({
            name: fullUserData.name || '',
            email: fullUserData.email || '',
            phone: fullUserData.phone || '',
            address: fullUserData.address || '',
            profileImage: userProfileImage,
            role: fullUserData.role || 'user'
          });

          if (userProfileImage) {
            setPreviewImage(userProfileImage);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      }
    };

    loadUserData();
  }, []);

  // Update localStorage whenever userData changes
  useEffect(() => {
    if (userData.email) {
      const currentUser = JSON.parse(localStorage.getItem('hostelCurrentUser') || '{}');
      if (currentUser.email === userData.email) {
        localStorage.setItem('hostelCurrentUser', JSON.stringify({
          ...currentUser,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          profileImage: userData.profileImage
        }));
      }

      // Update in users list
      const storedUsers = JSON.parse(localStorage.getItem('hostelUsers') || '[]');
      const updatedUsers = storedUsers.map(user => 
        user.email === userData.email ? { 
          ...user, 
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          profileImage: userData.profileImage
        } : user
      );
      localStorage.setItem('hostelUsers', JSON.stringify(updatedUsers));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    if (!file.type.match('image.*')) {
      setError('Please select a valid image file (JPEG, PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      setPreviewImage(imageDataUrl);
      setUserData(prev => ({ 
        ...prev, 
        profileImage: imageDataUrl,
        // Remove Google picture if uploading new image
        picture: undefined 
      }));
      setError('');
    };
    reader.onerror = () => setError('Failed to read image file');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!userData.name.trim()) {
        throw new Error('Full name is required');
      }

      // Show success and exit edit mode
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reload original data
    const currentUser = JSON.parse(localStorage.getItem('hostelCurrentUser') || 'null');
    if (currentUser) {
      setUserData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        profileImage: currentUser.picture || currentUser.profileImage || null,
        role: currentUser.role || 'user'
      });
      setPreviewImage(currentUser.picture || currentUser.profileImage || null);
    }
    setIsEditing(false);
    setError('');
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      role: userData.role || 'user' // Preserve existing role
    };
    
    // Update both current user and users list
    localStorage.setItem('hostelCurrentUser', JSON.stringify(user));
    
    const storedUsers = JSON.parse(localStorage.getItem('hostelUsers') || '[]');
    const updatedUsers = storedUsers.map(u => 
      u.email === user.email ? { ...u, picture: decoded.picture } : u
    );
    localStorage.setItem('hostelUsers', JSON.stringify(updatedUsers));
    
    setUserData(user);
    setPreviewImage(decoded.picture);
    setSuccess('Google account linked successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleGoogleLoginFailure = () => {
    setError('Failed to link Google account');
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('hostelCurrentUser');
    navigate('/login');
  };

  const goBack = () => {
    navigate(-1);
  };

  const getRoleIcon = () => {
    switch(userData.role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'warden':
        return <User className="w-4 h-4 text-green-500" />;
      case 'guard':
        return <Key className="w-4 h-4 text-yellow-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={goBack} 
            className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        {/* Status messages */}
        {error && (
          <div className="mb-4 flex items-center p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-full bg-gray-200 overflow-hidden mb-4">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 mr-13 mb-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              {getRoleIcon()}
              <span className="capitalize">{userData.role}</span>
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">
              {isEditing ? 'Click the camera icon to update' : 'Profile picture'}
            </p>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={userData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone" className="block mb-1 text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={userData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="address" className="block mb-1 text-sm font-medium">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={userData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Google Account Section */}
            {!userData.picture && (
              <div className="pt-2">
                <label className="block mb-1 text-sm font-medium">
                  Link Google Account
                </label>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  theme="outline"
                  size="medium"
                  shape="pill"
                  text="continue_with"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              {userData.email && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-75"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              )}
              {userData.email && (
                <button
                  onClick={()=>navigate('/')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;