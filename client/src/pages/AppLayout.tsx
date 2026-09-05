import { Outlet } from "react-router-dom";
import Banner from "../components/Banner.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Home/Footer.tsx";
import CartSideBar from "../components/CartSideBar.tsx";

const AppLayout = () => {
  return (
    <>
      <Banner />
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer/>
      <CartSideBar/>
      
    </>
  );
};

export default AppLayout;
