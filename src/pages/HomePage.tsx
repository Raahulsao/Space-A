import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, MessageSquare, User, LogOut } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    // Landing page for non-authenticated users
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col justify-center items-center py-12 px-6">
        <div className="text-center">
          <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Space-A</h1>
          <p className="text-xl text-indigo-200 mb-8">Connect with university students</p>
          <div className="space-y-4">
            <Link to="/login" className="block w-full px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="block w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for authenticated users
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
              <span className="text-sm font-medium">{user.username}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user.full_name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Space-A, {user.full_name}!</h2>
          <p className="text-gray-600 mb-8">Connect with other students from your university . THIS IS IN BETA VERSION AND WE ADDING FEATURES EVERYDAY. SO keep explore.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
            <Link to="/chat" className="flex flex-col items-center p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              <MessageSquare className="h-12 w-12 text-indigo-600 mb-4" />
              <span className="font-medium text-indigo-700">Start Chatting</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <User className="h-12 w-12 text-purple-600 mb-4" />
              <span className="font-medium text-purple-700">View Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center py-3 text-indigo-600">
              <Rocket className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>
            <Link to="/chat" className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors">
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

export default HomePage;