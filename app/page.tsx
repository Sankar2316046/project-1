
"use client";
import { useAuth } from "@/shared/provider/authContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface Test {
  id: string;
  created_at: string;
  user_id: string;
  domain: string;
  difficulty: string;
  questions_per_student: number;
  status: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      supabase
        .from('test')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('Error fetching tests:', error);
          else setTests(data || []);
        });
    }
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-200">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-4">Welcome to Skill Analyzer</h1>
          <p className="text-slate-400 mb-6">Please log in to access your dashboard.</p>
          <Link href="/login">
            <Button className="bg-slate-700 hover:bg-slate-600 text-slate-200">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Skill Analyzer Dashboard</h1>
          <p className="text-lg text-slate-400 mb-8">
            Assess your skills with personalized tests. Create and take tests to evaluate your knowledge.
          </p>
          <Link href="/form">
            <Button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-8 py-3 text-lg mb-8">
              Add Test
            </Button>
          </Link>
        </div>
        
        {tests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">My Tests</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-slate-800 text-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Domain</th>
                    <th className="px-4 py-3 text-left">Difficulty</th>
                    <th className="px-4 py-3 text-left">Questions per student</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-t border-slate-600 hover:bg-slate-700">
                      <td className="px-4 py-3">{test.domain}</td>
                      <td className="px-4 py-3">{test.difficulty}</td>
                      <td className="px-4 py-3">{test.questions_per_student}</td>
                      <td className="px-4 py-3">{test.status}</td>
                      <td className="px-4 py-3">
                        <Button
                          onClick={() => {
                            const url = `localhost:3001/test/${test.id}`;
                            navigator.clipboard.writeText(url);
                          }}
                          className="bg-slate-600 hover:bg-slate-500 text-slate-200 px-4 py-2"
                        >
                          Copy Link
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
