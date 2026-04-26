import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./AppDownload.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../Context/StoreContext";

const AppDownload = () => {
  const { token, url, food_list, cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const trackRef = useRef(null);

  const fallbackItems = useMemo(() => {
    return (food_list || []).slice(0, 6).map((item, index) => ({
      _id: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      matchScore: 62 + (index * 4),
      reason: "Popular pick for you"
    }));
  }, [food_list]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) {
        setRecommendations([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/order/recommendations?limit=8`, {
          headers: { token }
        });

        if (response.data?.success) {
          setRecommendations(response.data.recommendations || []);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token, url]);

  const itemsToShow = token && recommendations.length > 0 ? recommendations : fallbackItems;

  const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${url}/images/${image}`;
  };

  const scrollCards = (direction) => {
    if (!trackRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="ai-recommendation" id="app-download">
      <div className="ai-recommendation-header">
        <h3>Based on Your Favorites</h3>
        <span className={`ai-recommendation-subtitle ${!token ? "ai-recommendation-subtitle-login" : ""}`}>
          {token
            ? "Curated from your recent orders"
            : "Sign in to unlock personalized recommendations"}
        </span>
      </div>

      {loading ? (
        <div className="ai-recommendation-loading">Finding your best matches...</div>
      ) : (
        <div className="ai-recommendation-carousel">
          <button
            type="button"
            className="ai-scroll-btn"
            aria-label="Scroll recommendations left"
            onClick={() => scrollCards("left")}
          >
            &#8249;
          </button>
          <div className="ai-recommendation-track" ref={trackRef}>
            {itemsToShow.map((item) => {
              const qty = cartItems?.[item._id] || 0;

              return (
                <article className="ai-card" key={item._id}>
                  <div className="ai-card-image-wrap">
                    <img src={getImagePath(item.image)} alt={item.name} className="ai-card-image" />
                    <span className="ai-score">{Math.min(item.matchScore || 60, 99)}% Match</span>
                  </div>
                  <div className="ai-card-content">
                    <p className="ai-card-name">{item.name}</p>
                    <p className="ai-card-price">₹{item.price}</p>
                    <p className="ai-card-reason">{item.reason || "Picked for your taste"}</p>

                    {qty > 0 ? (
                      <div className="ai-card-counter">
                        <img onClick={() => removeFromCart(item._id)} src={assets.remove_icon_red} alt="remove" />
                        <span>{qty}</span>
                        <img onClick={() => addToCart(item._id)} src={assets.add_icon_green} alt="add" />
                      </div>
                    ) : (
                      <button className="ai-card-add" onClick={() => addToCart(item._id)}>
                        <img src={assets.add_icon_white} alt="add" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <button
            type="button"
            className="ai-scroll-btn"
            aria-label="Scroll recommendations right"
            onClick={() => scrollCards("right")}
          >
            &#8250;
          </button>
        </div>
      )}

      <div className="app-download-platforms">
        <img src={assets.play_store} alt="play_store" />
        <img src={assets.app_store} alt="app_store" />
      </div>
    </section>
  );
};

export default AppDownload;
