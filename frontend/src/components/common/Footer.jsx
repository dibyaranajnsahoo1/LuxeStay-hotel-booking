import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }} className="mt-20">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#d4a842,#f0c866,#d4a842)' }}>
                <span className="font-display font-bold text-[#0a0a0f] text-sm">L</span>
              </div>
              <span className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Luxe<span className="text-gradient">Stay</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Discover India's finest luxury hotels. Premium stays, unmatched service, unforgettable experiences.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a
                  key={i} href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold-border)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display text-lg font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Explore</h4>
            <ul className="space-y-3">
              {[
                ['Hotels',             '/hotels'],
                ['Luxury Resorts',     '/hotels?category=resort'],
                ['Heritage Hotels',    '/hotels?category=heritage'],
                ['Top Offers',         '/hotels?sort=-ratings.average'],
                ['Popular Cities',     '/hotels?featured=true'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service'].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <FiMapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
                <span>Level 12, Trade Center, BKC, Mumbai 400051</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FiPhone className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                <a href="tel:+918001234567" className="transition-colors"
                   style={{ color: 'var(--text-muted)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  +91 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FiMail className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                <a href="mailto:support@luxestay.com" className="transition-colors"
                   style={{ color: 'var(--text-muted)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  support@luxestay.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
             style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} LuxeStay. All rights reserved.
          </p>
          <div className="flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity">
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Secured by</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Razorpay_logo.svg/200px-Razorpay_logo.svg.png"
              alt="Razorpay"
              className="h-5"
              style={{ filter: 'var(--razorpay-filter, none)' }}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
