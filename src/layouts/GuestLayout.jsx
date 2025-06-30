import React from 'react';

const GuestLayout = ({ children }) => {
  return (
    <div className="guest-layout">
      <main>{children}</main>
    </div>
  );
};

export default GuestLayout;
