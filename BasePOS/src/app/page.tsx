'use client';

// app/page.js
import {useRef, useEffect} from 'react';
import * as React from 'react';
import Lockscreen from '@/components/lockscreen';
import Navigation from '../server/clientnav';
import DynamicView from './dynamicview';

import AuthContext, {AuthProvider} from '../components/AuthContext';

/** homepage and main view of the app
 * @return {React.FC}
 */
export default function Home() {
  const viewList = useRef([]);
  const [activeView, setActiveView] = React.useState('');
  const {isAuthenticated, logout} = React.useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User is not authenticated');
      return;
    }

    const intervalId = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/session/refresh', {
            method: 'POST',
            credentials: 'include', // Important for sending cookies
          });

          const data = await response.json();
          if (response.ok) {
            console.log(data.message); // 'Token refreshed' or 'Token is still valid'
          } else {
            console.error('Token refresh failed:', data.message);
            logout();
            // Redirect to login or handle the error appropriately
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          logout();
          // Handle the error (e.g., redirect to login)
        }
      }
    }, 10 * 1000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [isAuthenticated, logout]);

  return (
    <div>
      <AuthProvider>
        {/* <Navigation viewList={viewList} activeView={activeView} setActiveView={setActiveView} /> */}
        test
      </AuthProvider>
      <main>
        {/* <DynamicView viewName={activeView} /> */}
      </main>

      <Lockscreen />
      {/* <Navigation viewList={viewList} curView={curView} />
      <main>
        <DynamicView viewName={curView.current} />
         <Lockscreen />
      </main > */}
    </div>
  );
};
