import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App";
import Home from "./screens/Home";
import SobreNos from "./screens/SobreNos";
import Itens from "./screens/Itens";
import ItemDetalhes from "./screens/ItemDetalhes";
import ErrorScreen from "./screens/ErrorScreen";
import LoginScreen from "./screens/Login";
import Logout from "./screens/Logout";
import Register from "./screens/Register";
import CadastrarItem from "./screens/CadastrarItem";
import MeusItens from "./screens/MeusItens";
import Perfil from "./screens/Perfil";
import EditarPerfil from "./screens/EditarPerfil";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <Home /> },
      { path: "sobrenos", element: <SobreNos /> },
      { path: "login", element: <LoginScreen /> },
      { path: "register", element: <Register /> },
      { path: "logout", element: <Logout /> },
      {
        path: "itens",
        element: <ProtectedRoute><Itens /></ProtectedRoute>,
      },
      {
        path: "meus-itens",
        element: <ProtectedRoute><MeusItens /></ProtectedRoute>,
      },
      {
        path: "itens/cadastrar",
        element: <ProtectedRoute><CadastrarItem /></ProtectedRoute>,
      },
      {
        path: "itens/:id",
        element: <ProtectedRoute><ItemDetalhes /></ProtectedRoute>,
      },
      { path: "perfil/editar", element: <ProtectedRoute><EditarPerfil /></ProtectedRoute> },
      { path: "perfil/:id", element: <ProtectedRoute><Perfil /></ProtectedRoute> },
      { path: "pagina_antiga", element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);