
import React from 'react';
import './ExploreMenu.css';
import {menu_list} from '../../assets/assets';

const ExploreMenu = ({category,setCategory}) => {
  return (
    <div>
       <div className="explore-menu" id="explore-menu">
        <div className="explore-header">
          <h1>Find Your Perfect Bite</h1>
          <p className="explore-menu-text">Enjoy hygienic, tasty, and budget-friendly food every day.</p>
        </div>
        <div className="explore-menu-list">
            {menu_list.map((item,index)=>{
                return(
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                        <img
                          className={category === item.menu_name?"active":""}
                          src={item.menu_url || item.menu_image}
                          alt={item.menu_name}
                          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=item.menu_image; }}
                        />
                        <p>{item.menu_name}</p>
                    </div>
                )


            }
            )
            }
            

        </div>
       </div>
    </div>

  );
};

export default ExploreMenu;
