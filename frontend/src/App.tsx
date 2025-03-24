import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ConcertoEditor from './pages/ctoEditor';
import FileTextExtractor from './pages/upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConcertoEditor />} />
        <Route path="/upload" element={<FileTextExtractor />} />
      </Routes>
    </Router>
  );
}

export default App;
