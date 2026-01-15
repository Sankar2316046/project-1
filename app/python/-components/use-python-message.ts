import { useState, useEffect } from 'react';

export function usePythonMessage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch('http://localhost:8000/hello', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Sankar' }),
        });
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        setMessage('Error: Could not connect to FastAPI');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return { message, loading };
}
