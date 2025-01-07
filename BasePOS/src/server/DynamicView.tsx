'use server';
import dynamic from 'next/dynamic';
import runtime from '../../runtime';
import {viewInstance} from '../../runtime';
import React, { Component, ReactNode } from 'react';
import {PathLike} from 'fs';

/** return list of views and import them as modules */
async function getViewComponents() {
  const viewComponents: { [key: string]: () => Promise<ReactNode> } = {};
  const views = await runtime.availableViews;
  views.forEach((view: viewInstance) => {
    viewComponents[view.name] = () => import(String(view.relativePath));
  });

  return viewComponents;
}

/**
 * gets dynamic view from the server
 * @param {string} viewname
 * @return {ComponentType}
 */
export async function getView({viewName}: {viewName: string}): Promise<React.ComponentType> {
  const viewComponents = await getViewComponents();
  const view = viewComponents[viewName];
  const viewDisplay = dynamic(view, {ssr: true, loading: () => <div>Loading...</div>});
  return viewDisplay;
}

/** dynamic view props interface */
interface DynamicViewProps {
    viewName?: string;
}

/**
 * the dynamic viewport for modules to load
 * @param {string} viewname
 * @return {React.JSX.Element}
 */
export default async function Page({viewName}: DynamicViewProps): Promise<React.JSX.Element> {
  const effectiveViewName = viewName || 'dashboard';

  const View = await getView({viewName: effectiveViewName}) || (() => <div>View not found</div>);
  if (!View) {
    return <div>View not found</div>;
  }

  return (
    <div>
      <View />
    </div>
  );
}
