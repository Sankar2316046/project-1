
"use client";
import { useAuth } from "@/shared/provider/authContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Plus, BookOpen } from 'lucide-react';
import AppLoader from "./components/Loading";
import { createSupabaseClient } from "@/lib/supabase";

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
  

  useEffect(() => {
    if (user) {
      const supabase = createSupabaseClient();
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
  }, [user]);

  const stats = [
    {
      title: 'Total Tests Created',
      value: tests.length,
      icon: FileText,
      color: 'from-indigo-600 to-indigo-800',
    },
    {
      title: 'Active Tests',
      value: tests.filter(t => t.status === 'created').length,
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-800',
    },
    {
      title: 'Draft Tests',
      value: tests.filter(t => t.status === 'draft').length,
      icon: BookOpen,
      color: 'from-amber-600 to-amber-800',
    },
  ];

  if (loading) {
    return (
      <AppLoader text="Loading Dashboard data ..." />
    );
  }

  if (!user) {
    <AppLoader text="Redirecting to login page ..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-start justify-between p-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create Test CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-600/20 to-indigo-800/20 border-indigo-500/50">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-xl text-white mb-2">Create New AI-Generated Test</h3>
                <p className="text-slate-300">Set up a new assessment with intelligent question distribution</p>
              </div>
              <Link href="/form">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Test
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Tests */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-2xl text-white mb-6">My Tests</h2>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tests created yet</p>
                <Link href="/form">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4">Create First AI-Generated Test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg text-white mb-1">{test.domain}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="capitalize">{test.difficulty} Difficulty</span>
                          <span>{test.questions_per_student} questions</span>
                          <span>{test.status}</span>
                          <span>{new Date(test.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const url = `https://cognify-student.vercel.app/test/${test.id}`;
                            navigator.clipboard.writeText(url);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                        >
                          Copy Link
                        </Button>
                        <Link href={`/test/${test.id}`}>
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">
                            View Ranking
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
