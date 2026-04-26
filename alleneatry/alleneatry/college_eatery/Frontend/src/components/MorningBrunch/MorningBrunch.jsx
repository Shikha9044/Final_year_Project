import React, { useContext, useEffect, useMemo, useRef } from "react";
import "./MorningBrunch.css";
import { StoreContext } from "../Context/StoreContext";
import { assets } from "../../assets/assets";
import vadaPav from "../../assets/Vada Pav.jpg";
import maskaPav from "../../assets/Maska Pav.jpg";
import moongDalCheela from "../../assets/Moogdalcheela.jpg";
import garlicBread from "../../assets/garlic bread.jpg";
import daliya from "../../assets/Daliya.jpg";
import poha from "../../assets/Poha with  tea.png";

const brunchItems = [
  { name: "Vada Pav", image: vadaPav, aliases: ["vadapav", "vadapao", "batatapav"] },
  { name: "Maska Pav", image: maskaPav, aliases: ["maskapav", "bunmaska", "bunmaska"] },
  { name: "Moong Dal Cheela", image: moongDalCheela, aliases: ["moongdalcheela", "moongdalchilla", "moongdalchila"] },
  { name: "Garlic Bread", image: garlicBread, aliases: ["garlicbread"] },
  { name: "Dalia", image: daliya, aliases: ["daliya", "dalia"] },
  { name: "Poha", image: poha, aliases: ["poha", "kanda poha", "kandapoha"] }
];

const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

const findMatchingFood = (item, foodList) => {
  if (!foodList || foodList.length === 0) return null;

  const targets = [item.name, ...(item.aliases || [])].map(normalizeName);
  const exactMatch = foodList.find((food) => {
    const foodName = normalizeName(food.name || "");
    return targets.includes(foodName);
  });

  if (exactMatch) return exactMatch;

  return (
    foodList.find((food) => {
      const foodName = normalizeName(food.name || "");
      return targets.some((target) => foodName.includes(target) || target.includes(foodName));
    }) || null
  );
};

const MorningBrunch = () => {
  const { food_list, cartItems, addToCart, removeFromCart, fetchFoodList } = useContext(StoreContext);

  const trackRef = useRef(null);
  const pauseAutoScrollRef = useRef(false);

  const brunchCategoryFoods = useMemo(
    () => (food_list || []).filter((food) => normalizeName(food.category || "") === "morningbrunch"),
    [food_list]
  );

  const brunchItemsWithFood = useMemo(
    () => {
      const usedIds = new Set();

      return brunchItems.map((item) => {
        let matchedFood = findMatchingFood(item, food_list);

        if (!matchedFood) {
          matchedFood = brunchCategoryFoods.find((food) => !usedIds.has(food._id)) || null;
        }

        if (matchedFood?._id) {
          usedIds.add(matchedFood._id);
        }

        return { ...item, food: matchedFood };
      });
    },
    [food_list, brunchCategoryFoods]
  );

  useEffect(() => {
    fetchFoodList();
  }, [fetchFoodList]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const autoScroll = () => {
      if (pauseAutoScrollRef.current) return;

      const firstCard = track.querySelector(".morning-brunch-card");
      const cardStep = (firstCard?.clientWidth || 220) + 14;
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (maxScroll <= 0) return;

      if (track.scrollLeft + cardStep >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: cardStep, behavior: "smooth" });
      }
    };

    const intervalId = setInterval(autoScroll, 2400);
    return () => clearInterval(intervalId);
  }, [brunchItemsWithFood.length]);

  return (
    <section className="morning-brunch" id="morning-brunch">
      <div className="morning-brunch-header">
        <h2>
          Morning Brunch
          <span className="morning-brunch-star-badge">NEW</span>
        </h2>
        <p>Start your day with healthy breakfast</p>
      </div>

      <div
        className="morning-brunch-track"
        role="list"
        aria-label="Morning brunch items"
        ref={trackRef}
        onMouseEnter={() => {
          pauseAutoScrollRef.current = true;
        }}
        onMouseLeave={() => {
          pauseAutoScrollRef.current = false;
        }}
        onTouchStart={() => {
          pauseAutoScrollRef.current = true;
        }}
        onTouchEnd={() => {
          pauseAutoScrollRef.current = false;
        }}
      >
        {brunchItemsWithFood.map((item) => {
          const matchedFood = item.food;
          const itemId = matchedFood?._id;
          const hasCartItem = itemId && cartItems && cartItems[itemId];

          return (
            <article className="morning-brunch-card" role="listitem" key={item.name}>
              <img src={item.image} alt={item.name} className="morning-brunch-image" />
              <div className="morning-brunch-name">{item.name}</div>
              {matchedFood ? <div className="morning-brunch-price">₹{matchedFood.price}</div> : null}

              <div className="morning-brunch-actions">
                {itemId ? (
                  !hasCartItem ? (
                    <img
                      className="morning-brunch-add"
                      onClick={() => addToCart(itemId)}
                      src={assets.add_icon_green}
                      alt="Add to cart"
                    />
                  ) : (
                    <div className="morning-brunch-counter">
                      <img
                        onClick={() => removeFromCart(itemId)}
                        src={assets.remove_icon_red}
                        alt="Remove from cart"
                      />
                      <p>{cartItems[itemId]}</p>
                      <img
                        onClick={() => addToCart(itemId)}
                        src={assets.add_icon_green}
                        alt="Add to cart"
                      />
                    </div>
                  )
                ) : (
                  <button className="morning-brunch-order-btn" type="button">Syncing...</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default MorningBrunch;
