import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { canteenService } from '../services/canteenService';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../utils/imageHelper';
import Loading from '../components/common/Loading';
import './MenuPage.css';

const NewMenuPage = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [currentView, setCurrentView] = useState('canteens'); // canteens, vendors, menus
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // Fetch canteens
  const { data: canteensData, isLoading: canteensLoading } = useQuery({
    queryKey: ['canteens'],
    queryFn: () => canteenService.getAllCanteens(),
    enabled: currentView === 'canteens',
  });

  // Fetch vendors by canteen
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors', selectedCanteen?._id],
    queryFn: () => canteenService.getVendorsByCanteen(selectedCanteen._id),
    enabled: currentView === 'vendors' && !!selectedCanteen,
  });

  // Fetch menus by vendor
  const { data: menusData, isLoading: menusLoading } = useQuery({
    queryKey: ['vendor-menus', selectedVendor?._id],
    queryFn: () => canteenService.getVendorMenus(selectedVendor._id),
    enabled: currentView === 'menus' && !!selectedVendor,
  });

  const handleCanteenClick = (canteen) => {
    setSelectedCanteen(canteen);
    setCurrentView('vendors');
  };

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('menus');
  };

  const handleBack = () => {
    if (currentView === 'menus') {
      setSelectedVendor(null);
      setCurrentView('vendors');
    } else if (currentView === 'vendors') {
      setSelectedCanteen(null);
      setCurrentView('canteens');
    }
  };

  const handleOptionChange = (menuId, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [option]: !prev[menuId]?.[option]
      }
    }));
  };

  const handleAddToCart = (item) => {
    const options = selectedOptions[item._id] || {};
    const specialRequests = Object.entries(options)
      .filter(([_, selected]) => selected)
      .map(([option]) => option)
      .join(', ');

    addToCart({
      ...item,
      quantity: 1,
      specialRequests: specialRequests || undefined,
    });

    // Clear options after adding
    setSelectedOptions(prev => ({
      ...prev,
      [item._id]: {}
    }));
  };

  const canteens = canteensData?.data || [];
  const vendors = vendorsData?.data || [];
  const menus = menusData?.data || [];

  if (canteensLoading || vendorsLoading || menusLoading) {
    return <Loading />;
  }

  return (
    <div className="menu-page">
      {/* Header with breadcrumb */}
      <div className="menu-header">
        {currentView !== 'canteens' && (
          <button onClick={handleBack} className="back-button">
            ← ย้อนกลับ
          </button>
        )}
        <h1>
          {currentView === 'canteens' && 'เลือกโรงอาหาร'}
          {currentView === 'vendors' && selectedCanteen?.name}
          {currentView === 'menus' && selectedVendor?.shopName}
        </h1>
        {currentView === 'canteens' && <p>เลือกโรงอาหารที่คุณต้องการสั่งอาหาร</p>}
        {currentView === 'vendors' && <p>เลือกร้านอาหารที่คุณต้องการ</p>}
        {currentView === 'menus' && <p>เลือกเมนูอาหารที่คุณต้องการสั่ง</p>}
      </div>

      {/* Canteens Grid */}
      {currentView === 'canteens' && (
        <div className="menu-grid">
          {canteens.map((canteen) => (
            <div
              key={canteen._id}
              className="menu-card"
              onClick={() => handleCanteenClick(canteen)}
            >
              <div className="menu-card-image">
                <img 
                  src={canteen.image || 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800'} 
                  alt={canteen.name} 
                  loading="lazy" 
                />
              </div>
              <div className="menu-card-content">
                <h3>{canteen.name}</h3>
                {canteen.nameEn && <p className="subtitle">{canteen.nameEn}</p>}
                <p className="description">{canteen.description}</p>
                <p className="location">📍 {canteen.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendors Grid */}
      {currentView === 'vendors' && (
        <div className="menu-grid">
          {vendors.length === 0 ? (
            <div className="empty-state">
              <h3>ไม่มีร้านอาหาร</h3>
              <p>ยังไม่มีร้านอาหารในโรงอาหารนี้</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div
                key={vendor._id}
                className="menu-card"
                onClick={() => handleVendorClick(vendor)}
              >
                <div className="menu-card-image">
                  <img 
                    src={vendor.logo ? getImageUrl(vendor.logo) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'} 
                    alt={vendor.shopName} 
                    loading="lazy" 
                  />
                </div>
                <div className="menu-card-content">
                  <h3>{vendor.shopName}</h3>
                  {vendor.description && <p className="description">{vendor.description}</p>}
                  <div className="vendor-status">
                    {vendor.isAcceptingOrders ? (
                      <span className="status-open">🟢 เปิดรับคำสั่งซื้อ</span>
                    ) : (
                      <span className="status-closed">🔴 ปิดรับคำสั่งซื้อ</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Menus Grid */}
      {currentView === 'menus' && (
        <div className="menu-grid">
          {menus.length === 0 ? (
            <div className="empty-state">
              <h3>ไม่มีเมนู</h3>
              <p>ร้านนี้ยังไม่มีเมนูอาหาร</p>
            </div>
          ) : (
            menus.map((item) => (
              <div key={item._id} className="menu-card menu-item-card">
                <div className="menu-card-image">
                  <img 
                    src={item.image ? getImageUrl(item.image) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} 
                    alt={item.name} 
                    loading="lazy" 
                  />
                </div>
                <div className="menu-card-content">
                  <h3>{item.name}</h3>
                  {item.description && <p className="description">{item.description}</p>}
                  {item.category && (
                    <span className="menu-category">{item.category}</span>
                  )}
                  <p className="price">฿{item.price}</p>
                  
                  {/* Special Options Checkbox */}
                  <div className="special-options-card">
                    <label className="special-option-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedOptions[item._id]?.['พิเศษ'] || false}
                        onChange={() => handleOptionChange(item._id, 'พิเศษ')}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="checkbox-label">⭐ พิเศษ</span>
                    </label>
                  </div>

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
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NewMenuPage;
