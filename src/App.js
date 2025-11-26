import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import SignUpForm from './Pages/SignUpForm';
import PhotoDisplay from './Pages/PhotoDisplay';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/main" element={<PhotoDisplay />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
