import React, { useState, useEffect } from 'react';
import { SMMProvider, useSMM } from './context/SMMContext';
import { UserPortal } from './user/UserPortal';
import { AdminPortal } from './admin/AdminPortal';
import { AdminLogin } from './admin/AdminLogin';

const MainRouter: React.FC = () => {
  const { isAdminLoggedIn, adminLogout } = useSMM();

  // Route state: 'user' or 'admin'
  const [currentRoute, setCurrentRoute] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('/admin') || hash === '#admin') {
        return 'admin';
      }
    }
    return 'user';
  });

  // Listen to popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('/admin') || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('user');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    setCurrentRoute('admin');
    window.location.hash = '/admin';
  };

  const navigateToUser = () => {
    setCurrentRoute('user');
    window.location.hash = '';
  };

  // Route: Admin
  if (currentRoute === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onSuccess={() => setCurrentRoute('admin')}
          onGoToUserSite={navigateToUser}
        />
      );
    }
    return (
      <AdminPortal
        onGoToUserSite={navigateToUser}
        onLogoutAdmin={() => {
          adminLogout();
        }}
      />
    );
  }

  // Route: User (Default Storefront & Client Dashboard)
  return <UserPortal onGoToAdmin={navigateToAdmin} />;
};

export default function App() {
  return (
    <SMMProvider>
      <MainRouter />
    </SMMProvider>
  );
}
