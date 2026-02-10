import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientPage from './pages/ClientPage';
import ClientPageStatic from './pages/ClientPageStatic';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Static route for manual customization example */}
        <Route path="/midia-static" element={<ClientPageStatic />} />

        {/* Dynamic route for personalized pages */}
        <Route path="/:clientName" element={<ClientPage />} />
      </Routes>
    </Router>
  );
}

export default App;
