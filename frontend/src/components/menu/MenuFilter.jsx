import { useTranslation } from 'react-i18next';
import './MenuFilter.css';

const MenuFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const { t } = useTranslation();

  const categories = [
    { value: '', label: t('menu.filter.allCategories') },
    { value: 'main_dish', label: t('menu.filter.mainDish') },
    { value: 'appetizer', label: t('menu.filter.appetizer') },
    { value: 'dessert', label: t('menu.filter.dessert') },
    { value: 'beverage', label: t('menu.filter.beverage') },
    { value: 'snack', label: t('menu.filter.snack') },
  ];

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleMinPriceChange = (e) => {
    onFilterChange({ ...filters, minPrice: e.target.value });
  };

  const handleMaxPriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: e.target.value });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className="menu-filter">
      <div className="filter-group">
        <label htmlFor="category">{t('menu.filter.category')}</label>
        <select
          id="category"
          value={filters.category}
          onChange={handleCategoryChange}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="minPrice">{t('menu.filter.priceRange')}</label>
        <div className="price-range">
          <input
            id="minPrice"
            type="number"
            placeholder={t('menu.filter.min')}
            value={filters.minPrice}
            onChange={handleMinPriceChange}
            className="filter-input"
            min="0"
          />
          <span className="price-separator">-</span>
          <input
            id="maxPrice"
            type="number"
            placeholder={t('menu.filter.max')}
            value={filters.maxPrice}
            onChange={handleMaxPriceChange}
            className="filter-input"
            min="0"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={onClearFilters} className="btn-clear-filters">
          {t('menu.filter.clearFilters')}
        </button>
      )}
    </div>
  );
};

export default MenuFilter;
