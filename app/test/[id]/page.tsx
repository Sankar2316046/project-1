"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { studentService } from "@/shared/services/student.service";

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
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await studentService.getTestRankings(testId);
        setRankings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rankings');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchRankings();
    }
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-200">Loading rankings...</p>
      </div>
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Test Rankings</h1>
          <p className="text-lg text-slate-400">
            Detailed view of student performance for Test ID: {testId}
          </p>
        </div>

        {rankings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-slate-800 text-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Register No</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Score (%)</th>
                  <th className="px-4 py-3 text-left">Time Efficiency</th>
                  <th className="px-4 py-3 text-left">Total Time (s)</th>
                  <th className="px-4 py-3 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking) => (
                  <tr key={ranking.rank} className="border-t border-slate-600 hover:bg-slate-700">
                    <td className="px-4 py-3 font-semibold">
                      {ranking.rank === 1 && "🥇"}
                      {ranking.rank === 2 && "🥈"}
                      {ranking.rank === 3 && "🥉"}
                      {ranking.rank > 3 && `#${ranking.rank}`}
                    </td>
                    <td className="px-4 py-3">{ranking.student_name}</td>
                    <td className="px-4 py-3">{ranking.register_no}</td>
                    <td className="px-4 py-3">{ranking.department}</td>
                    <td className="px-4 py-3">{ranking.year}</td>
                    <td className="px-4 py-3 font-semibold text-green-400">
                      {ranking.score_percentage.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">{ranking.time_efficiency.toFixed(2)}</td>
                    <td className="px-4 py-3">{ranking.total_time_taken.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {new Date(ranking.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 text-lg">No rankings available for this test yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}