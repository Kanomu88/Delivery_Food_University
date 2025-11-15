import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import './OrdersPage.css';

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.getUserOrders({ status: statusFilter }),
  });

  // Debug
  console.log('Orders data:', data);
  console.log('Orders error:', error);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'รอชำระเงิน',
      confirmed: 'ยืนยันแล้ว',
      preparing: 'กำลังเตรียม',
      ready: 'พร้อมรับ',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก',
    };
    return statusTexts[status] || status;
  };

  if (isLoading) return <Loading />;

  // Try different response structures
  const orders = data?.data?.orders || data?.data || [];

  return (
    <div className="orders-page">
      <div className="container">
        <h1>{t('orders.title')}</h1>

        <div className="orders-filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">ทุกสถานะ</option>
            <option value="pending">รอชำระเงิน</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="preparing">กำลังเตรียม</option>
            <option value="ready">พร้อมรับ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>ยังไม่มีคำสั่งซื้อ</h3>
            <p>เริ่มสั่งอาหารเลย!</p>
            <button onClick={() => navigate('/menu')} className="btn btn-primary">
              ดูเมนูอาหาร
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="order-card"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="order-header">
                  <h3>คำสั่งซื้อ #{order._id.slice(-6)}</h3>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-info">
                  <p><strong>ร้านค้า:</strong> {order.vendor?.name || 'ไม่ระบุ'}</p>
                  <p><strong>รายการ:</strong> {order.items?.length} รายการ</p>
                  <p><strong>ยอดรวม:</strong> ฿{order.totalAmount?.toFixed(2)}</p>
                  <p><strong>วันที่สั่ง:</strong> {new Date(order.createdAt).toLocaleString('th-TH')}</p>
                  {order.pickupTime && (
                    <p><strong>เวลารับอาหาร:</strong> {new Date(order.pickupTime).toLocaleString('th-TH')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
