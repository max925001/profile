import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAccount } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    githubUsername: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const result = await dispatch(createAccount(formData)).unwrap();
      toast.success('Account created successfully! 🎉 Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
          />
          <input
            type="text"
            name="githubUsername"
            placeholder="GitHub Username"
            value={formData.githubUsername}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            disabled={submitting}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}