import React, { createContext, useState } from 'react';

export const RefreshContext = createContext({
  refreshCount: 0,
  bumpRefresh: () => {}
});

export function RefreshProvider({ children }) {
  const [refreshCount, setRefreshCount] = useState(0);
  const bumpRefresh = () => setRefreshCount(c => c + 1);

  return (
    <RefreshContext.Provider value={{ refreshCount, bumpRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}
