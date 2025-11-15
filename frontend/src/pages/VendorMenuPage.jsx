import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '../services/menuService';
import { useNotification } from '../contexts/NotificationContext';
import { getImageUrl } from '../utils/imageHelper';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import './VendorMenuPage.css';

const VendorMenuPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    category: '',
    allergenInfo: '',
    image: '',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuService.getVendorMenus();
      console.log('Vendor menus response:', response);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menus:', error);
      showNotification(error.response?.data?.error?.message || 'ไม่สามารถโหลดเมนูได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        nameEn: item.nameEn || '',
        description: item.description || '',
        descriptionEn: item.descriptionEn || '',
        price: item.price || '',
        category: item.category || '',
        allergenInfo: item.allergenInfo || '',
        image: item.image || '',
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      });
      setImagePreview(item.image || '');
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: '',
        category: '',
        allergenInfo: '',
        image: '',
        isAvailable: true,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification(t('vendor.menu.invalidImageType'), 'error');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t('vendor.menu.imageTooLarge'), 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price) {
      showNotification(t('vendor.menu.validationError'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        try {
          const uploadResult = await menuService.uploadMenuImage(imageFile);
          imageUrl = uploadResult.data.imageUrl;
        } catch (uploadError) {
          showNotification(t('vendor.menu.imageUploadError'), 'error');
          setSubmitting(false);
          return;
        }
      }

      const menuData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: imageUrl,
        isAvailable: formData.isAvailable,
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem._id, menuData);
        showNotification(t('vendor.menu.updateSuccess'), 'success');
      } else {
        await menuService.createMenuItem(menuData);
        showNotification(t('vendor.menu.createSuccess'), 'success');
      }

      handleCloseModal();
      fetchMenuItems();
    } catch (error) {
      showNotification(
        editingItem ? t('vendor.menu.updateError') : t('vendor.menu.createError'),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuService.updateMenuItem(item._id, {
        isAvailable: !item.isAvailable,
      });
      setMenuItems(prev =>
        prev.map(m => (m._id === item._id ? { ...m, isAvailable: !m.isAvailable } : m))
      );
      showNotification(t('vendor.menu.updateSuccess'), 'success');
    } catch (error) {
      showNotification(t('vendor.menu.updateError'), 'error');
    }
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await menuService.deleteMenuItem(deletingItem._id);
      showNotification('ลบเมนูสำเร็จ', 'success');
      fetchMenuItems();
    } catch (error) {
      showNotification('ไม่สามารถลบเมนูได้', 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="vendor-menu-page">
      <div className="menu-header">
        <h1>{t('vendor.menu.title')}</h1>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <span className="icon">➕</span>
          {t('vendor.menu.addNew')}
        </button>
      </div>

      {menuItems.length === 0 ? (
        <div className="no-items">
          <div className="no-items-icon">🍽️</div>
          <h3>{t('vendor.menu.noItems')}</h3>
          <p>{t('vendor.menu.noItemsMessage')}</p>
        </div>
      ) : (
        <div className="menu-table-container">
          <table className="menu-table">
            <thead>
              <tr>
                <th>{t('vendor.menu.image')}</th>
                <th>{t('vendor.menu.name')}</th>
                <th>{t('vendor.menu.price')}</th>
                <th>{t('vendor.menu.category')}</th>
                <th>{t('vendor.menu.available')}</th>
                <th>{t('vendor.menu.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="menu-image">
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.name} />
                      ) : (
                        <div className="no-image">🍽️</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="menu-name">
                      <div className="name-primary">{item.name}</div>
                      {item.nameEn && <div className="name-secondary">{item.nameEn}</div>}
                    </div>
                  </td>
                  <td className="price">฿{item.price.toLocaleString()}</td>
                  <td>{item.category || '-'}</td>
                  <td>
                    <button
                      className={`availability-toggle ${item.isAvailable ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggleAvailability(item)}
                    >
                      {item.isAvailable ? t('vendor.menu.available') : t('vendor.menu.unavailable')}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleOpenModal(item)}
                        title={t('vendor.menu.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item)}
                        title={t('vendor.menu.delete')}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingItem ? t('vendor.menu.edit') : t('vendor.menu.addNew')}>
        <form onSubmit={handleSubmit} className="menu-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('vendor.menu.name')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nameEn">{t('vendor.menu.nameEn')}</label>
              <input
                type="text"
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">{t('vendor.menu.price')} *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">{t('vendor.menu.category')}</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('vendor.menu.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descriptionEn">{t('vendor.menu.descriptionEn')}</label>
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              value={formData.descriptionEn}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="allergenInfo">{t('vendor.menu.allergenInfo')}</label>
            <input
              type="text"
              id="allergenInfo"
              name="allergenInfo"
              value={formData.allergenInfo}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageFile">{t('vendor.menu.image')}</label>
            <input
              type="file"
              id="imageFile"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="file-input"
            />
            <small className="form-hint">{t('vendor.menu.imageHint')}</small>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
              />
              <span>{t('vendor.menu.available')}</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCloseModal}>
              {t('vendor.menu.cancel')}
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? t('common.loading') : t('vendor.menu.save')}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingItem(null);
        }}
        onConfirm={confirmDelete}
        title="ยืนยันการลบเมนู"
        message="คุณแน่ใจหรือไม่ที่จะลบเมนูนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        itemName={deletingItem?.name}
      />
    </div>
  );
};

export default VendorMenuPage;
