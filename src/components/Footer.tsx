export function Footer() {
  return (
    <footer className="footer glass-panel">
      <div className="container footer-content">
        <div className="footer-section">
          <h3 className="glow-text">Kumki Crackers</h3>
          <p>Wholesale & Retail of Quality Fancy Fireworks, Crackers, Sparklers & Gift Boxes</p>
        </div>
        <div className="footer-section">
          <h4>Address</h4>
          <p>Ratna colony, Naranapuram road,</p>
          <p>Sivakasi - 626189.</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Phone: 88382 81866</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Kumki Crackers. All rights reserved.</p>
      </div>
    </footer>
  )
}
