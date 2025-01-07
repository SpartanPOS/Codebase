
import {auth0} from '@/lib/auth0';
import * as React from 'react';

/** Protected route
 * @param {ReactNode[]} children
 * @return {ReactNode}
 */
export default function ProtectedRoute({
  children,
}: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div>
      {auth0 && (

        children
      )}
    </div>
  );
}
