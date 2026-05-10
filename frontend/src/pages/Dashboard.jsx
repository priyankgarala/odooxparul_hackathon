import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold mb-8 tracking-tight">Dashboard</h1>
        
        <div className="bg-[#151821]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-900 shadow-inner flex-shrink-0">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-400 mt-1">{user?.email}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
                  <p className="text-gray-300">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
                  <p className="text-gray-300">{user?.city ? `${user.city}, ` : ''}{user?.country || 'Not provided'}</p>
                </div>
                {user?.additionalInfo && (
                  <div className="sm:col-span-2 mt-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Additional Info</p>
                    <p className="text-gray-300 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">{user.additionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
