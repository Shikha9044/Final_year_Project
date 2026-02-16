import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './List.css';


const List = ({url}) => {
  
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch the food list.");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error("An error occurred while fetching the food list.");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        await fetchList();
        toast.success(response.data.message);
      } else {
        toast.error("Failed to remove the food item.");
      }
    } catch (error) {
      console.error("Error removing food item:", error);
      toast.error("An error occurred while removing the food item.");
    }
  };

  const toggleTodaysMenu = async (foodId) => {
    try {
      console.log('Attempting to toggle menu for food ID:', foodId);
      console.log('Making request to:', `${url}/api/food/toggle-todays-menu`);
      
      const response = await axios.post(`${url}/api/food/toggle-todays-menu`, { id: foodId });
      console.log('Response received:', response);
      
      if (response.data.success) {
        await fetchList();
        toast.success(response.data.message);
      } else {
        toast.error("Failed to update today's menu status.");
      }
    } catch (error) {
      console.error("Error updating today's menu status:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        const errorData = error.response.data;
        if (errorData.sampleIds) {
          toast.error(`Food item not found. Sample IDs in database: ${errorData.sampleIds.map(f => f.name).join(', ')}`);
        } else {
          toast.error("Food item not found. Please refresh the page.");
        }
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid request. Please check the food ID.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please check if the backend is running.");
      } else if (error.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check if the backend server is running.");
      } else {
        toast.error("An error occurred while updating today's menu status.");
      }
    }
  };

  const initializeDatabase = async () => {
    try {
      console.log('Initializing database...');
      const response = await axios.get(`${url}/api/food/initialize`);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(); // Refresh the list
      } else {
        toast.error("Failed to initialize database.");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      toast.error("Failed to initialize database. Please check backend connection.");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Foods List</p>
      
      {/* Initialize Database Button */}
      <div className="initialize-section">
        <button 
          onClick={initializeDatabase}
          className="initialize-btn"
          title="Click this if you're getting 'Food item not found' errors"
        >
          🔧 Initialize Today's Menu Database
        </button>
        <p className="initialize-help">
          Click this button if you're getting "Food item not found" errors. 
          This will add the required fields to existing food items.
        </p>
      </div>
      
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b>Today's Menu</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>₹{item.price}</p>
            <p>
              <input
                type="number"
                min={0}
                value={item.stock}
                style={{ width: 60, border: item.stock <= (item.lowStockThreshold || 5) ? '2px solid orange' : undefined }}
                onChange={async (e) => {
                  const newStock = parseInt(e.target.value, 10);
                  try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post(
                      `${url}/api/food/update-stock`,
                      { id: item._id, stock: newStock },
                      token ? { headers: { token } } : {}
                    );
                    if (res.data.success) {
                      toast.success('Stock updated');
                      fetchList();
                    } else {
                      toast.error('Failed to update stock');
                    }
                  } catch {
                    toast.error('Error updating stock');
                  }
                }}
              />
              {item.stock <= (item.lowStockThreshold || 5) && (
                <span style={{ color: 'orange', fontWeight: 600, marginLeft: 6 }}>
                  {item.stock === 0 ? 'Out of stock!' : 'Low stock!'}
                </span>
              )}
            </p>
            <p>
              <button 
                className={`todays-menu-toggle ${item.todaysMenu ? 'active' : 'inactive'}`}
                onClick={() => toggleTodaysMenu(item._id)}
              >
                {item.todaysMenu ? '✓ In Menu' : 'Add to Menu'}
              </button>
            </p>
            <p className="cursor" onClick={() => removeFood(item._id)}>X</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;