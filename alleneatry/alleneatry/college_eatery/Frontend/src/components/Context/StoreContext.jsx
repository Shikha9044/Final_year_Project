import axios from "axios";
import { createContext, useEffect, useState } from "react";
export const StoreContext=createContext(null);

const StoreContextProvider=(props)=>{
const [cartItems,setCartItems]=useState({});
const [loading, setLoading] = useState(true);

const url = "http://localhost:4000";
const [token,setToken]= useState("");
const [food_list,setFoodList] = useState([]);
const [user, setUser] = useState(null);

const addToCart= async (itemId)=>{
    if (!cartItems[itemId]) {
        setCartItems((prev)=>({...prev,[itemId]:1}))
    }
    else{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
    }

    if (token) {
        try {
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}});
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    }
}

const removeFromCart=async (itemId)=>{
    setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
    if (token) {
        try {
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    }
}

const cleanupInvalidCartItems = () => {
    if (food_list.length === 0) return;
    
    const validItemIds = food_list.map(item => item._id);
    const cleanedCartItems = {};
    
    for (const itemId in cartItems) {
        if (validItemIds.includes(itemId) && cartItems[itemId] > 0) {
            cleanedCartItems[itemId] = cartItems[itemId];
        }
    }
    
    if (JSON.stringify(cleanedCartItems) !== JSON.stringify(cartItems)) {
        console.log('Cleaning up invalid cart items');
        setCartItems(cleanedCartItems);
    }
};

const getTotalCartAmount=()=>{
    // Early return if food_list is not ready
    if (!food_list || food_list.length === 0) {
        console.log('Food list not ready yet, returning 0');
        return 0;
    }

    // Early return if cartItems is not ready
    if (!cartItems || Object.keys(cartItems).length === 0) {
        console.log('Cart items not ready yet, returning 0');
        return 0;
    }

    let totalAmount=0;
    for (const item in cartItems) {
        if (cartItems[item]>0) {
            let itemInfo = food_list.find((product)=>product._id===item); 
            // Add null check to prevent error when itemInfo is undefined
            if (itemInfo && itemInfo.price) {
                totalAmount+=itemInfo.price * cartItems[item];
            } else {
                console.warn(`Item with ID ${item} not found in food_list or missing price`);
            }
        }
    }
    return totalAmount;
}

// Completely safe version that can be called from anywhere
const safeGetTotalCartAmount = () => {
    try {
        return getTotalCartAmount();
    } catch (error) {
        console.error('Error in getTotalCartAmount:', error);
        return 0;
    }
};

const fetchFoodList= async ()=>{
    try {
        const response = await axios.get(url+"/api/food/list");
        setFoodList(response.data.data)
    } catch (error) {
        console.error("Error fetching food list:", error);
        setFoodList([]);
    }
}

const loadCartData = async (token)=>{
    try {
        const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    } catch (error) {
        console.error("Error loading cart data:", error);
        setCartItems({});
    }
}

const fetchUserProfile = async (token) => {
    try {
        const response = await axios.get(url + "/api/user/profile", {
            headers: { token }
        });
        if (response.data.success) {
            setUser(response.data.user);
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
        // If token is invalid, clear it
        if (error.response?.status === 401) {
            setToken("");
            localStorage.removeItem("token");
        }
    }
}

useEffect(()=>{
    async function loadData(){
        try {
            setLoading(true);
            // First load food list, then cart data
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                // Only load cart data after food list is loaded
                await loadCartData(storedToken);
                await fetchUserProfile(storedToken);
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
},[])

// Clean up invalid cart items when food list changes
useEffect(() => {
    if (food_list.length > 0) {
        cleanupInvalidCartItems();
    }
}, [food_list]);

const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    safeGetTotalCartAmount,
    fetchFoodList,
    url,
    token,
    setToken,
    user,
    setUser,
    loading
}

return (
    <StoreContext.Provider value={contextValue}>
        {props.children}
    </StoreContext.Provider>
)
}

export default StoreContextProvider;