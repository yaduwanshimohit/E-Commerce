import React, { useEffect, useState } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminQA = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/qa/admin/all');
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch Q&A list');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    if (!answerText.trim()) {
      toast.error('Please enter an answer text');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.put(`/qa/${questionId}/answer`, { answer: answerText.trim() });
      if (data.success) {
        toast.success('Answer submitted successfully!');
        setAnsweringId(null);
        setAnswerText('');
        fetchQuestions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const { data } = await api.delete(`/qa/${questionId}`);
      if (data.success) {
        toast.success('Question deleted successfully!');
        fetchQuestions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const unansweredCount = questions.filter((q) => !q.answer).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <HelpCircle className="text-purple-500" /> Customer Product Q&A
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Answer customer inquiries about product specifications, compatibility, and availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full">
            {unansweredCount} Unanswered Questions
          </span>
          <button
            onClick={fetchQuestions}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading customer questions...</div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-400">
          No customer questions found.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q._id}
              className={`p-6 rounded-3xl border transition-all ${
                !q.answer
                  ? 'bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-purple-400">
                    {q.userName?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{q.userName}</h4>
                    <p className="text-xs text-slate-400">
                      Product: <span className="text-purple-400 font-semibold">{q.product?.name || 'Product'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {new Date(q.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <div className="py-4">
                <p className="text-sm font-semibold text-slate-200 flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 text-xs font-bold">Q</span>
                  {q.question}
                </p>

                {/* Seller Answer if present */}
                {q.answer ? (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle size={14} /> Seller / Admin Answer:
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5">{q.answer}</p>
                    <span className="block text-[10px] text-slate-500 pl-5 pt-1">
                      Answered on: {new Date(q.answeredAt || q.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    {answeringId === q._id ? (
                      <div className="space-y-3">
                        <textarea
                          rows="3"
                          placeholder="Type official seller/admin answer..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="w-full bg-slate-900 border border-purple-500/50 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAnswerSubmit(q._id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                          >
                            <Send size={14} /> Submit Answer
                          </button>
                          <button
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswerText('');
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnsweringId(q._id);
                          setAnswerText('');
                        }}
                        className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare size={14} /> Reply to Customer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQA;
