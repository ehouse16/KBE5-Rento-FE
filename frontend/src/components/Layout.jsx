// components/Layout.jsx
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
    <Header />
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px" }}>{children}</main>
    </div>
    <Footer />
  </div>
);

export default Layout;