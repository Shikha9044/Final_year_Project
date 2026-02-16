import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderTracker.css';
import { useContext } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const CANTEEN_COORDS = { lat: 26.9124, lon: 75.7873 }; // example coords; set real ones

const OrderTracker = ({ apiBase, token }) => {
  const store = useContext(StoreContext);
  const base = apiBase || store?.url || '';
  const authToken = token || store?.token;
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [etaMins, setEtaMins] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [error, setError] = useState('');

  // Poll order status
  // Poll order status every 1 second, and expose fetchStatus for instant update
  const fetchStatus = async () => {
    try {
      const resp = await axios.get(`${base}/api/order/${orderId}`, {
        headers: authToken ? { token: authToken } : undefined
      });
      if (resp.data?.success) {
        setOrder(resp.data.order);
        setStatus(resp.data.order.status);
        setError('');
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        setError('Please log in to view your order.');
      } else if (e?.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError('Unable to fetch order status. Retrying...');
      }
    }
  };
  useEffect(() => {
    let timer;
    if (orderId) {
      fetchStatus();
      timer = setInterval(fetchStatus, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [orderId, apiBase]);

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // Compute walking ETA (mins) assuming 5 km/h
  useEffect(() => {
    if (userPos) {
      const km = distanceKm(userPos.lat, userPos.lon, CANTEEN_COORDS.lat, CANTEEN_COORDS.lon);
      const hours = km / 5; // 5 km/h walking
      setEtaMins(Math.ceil(hours * 60));
    }
  }, [userPos]);

  const progress = useMemo(() => {
    const map = { pending: 10, confirmed: 30, preparing: 60, ready: 90, delivered: 100, cancelled: 0 };
    return map[status] ?? 10;
  }, [status]);

  return (
  <div className="tracker-wrap" style={{marginTop: '90px'}}>
      <h2>Track Your Order</h2>

      {order && (
        <div className="info">
          <div><b>Order:</b> {order.orderNumber}</div>
          <div><b>Status:</b> {status}</div>
          {order.tokenNumber && (
            <div><b>Pickup Token:</b> {order.tokenNumber}</div>
          )}
          {order.estimatedDeliveryTime && (
            <div><b>Est. Ready:</b> {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</div>
          )}
          {/* Cancel Order Button */}
          {status !== 'cancelled' && status !== 'delivered' && (
            <button
              style={{marginTop:8, background:'#e74c3c', color:'#fff', border:'none', borderRadius:4, padding:'6px 16px', cursor:'pointer'}}
              onClick={async () => {
                if(window.confirm('Are you sure you want to cancel this order?')) {
                  try {
                    const res = await axios.post(`${base}/api/order/${order._id}/cancel`, {}, { headers: authToken ? { token: authToken } : undefined });
                    if(res.data.success) {
                      setStatus('cancelled');
                      fetchStatus(); // Instantly update status after cancel
                    } else {
                      alert(res.data.message || 'Failed to cancel order');
                    }
                  } catch (err) {
                    alert('Error cancelling order');
                  }
                }
              }}
            >
              Cancel Order
            </button>
          )}
        </div>
      )}

      {/* Vertical Stepper for Order Stages */}
      <div className="vertical-stepper">
        {[
          { label: 'Pending', key: 'pending' },
          { label: 'Confirmed', key: 'confirmed' },
          { label: 'Preparing', key: 'preparing' },
          { label: 'Ready', key: 'ready' },
          { label: 'Delivered', key: 'delivered' },
          { label: 'Cancelled', key: 'cancelled' },
        ].map((stage, idx, arr) => {
          // Only show cancelled if status is cancelled
          if (stage.key === 'cancelled' && status !== 'cancelled') return null;
          // Only show delivered if status is delivered
          if (stage.key === 'delivered' && status !== 'delivered') return null;
          // Hide delivered/cancelled in normal flow
          if ((stage.key === 'delivered' || stage.key === 'cancelled') && status !== stage.key) return null;
          // Mark as active/done
          const stageOrder = ['pending','confirmed','preparing','ready','delivered','cancelled'];
          const currentIdx = stageOrder.indexOf(status);
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <div className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} key={stage.key}>
              <div className="circle">{isDone ? <span>&#10003;</span> : idx+1}</div>
              <div className="label">{stage.label}</div>
              {idx !== arr.length-1 && <div className="step-line" />}
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default OrderTracker;
