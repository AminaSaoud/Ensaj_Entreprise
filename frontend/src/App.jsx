import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.jsx";
import './index.css';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;