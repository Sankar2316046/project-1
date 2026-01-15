'use client';

import { usePythonMessage } from './-components/use-python-message';

export default function PythonPage() {
  const { message, loading } = usePythonMessage();

  return (
    <div>
      <h1>Python Connection</h1>
      {loading ? <p>Loading...</p> : <p>{message}</p>}
    </div>
  );
}
