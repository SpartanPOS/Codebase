'use client';

// app/page.js
import {useEffect} from 'react';
import * as React from 'react';
import Lockscreen from '@/components/lockscreen';
import * as main from '@spartan-pos/runtime-module';

import AuthContext, {AuthProvider} from '../components/AuthContext';

/** homepage and main view of the app
 * @return {React.FC}
 */
export default function Home() {
  const {isAuthenticated, logout} = React.useContext(AuthContext);

  // Get the first exported React component
  const FirstExportedComponent = Object.values(main).find(
      (exported) => React.isValidElement(React.createElement(exported)),
  );

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
        {
          FirstExportedComponent ?
            <FirstExportedComponent /> :
            <p>There is no main view</p>
        }

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
