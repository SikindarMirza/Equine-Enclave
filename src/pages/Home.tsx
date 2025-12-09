import { useState, useEffect } from 'react'
import '../App.css'

function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      const sections = ['home', 'about', 'services', 'gallery', 'contact']
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app">
      {/* Navigation */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__logo">
          <span className="nav__logo-icon">🐴</span>
          <span className="nav__logo-text">Equine Enclave</span>
        </div>
        <ul className="nav__links">
          {['Home', 'About', 'Services', 'Gallery', 'Contact'].map((item) => (
            <li key={item}>
              <a 
                href={`#${item.toLowerCase()}`}
                className={activeSection === item.toLowerCase() ? 'active' : ''}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero__overlay"></div>
        <div className="hero__content">
          <h1 className="hero__title">
            <span className="hero__title-line">Where Grace</span>
            <span className="hero__title-line">Meets Gallop</span>
          </h1>
          <p className="hero__subtitle">
            Premier equestrian center offering world-class boarding, training, and riding experiences
          </p>
          <div className="hero__cta">
            <a href="#services" className="btn btn--primary">Explore Services</a>
            <a href="#contact" className="btn btn--secondary">Book a Visit</a>
          </div>
        </div>
        <div className="hero__scroll-indicator">
          <span>Scroll</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about__container">
          <div className="about__image">
            <div className="about__image-frame">
              <div className="about__image-placeholder">
                <span>🏇</span>
              </div>
            </div>
          </div>
          <div className="about__content">
            <span className="section-tag">Our Story</span>
            <h2 className="section-title">A Legacy of Excellence</h2>
            <p className="about__text">
              Nestled in the rolling hills of the countryside, Equine Enclave has been a sanctuary 
              for horses and riders alike for over three decades. Our passion for equestrian 
              excellence drives everything we do.
            </p>
            <p className="about__text">
              From beginner riders taking their first steps to competitive athletes preparing 
              for championship events, we provide an environment where both horse and rider 
              can thrive and grow together.
            </p>
            <div className="about__stats">
              <div className="stat">
                <span className="stat__number">30+</span>
                <span className="stat__label">Years Experience</span>
              </div>
              <div className="stat">
                <span className="stat__number">50</span>
                <span className="stat__label">Horses Boarded</span>
              </div>
              <div className="stat">
                <span className="stat__number">200+</span>
                <span className="stat__label">Happy Riders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="services__container">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
          <div className="services__grid">
            {[
              {
                icon: '🏠',
                title: 'Luxury Boarding',
                description: 'Spacious stalls, daily turnout, premium feed, and 24/7 care for your beloved companion.'
              },
              {
                icon: '🎯',
                title: 'Professional Training',
                description: 'From groundwork to advanced dressage, our certified trainers help you reach your goals.'
              },
              {
                icon: '📚',
                title: 'Riding Lessons',
                description: 'All ages and skill levels welcome. Private and group lessons available year-round.'
              },
              {
                icon: '🏆',
                title: 'Show Preparation',
                description: 'Competition coaching, show grooming, and transport services for serious competitors.'
              },
              {
                icon: '🌿',
                title: 'Trail Riding',
                description: 'Explore scenic trails through meadows and forests on guided horseback adventures.'
              },
              {
                icon: '💆',
                title: 'Rehabilitation',
                description: 'Specialized care and recovery programs for horses returning from injury.'
              }
            ].map((service, index) => (
              <div key={index} className="service-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <span className="service-card__icon">{service.icon}</span>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery">
        <div className="gallery__container">
          <span className="section-tag">Visual Journey</span>
          <h2 className="section-title">Our Gallery</h2>
          <div className="gallery__grid">
            {[
              { emoji: '🐎', label: 'Pasture Life' },
              { emoji: '🏟️', label: 'Training Arena' },
              { emoji: '🌅', label: 'Sunset Rides' },
              { emoji: '🏇', label: 'Competition Day' },
              { emoji: '🌾', label: 'Country Trails' },
              { emoji: '🐴', label: 'Stable Friends' }
            ].map((item, index) => (
              <div key={index} className="gallery__item" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="gallery__item-content">
                  <span className="gallery__item-emoji">{item.emoji}</span>
                  <span className="gallery__item-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <div className="testimonial__container">
          <blockquote className="testimonial__quote">
            "Equine Enclave transformed not just my riding, but my entire relationship with horses. 
            The trainers are exceptional and truly care about each horse and rider."
          </blockquote>
          <cite className="testimonial__author">
            <span className="testimonial__name">Sarah Mitchell</span>
            <span className="testimonial__role">Dressage Competitor</span>
          </cite>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="contact__container">
          <div className="contact__info">
            <span className="section-tag">Get In Touch</span>
            <h2 className="section-title">Visit The Enclave</h2>
            <p className="contact__text">
              Schedule a tour of our facilities, inquire about boarding availability, 
              or book your first lesson. We'd love to meet you and your equine partner.
            </p>
            <div className="contact__details">
              <div className="contact__detail">
                <span className="contact__detail-icon">📍</span>
                <span>1234 Meadow Lane, Countryside, ST 12345</span>
              </div>
              <div className="contact__detail">
                <span className="contact__detail-icon">📞</span>
                <span>(555) 123-4567</span>
              </div>
              <div className="contact__detail">
                <span className="contact__detail-icon">✉️</span>
                <span>hello@equineenclave.com</span>
              </div>
              <div className="contact__detail">
                <span className="contact__detail-icon">🕐</span>
                <span>Open Daily: 7am - 7pm</span>
              </div>
            </div>
          </div>
          <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" placeholder="Jane Rider" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="jane@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="interest">Interest</label>
              <select id="interest">
                <option value="">Select an option...</option>
                <option value="boarding">Horse Boarding</option>
                <option value="lessons">Riding Lessons</option>
                <option value="training">Professional Training</option>
                <option value="tour">Facility Tour</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={4} placeholder="Tell us about yourself and your horse..."></textarea>
            </div>
            <button type="submit" className="btn btn--primary btn--full">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__brand">
            <span className="footer__logo">🐴 Equine Enclave</span>
            <p className="footer__tagline">Where Grace Meets Gallop</p>
          </div>
          <div className="footer__links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="footer__copyright">
            © {new Date().getFullYear()} Equine Enclave. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home

