import { createContext, useContext, useState } from 'react';
import { INITIAL_ACTIVITIES } from '../../mocks/initialData';

const ActivityContext = createContext(null);

export const ActivityProvider = ({ children }) => {
  const [activities] = useState(INITIAL_ACTIVITIES);

  return (
    <ActivityContext.Provider value={{ activities }}>
      {children}
    </ActivityContext.Provider>
  );
};

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}