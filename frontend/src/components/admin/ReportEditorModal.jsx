import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import jsPDF from 'jspdf';
import './ReportEditorModal.css';

const ReportEditorModal = ({ request, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(request.reportData || {});
  const [editMode, setEditMode] = useState(false);

  const formatCurrency = (amount) => {
    return `฿${amount?.toLocaleString() || 0}`;
  };

  const handleUpdateField = (path, value) => {
    const newData = { ...reportData };
    const keys = path.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setReportData(newData);
  };

  const handleAddMenuItem = () => {
    const newMenu = {
      name: 'เมนูใหม่',
      quantity: 0,
      revenue: 0,
    };
    
    setReportData({
      ...reportData,
      popularMenus: [...(reportData.popularMenus || []), newMenu],
    });
  };

  const handleRemoveMenuItem = (index) => {
    const newMenus = reportData.popularMenus.filter((_, i) => i !== index);
    setReportData({
      ...reportData,
      popularMenus: newMenus,
    });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/update/${request._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reportData }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showNotification('บันทึกการแก้ไขสำเร็จ', 'success');
        setEditMode(false);
        onSuccess();
      } else {
        throw new Error(data.error?.message || 'Failed to update report');
      }
    } catch (error) {
      console.error('Update report error:', error);
      showNotification('ไม่สามารถบันทึกการแก้ไขได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add Thai font support (basic)
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(20);
      doc.text('Sales Report', 105, 20, { align: 'center' });
      
      // Vendor info
      doc.setFontSize(12);
      doc.text(`Vendor: ${reportData.vendor?.name || 'N/A'}`, 20, 40);
      doc.text(`Location: ${reportData.vendor?.location || 'N/A'}`, 20, 50);
      
      // Period
      const startDate = new Date(reportData.period?.startDate).toLocaleDateString('en-US');
      const endDate = new Date(reportData.period?.endDate).toLocaleDateString('en-US');
      doc.text(`Period: ${startDate} - ${endDate}`, 20, 60);
      
      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 75);
      doc.setFontSize(12);
      doc.text(`Total Revenue: ${formatCurrency(reportData.summary?.totalRevenue)}`, 20, 85);
      doc.text(`Total Orders: ${reportData.summary?.totalOrders || 0}`, 20, 95);
      doc.text(`Average Order: ${formatCurrency(reportData.summary?.averageOrderValue)}`, 20, 105);
      
      // Popular Menus
      doc.setFontSize(14);
      doc.text('Top Selling Items', 20, 120);
      doc.setFontSize(10);
      
      let yPos = 130;
      (reportData.popularMenus || []).forEach((menu, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${index + 1}. ${menu.name} - ${menu.quantity} pcs - ${formatCurrency(menu.revenue)}`,
          20,
          yPos
        );
        yPos += 10;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.text(
        `Generated: ${new Date().toLocaleString('en-US')}`,
        105,
        280,
        { align: 'center' }
      );
      
      doc.save(`report-${reportData.vendor?.name || 'vendor'}-${Date.now()}.pdf`);
      showNotification('ส่งออก PDF สำเร็จ', 'success');
    } catch (error) {
      console.error('Export PDF error:', error);
      showNotification('ไม่สามารถส่งออก PDF ได้', 'error');
    }
  };

  const handleExportWord = () => {
    try {
      let content = `SALES REPORT\n\n`;
      content += `Vendor: ${reportData.vendor?.name || 'N/A'}\n`;
      content += `Location: ${reportData.vendor?.location || 'N/A'}\n\n`;
      
      const startDate = new Date(reportData.period?.startDate).toLocaleDateString('th-TH');
      const endDate = new Date(reportData.period?.endDate).toLocaleDateString('th-TH');
      content += `Period: ${startDate} - ${endDate}\n\n`;
      
      content += `SUMMARY\n`;
      content += `Total Revenue: ${formatCurrency(reportData.summary?.totalRevenue)}\n`;
      content += `Total Orders: ${reportData.summary?.totalOrders || 0}\n`;
      content += `Average Order: ${formatCurrency(reportData.summary?.averageOrderValue)}\n\n`;
      
      content += `TOP SELLING ITEMS\n`;
      (reportData.popularMenus || []).forEach((menu, index) => {
        content += `${index + 1}. ${menu.name} - ${menu.quantity} pcs - ${formatCurrency(menu.revenue)}\n`;
      });
      
      content += `\nGenerated: ${new Date().toLocaleString('th-TH')}`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportData.vendor?.name || 'vendor'}-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotification('ส่งออกไฟล์สำเร็จ', 'success');
    } catch (error) {
      console.error('Export Word error:', error);
      showNotification('ไม่สามารถส่งออกไฟล์ได้', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ {editMode ? 'แก้ไขรายงาน' : 'ดูรายงาน'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="report-preview">
            <div className="report-section">
              <h3>ข้อมูลร้านค้า</h3>
              <p><strong>ชื่อร้าน:</strong> {reportData.vendor?.name}</p>
              <p><strong>สถานที่:</strong> {reportData.vendor?.location}</p>
            </div>

            <div className="report-section">
              <h3>ช่วงเวลา</h3>
              <p>
                {new Date(reportData.period?.startDate).toLocaleDateString('th-TH')} -{' '}
                {new Date(reportData.period?.endDate).toLocaleDateString('th-TH')}
              </p>
            </div>

            <div className="report-section">
              <h3>สรุปยอดขาย</h3>
              {editMode ? (
                <div className="edit-summary">
                  <div className="edit-field">
                    <label>รายได้รวม</label>
                    <input
                      type="number"
                      value={reportData.summary?.totalRevenue || 0}
                      onChange={(e) =>
                        handleUpdateField('summary.totalRevenue', parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="edit-field">
                    <label>จำนวนออเดอร์</label>
                    <input
                      type="number"
                      value={reportData.summary?.totalOrders || 0}
                      onChange={(e) =>
                        handleUpdateField('summary.totalOrders', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">รายได้รวม</span>
                    <span className="summary-value">
                      {formatCurrency(reportData.summary?.totalRevenue)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">จำนวนออเดอร์</span>
                    <span className="summary-value">{reportData.summary?.totalOrders}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">ค่าเฉลี่ยต่อออเดอร์</span>
                    <span className="summary-value">
                      {formatCurrency(reportData.summary?.averageOrderValue)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="report-section">
              <div className="section-header">
                <h3>เมนูขายดี</h3>
                {editMode && (
                  <button className="btn-add-menu" onClick={handleAddMenuItem}>
                    ➕ เพิ่มเมนู
                  </button>
                )}
              </div>
              <div className="popular-menus-list">
                {(reportData.popularMenus || []).map((menu, index) => (
                  <div key={index} className="menu-item">
                    {editMode ? (
                      <>
                        <span className="menu-rank">#{index + 1}</span>
                        <input
                          type="text"
                          value={menu.name}
                          onChange={(e) => {
                            const newMenus = [...reportData.popularMenus];
                            newMenus[index].name = e.target.value;
                            setReportData({ ...reportData, popularMenus: newMenus });
                          }}
                          className="edit-menu-name"
                        />
                        <input
                          type="number"
                          value={menu.quantity}
                          onChange={(e) => {
                            const newMenus = [...reportData.popularMenus];
                            newMenus[index].quantity = parseInt(e.target.value);
                            setReportData({ ...reportData, popularMenus: newMenus });
                          }}
                          className="edit-menu-quantity"
                        />
                        <input
                          type="number"
                          value={menu.revenue}
                          onChange={(e) => {
                            const newMenus = [...reportData.popularMenus];
                            newMenus[index].revenue = parseFloat(e.target.value);
                            setReportData({ ...reportData, popularMenus: newMenus });
                          }}
                          className="edit-menu-revenue"
                        />
                        <button
                          className="btn-remove-menu"
                          onClick={() => handleRemoveMenuItem(index)}
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="menu-rank">#{index + 1}</span>
                        <span className="menu-name">{menu.name}</span>
                        <span className="menu-quantity">{menu.quantity} ชิ้น</span>
                        <span className="menu-revenue">{formatCurrency(menu.revenue)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            {!editMode && (
              <>
                <button className="btn-export" onClick={handleExportPDF}>
                  📄 ส่งออก PDF
                </button>
                <button className="btn-export" onClick={handleExportWord}>
                  📝 ส่งออก Text
                </button>
              </>
            )}
          </div>
          <div className="footer-right">
            {editMode ? (
              <>
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  ยกเลิก
                </button>
                <button
                  className="btn-save"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
                </button>
              </>
            ) : (
              <button className="btn-edit-mode" onClick={() => setEditMode(true)}>
                ✏️ แก้ไข
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportEditorModal;
