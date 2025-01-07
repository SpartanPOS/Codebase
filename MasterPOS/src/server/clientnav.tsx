'use server';

import * as React from 'react';
import ClientNavigation from './clientnav';

export const setActiveView = async (viewName: string, curView: React.MutableRefObject<string>) => {
  'use server';
  curView.current = viewName;
};

/** navigation component
 * @return {React.FC}
*/
export default async function Navigation({
  viewList,
  activeView,
  setActiveView,
}: {
  viewList: React.MutableRefObject<string[]>;
  activeView: string;
  setActiveView: (viewName: string) => void;
}) {
  return <ClientNavigation viewList={viewList} activeView={activeView} setActiveView={setActiveView} />;
}
