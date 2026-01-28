"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { studentService } from "@/shared/services/student.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";

import AppLoader from "@/app/components/Loading";
import { createSupabaseClient } from "@/lib/supabase";

interface Ranking {
  rank: number;
  student_name: string;
  register_no: string;
  department: string;
  year: number;
  score_percentage: number;
  time_efficiency: number;
  total_time_taken: number;
  submitted_at: string;
}

export default function TestPage() {
  const params = useParams();
  const testId = params.id as string;
  const router = useRouter();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient(); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
    
        
        // Fetch rankings
        const rankingsData = await studentService.getTestRankings(testId);
        setRankings(rankingsData);
        
        // Fetch test details
        const { data: testData, error: testError } = await supabase
          .from('test')
          .select('*')
          .eq('id', testId)
          .single();
        
        if (testError) {
          console.error('Error fetching test:', testError);
        } else {
          setTest(testData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchData();
    }
  }, [testId]);

  if (loading) {
    return (
      <AppLoader text="Loading Test Data" />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-400 mb-4">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const averageScore = rankings.length > 0 ? (rankings.reduce((sum, r) => sum + r.score_percentage, 0) / rankings.length).toFixed(1) : '0';
  const averageEfficiency = rankings.length > 0 ? (rankings.reduce((sum, r) => sum + r.time_efficiency, 0) / rankings.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Test Info */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-semibold">{test?.domain || 'Domain'}</CardTitle>
            <div className="flex items-center gap-4 mt-4 text-slate-400">
        
              <span className="capitalize">Difficulty: {test?.difficulty || 'Unknown'}</span>
              <span>•</span>
              <span>{test?.questions_per_student || 'Unknown'} Questions</span>
            </div>
            
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                <p className="text-2xl text-white mb-1">{rankings.length}</p>
                <p className="text-sm text-slate-400">Students Attempted</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                <p className="text-2xl text-emerald-400 mb-1">{averageScore}%</p>
                <p className="text-sm text-slate-400">Average Score</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                <p className="text-2xl text-indigo-400 mb-1">{test?.questions_per_student || 'N/A'}</p>
                <p className="text-sm text-slate-400">Total Questions in Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl font-semibold">Student Rankings</CardTitle>
              <p className="text-slate-400 mt-2 text-sm">Sorted by Score → Time Efficiency</p>
            </div>
          </CardHeader>
          <CardContent>
            {rankings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No students have attempted this test yet
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.map((ranking) => (
                  <div
                    key={ranking.rank}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-4"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl">
                      {ranking.rank === 1 && <Trophy className="w-6 h-6 text-yellow-400" />}
                      {ranking.rank === 2 && <Trophy className="w-6 h-6 text-slate-300" />}
                      {ranking.rank === 3 && <Trophy className="w-6 h-6 text-amber-600" />}
                      {ranking.rank > 3 && <span className="text-white text-lg">{ranking.rank}</span>}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-white text-lg">{ranking.student_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Score: {ranking.score_percentage.toFixed(2)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Time: {ranking.total_time_taken/1000} s
                        </span>
                        <span>Efficiency: {ranking.time_efficiency.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}