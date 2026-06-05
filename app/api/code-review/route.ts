import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis)
const userReviews = new Map();

// Code review patterns
const SECURITY_PATTERNS = [
  { pattern: /eval\(/g, severity: 'Critical', message: 'Never use eval() - it executes arbitrary code and is a security risk' },
  { pattern: /innerHTML\s*=/g, severity: 'High', message: 'innerHTML can lead to XSS attacks. Use textContent instead' },
  { pattern: /document\.write\(/g, severity: 'High', message: 'document.write() can cause XSS vulnerabilities' },
  { pattern: /password\s*=\s*['"]/gi, severity: 'Critical', message: 'Hardcoded password detected! Use environment variables' },
  { pattern: /api[_-]?key\s*=\s*['"]/gi, severity: 'Critical', message: 'API keys should not be hardcoded!' },
  { pattern: /localStorage\.setItem/g, severity: 'Low', message: 'Avoid storing sensitive data in localStorage' },
];

const PERFORMANCE_PATTERNS = [
  { pattern: /for\s*\(.*\)\s*{.*for\s*\(.*\)/gs, severity: 'Medium', message: 'Nested loops detected - O(n²) complexity' },
  { pattern: /setInterval\(/g, severity: 'Medium', message: 'Remember to clear intervals with clearInterval()' },
  { pattern: /while\s*\(\s*true\s*\)/g, severity: 'High', message: 'Infinite loop detected! Add break condition' },
];

const BEST_PRACTICES = [
  { pattern: /var\s+/g, severity: 'Low', message: 'Use const/let instead of var' },
  { pattern: /==(?!=)/g, severity: 'Medium', message: 'Use === instead of == to avoid type coercion' },
  { pattern: /console\.log/g, severity: 'Low', message: 'Remove console.log statements in production' },
  { pattern: /TODO|FIXME/g, severity: 'Low', message: 'Resolve TODO/FIXME comments before production' },
];

function detectLanguage(code: string): string {
  if (code.includes('import React') || code.includes('useState') || code.includes('useEffect')) {
    return 'react';
  }
  if (code.includes('function') && code.includes('=>') && code.includes('const')) {
    return 'javascript';
  }
  if (code.includes(':') && code.includes('interface') || code.includes('type')) {
    return 'typescript';
  }
  if (code.includes('def ') && code.includes('import ') && !code.includes(';')) {
    return 'python';
  }
  return 'javascript';
}

function generateInlineSuggestions(code: string, issues: any[]) {
  const lines = code.split('\n');
  const suggestions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('==') && !line.includes('===')) {
      suggestions.push({
        line: i + 1,
        original: line,
        suggestion: line.replace(/==(?!==)/g, '==='),
        message: 'Use === for strict equality'
      });
    }
    
    if (line.includes('var ')) {
      suggestions.push({
        line: i + 1,
        original: line,
        suggestion: line.replace('var ', 'const '),
        message: 'Use const/let instead of var'
      });
    }
    
    if (line.includes('console.log')) {
      suggestions.push({
        line: i + 1,
        original: line,
        suggestion: `// ${line}`,
        message: 'Remove console.log in production'
      });
    }
  }
  
  return suggestions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId = 'anonymous' } = body;
    
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    
    // Rate limiting: 10 reviews per hour
    const now = Date.now();
    const userHistory = userReviews.get(userId) || [];
    const recentReviews = userHistory.filter((time: number) => now - time < 3600000);
    
    if (recentReviews.length >= 10) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before submitting more code.' 
      }, { status: 429 });
    }
    
    userReviews.set(userId, [...recentReviews, now]);
    
    const language = detectLanguage(code);
    const issues = [];
    
    // Check security issues
    for (const pattern of SECURITY_PATTERNS) {
      if (pattern.pattern.test(code)) {
        issues.push({
          type: 'security',
          severity: pattern.severity,
          message: pattern.message,
        });
      }
    }
    
    // Check performance issues
    for (const pattern of PERFORMANCE_PATTERNS) {
      if (pattern.pattern.test(code)) {
        issues.push({
          type: 'performance',
          severity: pattern.severity,
          message: pattern.message,
        });
      }
    }
    
    // Check best practices
    for (const pattern of BEST_PRACTICES) {
      if (pattern.pattern.test(code)) {
        issues.push({
          type: 'best_practice',
          severity: pattern.severity,
          message: pattern.message,
        });
      }
    }
    
    // Calculate quality score
    let score = 10;
    for (const issue of issues) {
      if (issue.severity === 'Critical') score -= 2;
      else if (issue.severity === 'High') score -= 1.5;
      else if (issue.severity === 'Medium') score -= 1;
      else score -= 0.5;
    }
    const qualityScore = Math.max(0, Math.min(10, score));
    
    // Generate inline suggestions
    const inlineSuggestions = generateInlineSuggestions(code, issues);
    
    // Generate fixed code
    let fixedCode = code;
    for (const suggestion of inlineSuggestions) {
      fixedCode = fixedCode.replace(suggestion.original, suggestion.suggestion);
    }
    
    return NextResponse.json({
      success: true,
      review: {
        quality_score: qualityScore,
        language: language,
        issues: issues,
        inline_suggestions: inlineSuggestions,
        fixed_code: fixedCode !== code ? fixedCode : null,
        summary: {
          total_issues: issues.length,
          security_issues: issues.filter(i => i.type === 'security').length,
          performance_issues: issues.filter(i => i.type === 'performance').length,
          best_practice_issues: issues.filter(i => i.type === 'best_practice').length,
        }
      }
    });
    
  } catch (error) {
    console.error('Code review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}