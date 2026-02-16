import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { collapseToast, toast, ToastContainer } from 'react-toastify';


const Add = ({url}) => {
  
  
  const [image,setImage]=useState(false);
  const [data,setData]= useState({
  
  name:"",
  description:"",
  price:"",
  category:"Salad",
  todaysMenu: false
  })

  const onChangeHandler=(event)=>{
  const name = event.target.name;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  setData(data=>({...data,[name]:value}))
  }
  


const onSubmitHandler = async (event) => {
  event.preventDefault();
  if (!image) {
    toast.error("Please select an image.");
    return;
  }
  try {
    const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", Number(data.price));
  formData.append("category", data.category);
  formData.append("todaysMenu", data.todaysMenu);
  formData.append("image", image);
    // Log formData for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]);
    }
    const response = await axios.post(`${url}/api/food/add`, formData);
    if (response.data.success) {
      setData({
  name: "",
  price: "",
  category: "Salad",
  todaysMenu: false

      });
      setImage(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message || "Unknown error");
    }
  } catch (err) {
    toast.error("Request failed. Check backend and network.");
    console.error(err);
  }
};

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image?URL.createObjectURL(image):assets.upload_area} alt="" />
          </label>
          <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name}  type="text" name='name' placeholder='Type here' />
        </div>
  {/* Product description removed as requested */}

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category">
              <option value="Momos">Momos</option>
              <option value="Rolls">Rolls</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Samosa">Samosa</option>
              <option value="Idli">Idli</option>
              <option value="Dosa">Dosa</option>
              <option value="Chips">Chips</option>
              <option value="Biscuits">Biscuits</option>
              <option value="Colddrinks">Colddrinks</option>
              <option value="Chai">Chai</option>
              <option value="Coffee">Coffee</option>
              <option value="Ice Cream">Ice Cream</option>
              <option value="Chole Bhature">Chole Bhature</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='₹20'/>
          </div>
        </div>
        
        <div className="add-todays-menu flex-col">
          <label className="todays-menu-checkbox">
            <input 
              type="checkbox" 
              name="todaysMenu" 
              checked={data.todaysMenu}
              onChange={onChangeHandler}
            />
            <span>Add to Today's Menu</span>
          </label>
        </div>
        
        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
}

export default Add;
