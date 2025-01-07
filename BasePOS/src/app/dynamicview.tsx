import ServerView from '../server/DynamicView';

import React from 'react';

/**
 * Dynamic view component
 * @param {string} viewName
 * @return {React.FC}
 */
export default function DynamicView(viewName: string) {
  return (
    <div>
      <ServerView viewName={viewName}/>
    </div>
  );
}
