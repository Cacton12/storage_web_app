import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import SignUpForm from './Pages/SignUpForm';
import PhotoDisplay from './Pages/PhotoDisplay';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/main" element={<PhotoDisplay />} />
    </Routes>
  );
}

export default App;
