"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Menu.module.css";
import { Search } from "lucide-react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface MenuProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

const CATEGORIES = ["All", "Pizza", "Burger", "Salad", "Wings", "Dessert"];

export default function Menu({ items, onAddToCart }: MenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!items || items.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>🍽️ Menu is loading...</p>
        <span>Please make sure the backend server is running.</span>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      item.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.description.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuTop}>
        <h2 className={styles.menuTitle}>Today's Menu</h2>

        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${selectedCategory === cat ? styles.pillActive : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.noResults}>
          <p>No dishes found</p>
          <span>Try a different search or category</span>
          <button className={styles.clearBtn} onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>${item.price.toFixed(2)}</span>
                  <button className={styles.addBtn} onClick={() => onAddToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
