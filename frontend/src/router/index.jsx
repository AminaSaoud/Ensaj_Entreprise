import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Layout";
import LayoutNew from "../layouts/LayoutNew";

import Home from "../pages/Home";

import DashboardAdmin from "../pages/Admin/DashboardAdmin";
import NotFound from "../pages/NotFound";

import Compte from "../pages/Admin-Adherent/Compte";
import Events from "../pages/Adherent/Events";
import Users from "../pages/Admin/Users";
import Codes from "../pages/Admin/Codes";
import ProtectedRoute from "../components/ProtectedRoute";
import AjouterEvents from "../pages/Admin/AjouterEvents";
import DashboardUser from "../pages/Adherent/DashboardUser";
import ConsulterEvents from "../pages/Admin/ConsulterEvents";
import AuthPage from "../pages/AuthPage";
import QaPage from '../pages/QaPage';

export const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <Home/>
            },
            {
                path: '/login',
                element: <AuthPage/>
            },

            {
                path: '/QA',
                element: <QaPage/>
            },
            {
                path: '*',
                element: <NotFound/>
            },
        ]
    },

    {
        element: <LayoutNew />,
        children: [
          // Routes adhérent
          { 
            path: '/adherent/compte', 
            element: <ProtectedRoute requiredRole="USER"><Compte /></ProtectedRoute> 
          },
          { 
            path: '/adherent/events', 
            element: <ProtectedRoute requiredRole="USER"><Events /></ProtectedRoute> 
          },
          { 
            path: '/adherent/dashboard', 
            element: <ProtectedRoute requiredRole="USER"><DashboardUser /></ProtectedRoute> 
          },
          
          // Routes admin
          { 
            path: '/admin/compte', 
            element: <ProtectedRoute requiredRole="ADMIN"><Compte /></ProtectedRoute> 
          },
          { 
            path: '/admin/events', 
            element: <ProtectedRoute requiredRole="ADMIN"><AjouterEvents /></ProtectedRoute> 
          },
          { 
            path: '/admin/events/consult', 
            element: <ProtectedRoute requiredRole="ADMIN"><ConsulterEvents /></ProtectedRoute> 
          },
          { 
            path: '/admin/dashboard', 
            element: <ProtectedRoute requiredRole="ADMIN"><DashboardAdmin /></ProtectedRoute> 
          },
          {
            path: '/admin/users', 
            element: <ProtectedRoute requiredRole="ADMIN"><Users /></ProtectedRoute> 
          },
          { 
            path: '/admin/codes', 
            element: <ProtectedRoute requiredRole="ADMIN"><Codes /></ProtectedRoute> 
          },
        ],
    },
]);