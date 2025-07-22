import { Home, BedDouble, FileText, Wrench, Users, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: <Home />, path: '/dashboard' },
  { label: 'Room Allocation', icon: <BedDouble />, path: '/room-allocation' },
  { label: 'Complaints', icon: <FileText />, path: '/complaints' },
  { label: 'Maintenance', icon: <Wrench />, path: '/maintenance' },
  { label: 'Visitors', icon: <Users />, path: '/visitors' },
  { label: 'Notices', icon: <Megaphone />, path: '/notices' },
];

const Sidebar = () => {
  return (
    <motion.div
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="h-screen w-64 bg-gray-900 text-white p-6 space-y-4 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Hostel Manager</h2>
      {menuItems.map(({ label, icon, path }) => (
        <Link to={path} key={label} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition">
          {icon}
          <span>{label}</span>
        </Link>
      ))}
    </motion.div>
  );
};

export default Sidebar;
