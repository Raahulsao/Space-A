import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, MessageSquare, Rocket, Search } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <Rocket className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Space-A</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center bg-indigo-700/50 rounded-full px-3 py-1.5">
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-6 max-w-3xl">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Search bar */}
                <div className="px-4 py-4 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search users..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                    Chat List
                  </h2>
                  <div className="text-xs font-medium px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                    {user?.gender === 'Male' ? 'Showing Female Users' : 'Showing Male Users'}
                  </div>
                </div>
                
                <ChatList searchQuery={searchQuery} />
              </div>
            </div>
          } />
          <Route path="/:userId" element={<ChatRoom />} />
        </Routes>
      </div>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors">
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>
            <Link to="/chat" className={`flex flex-col items-center py-3 ${location.pathname.startsWith('/chat') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600 transition-colors'}`}>
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Chat</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors">
              <User className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Profile</span>
            </Link>
            <button 
              onClick={signOut}
              className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Add padding to account for fixed bottom nav */}
      <div className="h-16"></div>
    </div>
  );
};

export default ChatPage;