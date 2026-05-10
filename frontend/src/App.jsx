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
import PackingChecklist from './pages/PackingChecklist';
import PublicItineraryView from './pages/PublicItineraryView';
import TripNotes from './pages/TripNotes';
import ExpenseInvoice from './pages/ExpenseInvoice';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="travel-app min-h-screen text-white font-sans">
          <div className="travel-ambient" aria-hidden="true"></div>
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/shared/:shareId" element={<PublicItineraryView />} />
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
                path="/packing"
                element={
                  <ProtectedRoute>
                    <PackingChecklist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <TripNotes />
                  </ProtectedRoute>
                }
              />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <ExpenseInvoice />
                  </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
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
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
