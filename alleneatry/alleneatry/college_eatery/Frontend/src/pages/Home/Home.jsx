import React, { useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import MorningBrunch from "../../components/MorningBrunch/MorningBrunch";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";

const Home = ({ setShowTodaysMenu }) => {
  const [category, setCategory] = useState("All");

  return (
    <div style={{ marginTop: 80 }}>
      <Header />
      <MorningBrunch />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <AppDownload/>
    </div>
  );
};

export default Home;