import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface StudentData {
  name: string;
  register_no: string;
  department: string;
  year: number;
}

export interface QuestionWithOrder {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  topic: string;
  difficulty: string;
  question_order: number;
  selected_answer: string | null;
}

export class StudentService {

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomBytes = crypto.getRandomValues(new Uint8Array(1));
      const j = randomBytes[0] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async createStudent(data: StudentData): Promise<string> {
    const { data: student, error } = await supabase
      .from('students')
      .insert(data)
      .select('id')
      .single();

    if (error) throw new Error(error.message || 'Database error');
    return student.id;
  }

  async createTestAttempt(testId: string, studentId: string): Promise<string> {
    // Create the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('student_test_attempts')
      .insert({
        test_id: testId,
        student_id: studentId
      })
      .select('id')
      .single();

    if (attemptError) throw attemptError;

    const attemptId = attempt.id;

    // Get total questions per student from test
    const { data: testData, error: testError } = await supabase
      .from('test')
      .select('questions_per_student')
      .eq('id', testId)
      .single();

    if (testError) throw testError;

    if (!testData) throw new Error("Test not found.");

    const totalQuestions = testData.questions_per_student;

    // Get unique topics for the test
    const { data: questionData, error: questionError } = await supabase
      .from('question_pool')
      .select('topic')
      .eq('test_id', testId);

    if (questionError) throw questionError;

    const topics = [...new Set(questionData.map(q => q.topic))];
    const numTopics = topics.length;

    if (numTopics === 0) throw new Error('No topics found for the test');

    const perTopic = Math.floor(totalQuestions / numTopics);
    const remainder = totalQuestions % numTopics;

    let selectedQuestions: { id: string }[] = [];

    // 4️⃣ TRUE RANDOM PER TOPIC (CLIENT)
    for (let i = 0; i < numTopics; i++) {
      const topic = topics[i];
      const count = perTopic + (i < remainder ? 1 : 0);

      // Get all questions for this topic
      const { data: allQuestions, error: topicError } = await supabase
        .from('question_pool')
        .select('id')
        .eq('test_id', testId)
        .eq('topic', topic);

      if (topicError) throw topicError;

      // Shuffle with crypto
      const shuffled = this.shuffleArray(allQuestions);
      // Take count
      const selected = shuffled.slice(0, count);

      selectedQuestions.push(...selected);
    }

    // 5️⃣ FINAL SHUFFLE (ORDER RANDOMIZATION)
    selectedQuestions = this.shuffleArray(selectedQuestions);

    // 6️⃣ Freeze order
    const studentQuestions = selectedQuestions.map((q, idx) => ({
      attempt_id: attemptId,
      question_id: q.id,
      question_order: idx + 1
    }));

    // Insert into student_questions
    const { error: insertError } = await supabase
      .from('student_questions')
      .insert(studentQuestions);

    if (insertError) throw insertError;

    return attemptId;
  }

  async getAttemptQuestions(attemptId: string): Promise<QuestionWithOrder[]> {
    const { data, error } = await supabase
      .from('student_questions')
      .select('question_id, question_order, selected_answer, question_pool(*)')
      .eq('attempt_id', attemptId)
      .order('question_order');

    if (error) throw new Error(error.message || 'Database error');

    return data.map(d => ({
      id: d.question_id,
      question: (d.question_pool as any).question,
      options: (d.question_pool as any).options,
      correct_answer: (d.question_pool as any).correct_answer,
      topic: (d.question_pool as any).topic,
      difficulty: (d.question_pool as any).difficulty,
      question_order: d.question_order,
      selected_answer: d.selected_answer
    }));
  }

  async updateSelectedAnswer(attemptId: string, questionId: string, answer: string): Promise<void> {
    const { error } = await supabase
      .from('student_questions')
      .update({ selected_answer: answer })
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId);

    if (error) throw new Error(error.message || 'Database error');
  }

  async updateIsCorrect(attemptId: string, questionId: string, isCorrect: boolean): Promise<void> {
    const { error } = await supabase
      .from('student_questions')
      .update({ is_correct: isCorrect })
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId);

    if (error) throw new Error(error.message || 'Database error');
  }

  async updateAttempt(attemptId: string, updates: Partial<{ end_time: string; total_time_taken: number; score_percentage: number; time_efficiency: number; submitted_at: string }>): Promise<void> {
    const { error } = await supabase
      .from('student_test_attempts')
      .update(updates)
      .eq('id', attemptId);

    if (error) throw new Error(error.message || 'Database error');
  }

  async getTestRankings(testId: string): Promise<Array<{
    rank: number;
    student_name: string;
    register_no: string;
    department: string;
    year: number;
    score_percentage: number;
    time_efficiency: number;
    total_time_taken: number;
    submitted_at: string;
  }>> {
    const { data, error } = await supabase
      .from('student_test_attempts')
      .select(`
        score_percentage,
        time_efficiency,
        total_time_taken,
        submitted_at,
        students (
          name,
          register_no,
          department,
          year
        )
      `)
      .eq('test_id', testId)
      .not('score_percentage', 'is', null)
      .order('score_percentage', { ascending: false })
      .order('time_efficiency', { ascending: false });

    if (error) throw new Error(error.message || 'Database error');

    // Add rank
    const rankings = data.map((item, index) => ({
      rank: index + 1,
      student_name: (item.students as any).name,
      register_no: (item.students as any).register_no,
      department: (item.students as any).department,
      year: (item.students as any).year,
      score_percentage: item.score_percentage,
      time_efficiency: item.time_efficiency,
      total_time_taken: item.total_time_taken,
      submitted_at: item.submitted_at
    }));

    return rankings;
  }
}

export const studentService = new StudentService();