import React, { createContext, useState, useContext } from "react";

// Favorites Context 생성
const FavoritesContext = createContext();

// FavoritesProvider 컴포넌트
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 사용자 정의 Hook 생성
export function useFavorites() {
  return useContext(FavoritesContext);
}
