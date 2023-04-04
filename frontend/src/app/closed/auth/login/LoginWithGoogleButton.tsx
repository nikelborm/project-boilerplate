'use client';

import React, { useEffect } from 'react';

export function LoginWithGoogleButton() {
  const ref = React.useRef<any>(null);
  const callBack = () => {
    window.close();
    ref.current = window.open(
      '/api/auth/google/login',
      'myWindow',
      'status = 1, height = 1000, width = 600, resizable = 0',
    );
    // setTimeout(() => {
    //   ref.current.close();
    // }, 10000);
  };
  useEffect(() => {
    const onMessage = (event) => {
      console.log('event.origin: ', event.origin);
      if (event.origin !== 'http://localhost') return;
      // console.log(event);
      console.log(event.data);

      // …
    };
    window.addEventListener('message', onMessage, false);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  });
  return (
    <button type="button" onClick={callBack}>
      login with google
    </button>
  );
}
