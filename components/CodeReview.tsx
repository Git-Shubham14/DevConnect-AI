'use client';

import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';

interface Issue {
  type: string;
  severity: string;
  message: string;
}

interface InlineSuggestion {
  line: number;
  original: string;
  suggestion: string;
  message: string;
}

interface ReviewData {
  quality_score: number;
  language: string;
  issues: Issue[];
  inline_suggestions: InlineSuggestion[];
  fixed_code: string | null;
  summary: {
    total_issues: number;
    security_issues: number;
    performance_issues: number;
    best_practice_issues: number;
  };
}

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'fixed'>('results');
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      alert('Please enter some code to review');
      return;
    }

    setIsReviewing(true);
    setReview(null);

    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: 'anonymous' })
      });

      const data = await response.json();
      
      if (data.success) {
        setReview(data.review);
      } else {
        alert(data.error || 'Review failed');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to review code. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      Critical: 'bg-red-600',
      High: 'bg-orange-600',
      Medium: 'bg-yellow-600',
      Low: 'bg-blue-600'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Code Review</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Code Review Assistant
        </h1>
        <p className="text-gray-400 mt-2">
          Get instant feedback on your code with security, performance, and best practice suggestions
        </p>
      </div>

      {/* Code Input Section */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white"
            >
              <option value="auto">Auto Detect</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React</option>
              <option value="python">Python</option>
            </select>
            <button
              onClick={handleReview}
              disabled={isReviewing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 rounded-lg text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isReviewing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Reviewing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Review Code
                </span>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              10 reviews per hour limit
            </span>
          </div>
        </div>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for AI review..."
          className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 font-mono text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Results Section */}
      {review && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'results'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Review Results
            </button>
            {review.fixed_code && (
              <button
                onClick={() => setActiveTab('fixed')}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === 'fixed'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Fixed Code
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'results' && (
              <>
                {/* Score Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-700 mb-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(review.quality_score)}`}>
                        {review.quality_score}
                      </div>
                      <div className="text-xs text-gray-400">/10</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Detected Language: <span className="text-purple-400 font-medium">{review.language}</span>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{review.summary.total_issues}</div>
                    <div className="text-xs text-gray-400">Total Issues</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{review.summary.security_issues}</div>
                    <div className="text-xs text-gray-400">Security</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{review.summary.performance_issues}</div>
                    <div className="text-xs text-gray-400">Performance</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{review.summary.best_practice_issues}</div>
                    <div className="text-xs text-gray-400">Best Practices</div>
                  </div>
                </div>

                {/* Issues List */}
                {review.issues.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white mb-4">🔍 Issues Found</h3>
                    {review.issues.map((issue, idx) => (
                      <div key={idx} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${getSeverityBadge(issue.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(issue.severity)} text-white`}>
                                {issue.severity}
                              </span>
                              <span className="text-xs text-gray-400 capitalize">{issue.type}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{issue.message}</p>
                          </div>
                          {issue.severity === 'Critical' && <XCircle className="w-5 h-5 text-red-400" />}
                          {issue.severity === 'High' && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                          {issue.severity === 'Medium' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                          {issue.severity === 'Low' && <CheckCircle className="w-5 h-5 text-blue-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-green-500 mb-2">Excellent Code!</h3>
                    <p className="text-gray-400">No issues found. Your code follows best practices!</p>
                  </div>
                )}

                {/* Inline Suggestions */}
                {review.inline_suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📝 Inline Suggestions</h3>
                    <div className="space-y-2">
                      {review.inline_suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-3 text-sm">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="text-xs text-purple-400 mb-1">Line {suggestion.line}</div>
                              <div className="text-gray-500 line-through text-xs mb-1">{suggestion.original}</div>
                              <div className="text-green-400 text-xs">{suggestion.suggestion}</div>
                              <p className="text-gray-400 text-xs mt-2">{suggestion.message}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(suggestion.suggestion)}
                              className="text-gray-500 hover:text-purple-400 transition"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'fixed' && review.fixed_code && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">✅ Improved Code</h3>
                  <button
                    onClick={() => copyToClipboard(review.fixed_code!)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-purple-400 transition"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono">{review.fixed_code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}