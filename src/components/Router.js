import Header from "./Header";
import Footer from "./Footer";
import Home from "../pages/Home";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
//import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

export default function Router() {
  const Layout = () => {
    return (
      <>
        <Header />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </>
    );
  };

  const BrowserRoutes = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  };

  return <BrowserRoutes />;
}
