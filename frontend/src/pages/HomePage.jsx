import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const features = [
    {
      icon: '🍽️',
      title: t('home.features.easyOrder'),
      description: t('home.features.easyOrderDesc')
    },
    {
      icon: '⚡',
      title: t('home.features.fastService'),
      description: t('home.features.fastServiceDesc')
    },
    {
      icon: '💳',
      title: t('home.features.securePayment'),
      description: t('home.features.securePaymentDesc')
    },
    {
      icon: '📱',
      title: t('home.features.realTimeTracking'),
      description: t('home.features.realTimeTrackingDesc')
    }
  ];

  const howItWorks = [
    { step: '1', icon: '📱', title: t('home.howItWorks.browse'), desc: t('home.howItWorks.browseDesc') },
    { step: '2', icon: '🛒', title: t('home.howItWorks.order'), desc: t('home.howItWorks.orderDesc') },
    { step: '3', icon: '💳', title: t('home.howItWorks.pay'), desc: t('home.howItWorks.payDesc') },
    { step: '4', icon: '✨', title: t('home.howItWorks.enjoy'), desc: t('home.howItWorks.enjoyDesc') }
  ];

  const categories = [
    { icon: '🍜', name: t('home.categories.noodles'), color: '#FF6B6B' },
    { icon: '🍚', name: t('home.categories.rice'), color: '#4ECDC4' },
    { icon: '🍕', name: t('home.categories.fastFood'), color: '#FFD93D' },
    { icon: '🥗', name: t('home.categories.healthy'), color: '#95E1D3' },
    { icon: '🍰', name: t('home.categories.desserts'), color: '#F38181' },
    { icon: '☕', name: t('home.categories.beverages'), color: '#AA96DA' }
  ];

  const stats = [
    { number: '500+', label: t('home.stats.menuItems') },
    { number: '50+', label: t('home.stats.vendors') },
    { number: '10K+', label: t('home.stats.students') },
    { number: '4.8★', label: t('home.stats.rating') }
  ];

  const heroFoodItems = [
    { emoji: '🍜', name: 'Noodles', color: '#FF6B6B' },
    { emoji: '🍕', name: 'Pizza', color: '#FFD93D' },
    { emoji: '🍔', name: 'Burger', color: '#4ECDC4' },
    { emoji: '🍱', name: 'Bento', color: '#95E1D3' },
    { emoji: '🍰', name: 'Cake', color: '#F38181' },
    { emoji: '☕', name: 'Coffee', color: '#AA96DA' }
  ];

  const handleCardClick = () => {
    setActiveCardIndex((prev) => (prev + 1) % heroFoodItems.length);
  };

  return (
    <div className="home-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-food food-1">🍜</div>
        <div className="floating-food food-2">🍕</div>
        <div className="floating-food food-3">🍔</div>
        <div className="floating-food food-4">🍰</div>
        <div className="floating-food food-5">☕</div>
        <div className="floating-food food-6">🍱</div>
        <div className="floating-food food-7">🥗</div>
        <div className="floating-food food-8">🍩</div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">{t('home.title')}</h1>
            <p className="hero-subtitle">{t('home.subtitle')}</p>
            <div className="hero-buttons">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    {t('common.register')}
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-large">
                    {t('common.login')}
                  </Link>
                </>
              ) : (
                <Link to="/menu" className="btn btn-primary btn-large">
                  {t('home.browseMenu')} →
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              {/* Circular Food Carousel */}
              <div className="food-carousel-container" onClick={handleCardClick}>
                <div className="food-carousel">
                  {heroFoodItems.map((item, index) => {
                    const position = (index - activeCardIndex + heroFoodItems.length) % heroFoodItems.length;
                    return (
                      <div
                        key={index}
                        className={`food-card ${position === 0 ? 'active' : ''}`}
                        style={{
                          '--card-position': position,
                          '--card-color': item.color,
                          '--total-cards': heroFoodItems.length
                        }}
                      >
                        <div className="food-card-inner">
                          <div className="food-card-emoji">{item.emoji}</div>
                          <div className="food-card-name">{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center Circle Indicator */}
                {/* <div className="carousel-center">
                  <div className="center-circle"></div>
                  <div className="click-hint">Click to rotate</div>
                </div> */}
              </div>

              {/* Decorative Elements */}
              <div className="hero-decoration decoration-1">
                <div className="decoration-circle"></div>
              </div>
              <div className="hero-decoration decoration-2">
                <div className="decoration-circle"></div>
              </div>
              <div className="hero-decoration decoration-3">
                <div className="decoration-circle"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">{t('home.howItWorks.title')}</h2>
          <p className="section-subtitle">{t('home.howItWorks.subtitle')}</p>
          <div className="steps-grid">
            {howItWorks.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">{t('home.categories.title')}</h2>
          <p className="section-subtitle">{t('home.categories.subtitle')}</p>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/menu?category=${category.name}`}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">{t('home.whyChooseUs')}</h2>
          <p className="section-subtitle">{t('home.whyChooseUsSubtitle')}</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{t('home.readyToOrder')}</h2>
          <p>{t('home.joinThousands')}</p>
          <Link to="/menu" className="btn btn-primary btn-large">
            {t('home.startOrdering')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
