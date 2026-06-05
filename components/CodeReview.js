'use client';

import { useState } from 'react';

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      alert('Please paste some code to review');
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#22c55e';
    if (score >= 6) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="code-review-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: 'white', padding: '8px 20px', borderRadius: '999px', fontSize: '14px', marginBottom: '16px' }}>
          <span>🤖</span>
          <span>AI-Powered Code Review</span>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
          Instant <span style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Code Analysis</span>
        </h2>
        <p style={{ color: '#9ca3af' }}>Get security, performance, and best practice suggestions for your code</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Code Input */}
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontWeight: '500', color: '#e5e7eb' }}>📝 Paste your code snippet</label>
            <button
              onClick={handleReview}
              disabled={isReviewing}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                cursor: isReviewing ? 'not-allowed' : 'pointer',
                opacity: isReviewing ? 0.6 : 1
              }}
            >
              {isReviewing ? 'Analyzing...' : '✨ Review Code'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder='Example:
function calculateTotal(items) {
  var total = 0;
  for(var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  console.log("Total:", total);
  return total;
}'
            style={{
              width: '100%',
              height: '300px',
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '16px',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Supports: JavaScript, TypeScript, React, Python</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>10 reviews/hour limit</span>
          </div>
        </div>

        {/* Results */}
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px', border: '1px solid #374151' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#e5e7eb' }}>📊 Review Results</h3>
          
          {!review ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <p>Paste your code and click "Review Code" to see analysis</p>
            </div>
          ) : (
            <>
              {/* Score */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#111827', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: getScoreColor(review.quality_score) }}>
                    {review.quality_score}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Quality Score /10</div>
                <div style={{ fontSize: '11px', color: '#a855f7', marginTop: '4px' }}>Detected: {review.language}</div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{review.summary?.total_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Issues</div>
                </div>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{review.summary?.security_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Security</div>
                </div>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#eab308' }}>{review.summary?.performance_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Performance</div>
                </div>
              </div>

              {/* Issues */}
              {review.issues && review.issues.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#e5e7eb' }}>🔍 Issues Found</h4>
                  {review.issues.map((issue, idx) => (
                    <div key={idx} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${issue.severity === 'Critical' ? '#ef4444' : issue.severity === 'High' ? '#f97316' : '#eab308'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: issue.severity === 'Critical' ? '#ef4444' : issue.severity === 'High' ? '#f97316' : '#eab308', color: 'white' }}>{issue.severity}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{issue.type}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#d1d5db' }}>{issue.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#22c55e10', border: '1px solid #22c55e30', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <h4 style={{ color: '#22c55e', fontWeight: '600', marginBottom: '4px' }}>Excellent Code!</h4>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No issues found. Your code follows best practices!</p>
                </div>
              )}

              {/* Fixed Code */}
              {review.fixed_code && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb' }}>✅ Suggested Fixes</h4>
                    <button onClick={() => copyToClipboard(review.fixed_code)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: '12px' }}>
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <pre style={{ background: '#111827', padding: '12px', borderRadius: '8px', overflowX: 'auto', fontSize: '11px', color: '#d1d5db', fontFamily: 'monospace' }}>
                    <code>{review.fixed_code}</code>
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}