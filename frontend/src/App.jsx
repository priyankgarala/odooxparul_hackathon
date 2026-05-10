import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ItineraryBuilder from './pages/ItineraryBuilder';
import CreateTrip from './pages/CreateTrip';
import Profile from './pages/Profile';
import CitySearch from './pages/CitySearch';
import ItineraryView from './pages/ItineraryView';
import TripDetails from './pages/TripDetails';
import Community from './pages/Community';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0d0f14] text-white font-sans">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-trip"
              element={
                <ProtectedRoute>
                  <CreateTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cities"
              element={
                <ProtectedRoute>
                  <CitySearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder/:id"
              element={
                <ProtectedRoute>
                  <ItineraryBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id/details"
              element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <ItineraryView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
