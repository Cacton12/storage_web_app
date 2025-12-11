import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import SignUpForm from './Pages/SignUpForm';
import PhotoDisplay from './Pages/PhotoDisplay';
import Profile from './Pages/Profile';
import FeedbackPage from './Pages/Feedback';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/main" element={<PhotoDisplay />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
