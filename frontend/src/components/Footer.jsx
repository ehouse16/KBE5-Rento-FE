import React from "react";

const Footer = () => (
  <footer style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f1f1f1', fontSize: '14px', color: '#555' }}>
    © {new Date().getFullYear()} Rento Management Service. All rights reserved.
  </footer>
);


export default Footer;
