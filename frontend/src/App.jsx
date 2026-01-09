import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useSelector } from 'react-redux';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center flex-col gap-4">
                <h1 className="text-4xl">Welcome to Your App!</h1>
                <button
                  onClick={() => {
                    // You'll add logout dispatch here later
                    window.location.href = '/login';
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </PrivateRoute>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
