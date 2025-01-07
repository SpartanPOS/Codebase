'use client';
import * as React from 'react';

import {useUser} from '@auth0/nextjs-auth0';

export default function ProfileClient() {
  const {user, error, isLoading} = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{(error as Error).message ?? 'unknown error'}</div>;

  return (
    user && (
      <div>
        <img src={user.picture} style={{borderRadius: 45}} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
}
