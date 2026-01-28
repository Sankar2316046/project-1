import { createSupabaseClient } from "./supabase";

export interface StudentData {
  name: string;
  register_no: string;
  department: string;
  year: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  topic: string;
  difficulty: string;
}
const supabase = createSupabaseClient();
export async function createStudent(data: StudentData): Promise<string> {
  const { data: student, error } = await supabase
    .from('students')
    .insert(data)
    .select('id')
    .single();

  if (error) throw error;
  return student.id;
}

export async function getQuestions(testId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('question_pool')
    .select('*')
    .eq('test_id', testId);

  if (error) throw error;
  return data || [];
}

export async function submitAnswers(testId: string, studentId: string, answers: Record<string, string>): Promise<void> {
  const answersData = Object.entries(answers).map(([question_id, answer]) => ({
    test_id: testId,
    question_id,
    user_answer: answer,
    student_id: studentId
  }));

  const { error } = await supabase.from('user_answers').insert(answersData);
  if (error) throw error;
}

export async function submitResults(testId: string, studentId: string, results: {
  domain: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  topic_breakdown: any;
}): Promise<void> {
  const { error } = await supabase.from('test_results').insert({
    ...results,
    test_id: testId,
    student_id: studentId
  });
  if (error) throw error;
}
