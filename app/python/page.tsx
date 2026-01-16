'use client';

import { Button } from '@/components/ui/button';
import { usePythonMessage } from './-components/use-python-message';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  topic: string;
  difficulty: string;
}

export default function PythonPage() {
  const { questions, loading, error, generate } = usePythonMessage();

  const handleGenerate = () => {
    const params = {
      domain: 'frontend',
      topics: ['html', 'css'],
      difficulty: 'easy',
      question_count_per_topic: 5,
    };
    generate(params);
  };

  return (
    <div>
      <h1>Exam Generator</h1>
      <Button onClick={handleGenerate} disabled={loading}>Generate</Button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {questions.length > 0 && (
        <div>
          <h2>Generated Questions</h2>
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <p><strong>Question:</strong> {q.question}</p>
              <p><strong>Options:</strong></p>
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
              <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
              <p><strong>Topic:</strong> {q.topic}</p>
              <p><strong>Difficulty:</strong> {q.difficulty}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
