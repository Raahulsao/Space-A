import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, MessageSquare, User, LogOut, Mail, Briefcase, 
  AtSign, Rocket, Calendar, MapPin, Shield, Settings
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

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
            <button
              onClick={signOut}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Profile header */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                {user.full_name.charAt(0)}
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-gray-600 flex items-center justify-center mt-1">
              <AtSign className="h-4 w-4 mr-1" />
              {user.username}
            </p>
            <div className="flex justify-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.gender}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                {user.branch}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Branch</p>
                      <p className="text-sm text-gray-600">{user.branch}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <User className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Gender</p>
                      <p className="text-sm text-gray-600">{user.gender}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">University</p>
                      <p className="text-sm text-gray-600">Amity University</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Member Since</p>
                      <p className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Type</p>
                      <p className="text-sm text-gray-600">Student</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Chat Preference</p>
                      <p className="text-sm text-gray-600">
                        {user.gender === 'Male' ? 'Female Users' : 'Male Users'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                <Settings className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Change Password
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors">
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>
            <Link to="/chat" className="flex flex-col items-center py-3 text-gray-500 hover:text-indigo-600 transition-colors">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Chat</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center py-3 text-indigo-600">
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

export default ProfilePage;