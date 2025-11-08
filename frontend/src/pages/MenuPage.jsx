import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { menuService } from '../services/menuService';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../utils/imageHelper';
import MenuSearch from '../components/menu/MenuSearch';
import MenuFilter from '../components/menu/MenuFilter';
import MenuDetail from '../components/menu/MenuDetail';
import Loading from '../components/common/Loading';
import './MenuPage.css';

const MenuPage = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['menus', filters],
    queryFn: () => menuService.getMenuItems(filters),
  });

  const handleAddToCart = (item) => {
    addToCart({ ...item, quantity: item.quantity || 1 });
    // Show success message (you can add toast notification here)
    console.log('Added to cart:', item.name);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
  };

  const handleSearch = useCallback((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '' });
  }, []);

  const menuItems = data?.data || [];
  const hasResults = menuItems.length > 0;

  if (isLoading) return <Loading />;

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>{t('menu.title')}</h1>
        <p>{t('menu.subtitle')}</p>
      </div>

      <MenuSearch onSearch={handleSearch} initialValue={filters.search} />

      <MenuFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {!hasResults ? (
        <div className="empty-state">
          <h3>{t('menu.noResults')}</h3>
          <p>{t('menu.noResultsMessage')}</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item._id} className="menu-card" onClick={() => handleItemClick(item)}>
              <div className="menu-card-image">
                {item.image && (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="menu-card-content">
                <h3>{item.name}</h3>
                {item.category && (
                  <span className="menu-category">
                    {t(`menu.filter.${item.category}`, item.category)}
                  </span>
                )}
                <p className="price">฿{item.price}</p>
                {item.allergenInfo && (
                  <p className="allergen-info">{item.allergenInfo}</p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                  className="btn btn-primary"
                >
                  {t('menu.addToCart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuDetail
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default MenuPage;
