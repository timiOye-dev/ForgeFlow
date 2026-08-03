import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './app/providers/AppProvider';
import { AppRouter } from './app/router/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
