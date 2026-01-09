import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout, searchSkill } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchSkill(searchQuery.trim()));
      } else {
        // Clear search when empty
        dispatch(searchSkill(''));
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Cleanup on new keystroke
  }, [searchQuery, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      // Error handled in thunk
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 ">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a skill (e.g. React, Python)"
            className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={handleLogout}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;