import { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  topic: string;
  difficulty: string;
}

export function usePythonMessage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async (params: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      try {
        const parsedOutput = JSON.parse(data.output);
        setQuestions(parsedOutput.questions);
      } catch (parseError) {
        setError(`Failed to parse response: ${data.output}`);
      }
    } catch (err) {
      setError('Error: Could not generate questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { questions, loading, error, generate };
}
