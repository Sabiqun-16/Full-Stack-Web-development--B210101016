import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

const STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { showToast } = useToast();

  const load = () => {
    setLoading(true);

    api
      .get('/admin/orders', {
        params: {
          status: statusFilter || undefined,
          page: page,
          limit: 15
        }
      })
      .then((res) => {
        setOrders(res.data.orders || []);
        setPages(res.data.pages || 1);
      })
      .catch((err) => {
        showToast(
          err.response?.data?.message || 'Could not load orders'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [statusFilter, page]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    try {
      await api.put('/admin/orders/' + id + '/status', {
        status: status
      });

      showToast('Order marked as ' + status);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          'Could not update order status'
      );
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ fontSize: '1rem' }}>All Orders</h3>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    #{order._id.slice(-8).toUpperCase()}
                  </td>

                  <td>
                    {order.user?.name || 'N/A'}
                    <br />
                    <span
                      style={{
                        color: 'var(--gray-mid)',
                        fontSize: '.76rem'
                      }}
                    >
                      {order.user?.email || ''}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>৳{order.totalPrice}</td>

                  <td>
                    <span
                      className={'badge ' + order.orderStatus}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateStatus(
                          order._id,
                          e.target.value
                        )
                      }
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="order-details-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          {Array.from(
            { length: pages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              className={
                pageNumber === page ? 'active' : ''
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="order-details-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-details-header">
              <div>
                <h3>Order Details</h3>

                <p>
                  Order #
                  {selectedOrder._id
                    .slice(-8)
                    .toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                className="order-details-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            {/* CUSTOMER INFORMATION */}
            <div className="order-customer-info">
              <strong>Customer:</strong>{' '}
              {selectedOrder.user?.name || 'N/A'}
              <br />

              <strong>Email:</strong>{' '}
              {selectedOrder.user?.email || 'N/A'}
              <br />

              <strong>Phone:</strong>{' '}
              {selectedOrder.shippingAddress?.phone || 'N/A'}
              <br />

              <strong>Shipping Address:</strong>{' '}
              {selectedOrder.shippingAddress?.addressLine || 'N/A'}
              <br />

              <strong>City:</strong>{' '}
              {selectedOrder.shippingAddress?.city || 'N/A'}
              <br />

              <strong>Postal Code:</strong>{' '}
              {selectedOrder.shippingAddress?.postalCode || 'N/A'}
              <br />

              <strong>Payment Method:</strong>{' '}
              {selectedOrder.paymentMethod === 'COD'
                ? 'Cash on Delivery'
                : selectedOrder.paymentMethod || 'N/A'}
              <br />

              <strong>Order Date:</strong>{' '}
              {new Date(
                selectedOrder.createdAt
              ).toLocaleString()}
              <br />

              <strong>Status:</strong>{' '}
              {selectedOrder.orderStatus}
            </div>

            {/* ORDERED PRODUCTS */}
            <h4 className="order-products-title">
              Ordered Products
            </h4>

            {selectedOrder.orderItems &&
            selectedOrder.orderItems.length > 0 ? (
              <div>
                {selectedOrder.orderItems.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="order-item"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || 'Product'}
                          className="order-item-image"
                        />
                      ) : (
                        <div className="order-item-image order-item-image-empty" />
                      )}

                      <div className="order-item-info">
                        <strong>
                          {item.name || 'Product'}
                        </strong>

                        <div>
                          Quantity: {item.quantity}
                        </div>

                        <div>
                          Unit Price: ৳{item.price}
                        </div>
                      </div>

                      <div className="order-item-price">
                        <strong>
                          ৳
                          {Number(item.price) *
                            Number(item.quantity)}
                        </strong>

                        <div>
                          {item.quantity} × ৳{item.price}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="order-no-products">
                No product details available for this order.
              </div>
            )}

            {/* ORDER SUMMARY */}
            <div className="order-summary">
              <div>
                Items Price: ৳
                {selectedOrder.itemsPrice || 0}
              </div>

              <div>
                Delivery: ৳
                {selectedOrder.deliveryPrice || 0}
              </div>

              {selectedOrder.discountAmount > 0 && (
                <div>
                  Discount: -৳
                  {selectedOrder.discountAmount}
                </div>
              )}

              <h3>
                Total: ৳{selectedOrder.totalPrice}
              </h3>
            </div>

            <div className="order-modal-footer">
              <button
                type="button"
                className="order-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}