import { Routes, Route, Link } from 'react-router-dom'
import { ShoppingBag, User } from 'lucide-react'
import './App.css'
import Home from './pages/Home'

function App() {
  return (
    <div className="app-layout">
      {/* Navbar chung */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🍟</span>
            <span className="logo-text">SnackHub</span>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/products" className="nav-link">Sản phẩm</Link>
            <Link to="/about" className="nav-link">Về chúng tôi</Link>
          </nav>
          <div className="nav-actions">
            <button className="icon-btn"><User size={24} /></button>
            <button className="icon-btn cart-btn">
              <ShoppingBag size={24} />
              <span className="cart-badge">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Sẽ thêm các route khác sau */}
        </Routes>
      </main>

      {/* Footer chung */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SnackHub. Mọi món ngon đều ở đây!</p>
      </footer>
    </div>
  )
}

export default App
