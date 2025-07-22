import { useState, useEffect } from 'react';
import { 
  Bed, 
  Utensils, 
  User, 
  Users, 
  Home, 
  Clock, 
  Calendar, 
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import AiBot from '../components/AiBot';

const RoomAllocation = () => {
  // Sample data - replace with your actual data source
  const [rooms, setRooms] = useState(() => {
    const savedRooms = localStorage.getItem('hostelRooms');
    return savedRooms ? JSON.parse(savedRooms) : [
      {
        id: 101,
        type: 'Single AC',
        capacity: 1,
        occupants: [
          {
            id: 'S001',
            name: 'Rahul Sharma',
            course: 'B.Tech CSE',
            year: '3rd',
            foodPreference: 'Vegetarian',
            allocatedOn: '2023-06-15',
            feesPaid: true,
            contact: 'rahul.sharma@example.com'
          }
        ],
        amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Study Table'],
        status: 'Occupied'
      },
      {
        id: 102,
        type: 'Double Non-AC',
        capacity: 2,
        occupants: [
          {
            id: 'S002',
            name: 'Priya Patel',
            course: 'B.Sc Physics',
            year: '2nd',
            foodPreference: 'Vegetarian',
            allocatedOn: '2023-07-10',
            feesPaid: true,
            contact: 'priya.patel@example.com'
          },
          {
            id: 'S003',
            name: 'Neha Gupta',
            course: 'B.Com',
            year: '1st',
            foodPreference: 'Vegan',
            allocatedOn: '2023-07-10',
            feesPaid: false,
            contact: 'neha.gupta@example.com'
          }
        ],
        amenities: ['WiFi', 'Common Bathroom', 'Study Table'],
        status: 'Partially Occupied'
      },
      {
        id: 103,
        type: 'Dormitory',
        capacity: 8,
        occupants: [
          {
            id: 'S004',
            name: 'Amit Singh',
            course: 'B.Tech ME',
            year: '4th',
            foodPreference: 'Non-Vegetarian',
            allocatedOn: '2023-06-01',
            feesPaid: true,
            contact: 'amit.singh@example.com'
          },
          {
            id: 'S005',
            name: 'Vikram Joshi',
            course: 'B.Tech ECE',
            year: '4th',
            foodPreference: 'Vegetarian',
            allocatedOn: '2023-06-01',
            feesPaid: true,
            contact: 'vikram.joshi@example.com'
          }
        ],
        amenities: ['Common Bathroom', 'Study Hall', 'Laundry Service'],
        status: 'Available'
      }
    ];
  });

  const [newAllocation, setNewAllocation] = useState({
    roomId: '',
    studentId: '',
    studentName: '',
    course: '',
    year: '',
    foodPreference: 'Vegetarian',
    duration: 'Academic Year'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Save to local storage when rooms change
  useEffect(() => {
    localStorage.setItem('hostelRooms', JSON.stringify(rooms));
  }, [rooms]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpand = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleAllocateRoom = () => {
    if (!newAllocation.roomId || !newAllocation.studentId || !newAllocation.studentName) {
      alert('Please fill all required fields');
      return;
    }

    const updatedRooms = rooms.map(room => {
      if (room.id.toString() === newAllocation.roomId) {
        const newOccupant = {
          id: newAllocation.studentId,
          name: newAllocation.studentName,
          course: newAllocation.course,
          year: newAllocation.year,
          foodPreference: newAllocation.foodPreference,
          allocatedOn: new Date().toISOString().split('T')[0],
          feesPaid: false,
          contact: ''
        };

        const updatedRoom = {
          ...room,
          occupants: [...room.occupants, newOccupant],
          status: room.occupants.length + 1 === room.capacity ? 'Occupied' : 'Partially Occupied'
        };

        return updatedRoom;
      }
      return room;
    });

    setRooms(updatedRooms);
    setNewAllocation({
      roomId: '',
      studentId: '',
      studentName: '',
      course: '',
      year: '',
      foodPreference: 'Vegetarian',
      duration: 'Academic Year'
    });
    setShowAllocationForm(false);
  };

  const handleDeallocate = (roomId, studentId) => {
    if (!window.confirm('Are you sure you want to deallocate this student?')) return;

    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        const updatedOccupants = room.occupants.filter(occ => occ.id !== studentId);
        
        let newStatus = room.status;
        if (updatedOccupants.length === 0) {
          newStatus = 'Available';
        } else if (updatedOccupants.length < room.capacity) {
          newStatus = 'Partially Occupied';
        }

        return {
          ...room,
          occupants: updatedOccupants,
          status: newStatus
        };
      }
      return room;
    });

    setRooms(updatedRooms);
  };

  const filteredRooms = rooms.filter(room => 
    room.id.toString().includes(searchTerm) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.occupants.some(occ => 
      occ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const availableRooms = rooms.filter(room => 
    room.status === 'Available' || room.status === 'Partially Occupied'
  );

  const RoomCard = ({ room }) => {
    const occupancyPercentage = Math.round((room.occupants.length / room.capacity) * 100);
    const isExpanded = expandedRoom === room.id;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 transition-all duration-200">
        <div 
          className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleExpand(room.id)}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-start md:items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                <Bed className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg truncate">Room {room.id} - {room.type}</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {room.occupants.length}/{room.capacity} occupants • {room.status}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end md:space-x-4">
              <div className="w-16 md:w-24">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{occupancyPercentage}% occupied</p>
              </div>
              <button className="text-gray-500 ml-2">
                {isExpanded ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                  <Home className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Room Details
                </h4>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{room.type}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{room.capacity}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      room.status === 'Available' ? 'text-green-500' : 
                      room.status === 'Occupied' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {room.status}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Amenities:</span>
                    <span className="font-medium text-right">
                      {room.amenities.join(', ')}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                  <Utensils className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Food Preferences
                </h4>
                {room.occupants.length > 0 ? (
                  <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                    {room.occupants.map(occ => (
                      <li key={occ.id} className="flex justify-between">
                        <span className="text-gray-500 truncate max-w-[100px]">{occ.name}:</span>
                        <span className="font-medium capitalize">{occ.foodPreference.toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs md:text-sm">No occupants</p>
                )}
              </div>

              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Meal Schedule
                </h4>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Breakfast:</span>
                    <span className="font-medium">7:30 - 9:30 AM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Lunch:</span>
                    <span className="font-medium">12:30 - 2:30 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Snacks:</span>
                    <span className="font-medium">5:00 - 5:30 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Dinner:</span>
                    <span className="font-medium">8:00 - 9:30 PM</span>
                  </li>
                </ul>
              </div>
            </div>

            <h4 className="font-medium text-gray-700 mb-2 md:mb-3 flex items-center text-sm md:text-base">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Current Occupants
            </h4>
            {room.occupants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">ID</th>
                      {!isMobile && (
                        <>
                          <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Allocated</th>
                        </>
                      )}
                      <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Fees</th>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-left text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {room.occupants.map(occupant => (
                      <tr key={occupant.id}>
                        <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap font-medium">{occupant.id}</td>
                        {!isMobile && (
                          <>
                            <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">{occupant.name}</td>
                            <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">{occupant.course}</td>
                            <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">{occupant.year}</td>
                            <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">{occupant.allocatedOn}</td>
                          </>
                        )}
                        <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">
                          {occupant.feesPaid ? (
                            <span className="px-1 md:px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : (
                            <span className="px-1 md:px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 md:px-4 md:py-2 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeallocate(room.id, occupant.id);
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center text-xs md:text-sm"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {!isMobile && 'Deallocate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 py-2 md:py-4 text-xs md:text-sm">No occupants currently allocated to this room</p>
            )}

            <div className="mt-4 md:mt-6 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewAllocation(prev => ({ ...prev, roomId: room.id.toString() }));
                  setShowAllocationForm(true);
                }}
                disabled={room.occupants.length >= room.capacity}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center ${
                  room.occupants.length >= room.capacity
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Allocate Student
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 md:mb-6 lg:mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <Home className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-500" />
                Hostel Room Allocation
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                Manage student accommodations, room assignments, and food preferences
              </p>
            </div>
            <button
              onClick={() => setShowAllocationForm(true)}
              className="md:hidden px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search rooms or students..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAllocationForm(true)}
            className="hidden md:flex px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 items-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Allocation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Rooms</p>
                <h3 className="text-xl md:text-2xl font-bold mt-1">{rooms.length}</h3>
              </div>
              <div className="p-2 md:p-3 rounded-lg bg-blue-50 text-blue-600">
                <Home className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Occupied Rooms</p>
                <h3 className="text-xl md:text-2xl font-bold mt-1">
                  {rooms.filter(r => r.status === 'Occupied').length}
                </h3>
              </div>
              <div className="p-2 md:p-3 rounded-lg bg-green-50 text-green-600">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Available Rooms</p>
                <h3 className="text-xl md:text-2xl font-bold mt-1">
                  {rooms.filter(r => r.status === 'Available').length}
                </h3>
              </div>
              <div className="p-2 md:p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Bed className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6 lg:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3 lg:mb-4">Room Allocation Status</h2>
          {filteredRooms.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 text-sm md:text-base">No rooms found matching your search criteria</p>
            </div>
          )}
        </div>
        <AiBot />

        {showAllocationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Allocate New Student</h3>
                  <button 
                    onClick={() => setShowAllocationForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                      value={newAllocation.roomId}
                      onChange={(e) => setNewAllocation({...newAllocation, roomId: e.target.value})}
                      required
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.id} - {room.type} ({room.capacity - room.occupants.length} beds left)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                      value={newAllocation.studentId}
                      onChange={(e) => setNewAllocation({...newAllocation, studentId: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                      value={newAllocation.studentName}
                      onChange={(e) => setNewAllocation({...newAllocation, studentName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Course</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                        value={newAllocation.course}
                        onChange={(e) => setNewAllocation({...newAllocation, course: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Year</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                        value={newAllocation.year}
                        onChange={(e) => setNewAllocation({...newAllocation, year: e.target.value})}
                      >
                        <option value="">Select year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                      value={newAllocation.foodPreference}
                      onChange={(e) => setNewAllocation({...newAllocation, foodPreference: e.target.value})}
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Jain">Jain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                      value={newAllocation.duration}
                      onChange={(e) => setNewAllocation({...newAllocation, duration: e.target.value})}
                    >
                      <option value="Academic Year">Academic Year</option>
                      <option value="Semester">Semester</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 flex justify-end space-x-2 md:space-x-3">
                  <button
                    onClick={() => setShowAllocationForm(false)}
                    className="px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAllocateRoom}
                    className="px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-600"
                  >
                    Allocate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAllocation;