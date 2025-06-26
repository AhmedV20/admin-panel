import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="bg-[#F8F9FD] min-h-screen w-full">
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 