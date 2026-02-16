import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../components/Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";



// No subcategory logic for Momos
const subcategoryMap = {};

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Determine if the selected category has subcategories

  const subcategories = subcategoryMap[category] || null;

  // Filter food list by category only
  const filteredList = food_list.filter(item => {
    if (category === 'All') return true;
    return item.category === category;
  });

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-list">
        {filteredList.map((item, index) => (
          <FoodItem
            key={index}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            stock={item.stock}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
