import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="delete-modal-title">{title || 'ยืนยันการลบ'}</h2>
        
        {itemName && (
          <div className="delete-modal-item-name">
            <strong>{itemName}</strong>
          </div>
        )}
        
        <p className="delete-modal-message">
          {message || 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้'}
        </p>
        
        <div className="delete-modal-actions">
          <button 
            className="delete-modal-btn delete-modal-btn-cancel" 
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button 
            className="delete-modal-btn delete-modal-btn-delete" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
