// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameStart from './pages/GameStart';
import SelectType from './pages/SelectType';
import PickNumber from './pages/PickNumber';
import GameBoard from './pages/GameBoard';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          {/* GameStart page with Header */}
          <Route 
            path="/" 
            element={
              <>
             
                <main style={{ flex: 1 }}>
                  <GameStart />
                </main>
              </>
            } 
          />
          
          {/* Other pages without Header */}
       <Route 
  path="/select-type" 
  element={
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <SelectType />
      </main>
    </>
  } 
/>
          <Route 
            path="/pick-number" 
            element={
              <main style={{ flex: 1 }}>
                <PickNumber />
              </main>
            } 
          />
          <Route 
            path="/game-board" 
            element={
              <main style={{ flex: 1 }}>
                <GameBoard />
              </main>
            } 
          />
          
          {/* AdminPanel with Header (optional) */}
          <Route 
            path="/cpanel" 
            element={
              <>
                <Header />
                <main style={{ flex: 1 }}>
                  <AdminPanel />
                </main>
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;