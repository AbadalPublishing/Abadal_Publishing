import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-name">ABADAL</div>
          <p className="footer-brand-tagline">
            An independent press, rooted in Pakhtunkhwa. Publishing works of correction, consequence, and long quiet authority.
          </p>
        </div>
        <div>
          <div className="footer-col-title">House</div>
          <ul className="footer-links">
            <li><Link to="/">About</Link></li>
            <li><Link to="/authors">Authors</Link></li>
            <li><Link to="/submissions">Submissions</Link></li>
            <li><Link to="/catalogue">Catalogue</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Customer</div>
          <ul className="footer-links">
            <li><Link to="/account/orders">My Orders</Link></li>
            <li><Link to="/account/addresses">Addresses</Link></li>
            <li><Link to="/account/wishlist">Wishlist</Link></li>
            <li><Link to="/account/profile">Profile</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Contact</div>
          <ul className="footer-links">
            <li><a href="https://wa.me/923039555966" target="_blank" rel="noopener">WhatsApp</a></li>
            <li><a href="mailto:info@abadalpublishing.com">Email</a></li>
            <li><a href="https://www.amazon.com" target="_blank" rel="noopener">Amazon Store</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© MMXXVI Abadal Publishing</span>
        <span>Peshawar — Khyber Pakhtunkhwa</span>
      </div>
    </footer>
  )
}
