import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { noteContent, dialogue } = await request.json();

    if (!noteContent && !dialogue) {
      return NextResponse.json(
        { error: 'Note content or dialogue is required' },
        { status: 400 }
      );
    }

    // Use Grok API to generate a concise session summary
    const grokApiKey = process.env.XAI_API_KEY;
    
    if (!grokApiKey) {
      console.error('XAI_API_KEY not configured');
      // Fallback to simple summary if API key not available
      const fallbackSummary = noteContent 
        ? noteContent.substring(0, 200).trim() + '...'
        : 'Session completed';
      return NextResponse.json({ summary: fallbackSummary });
    }

    // Prepare content for summarization
    const contentToSummarize = noteContent || (dialogue ? dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n') : '');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a medical assistant. Generate a brief, professional 1-2 sentence summary of the medical session that captures the key reason for visit and main findings. Keep it concise and clinical.'
          },
          {
            role: 'user',
            content: `Summarize this medical session:\n\n${contentToSummarize.substring(0, 2000)}`
          }
        ],
        model: 'grok-beta',
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error:', errorData);
      // Fallback to simple summary
      const fallbackSummary = noteContent 
        ? noteContent.substring(0, 200).trim() + '...'
        : 'Session completed';
      return NextResponse.json({ summary: fallbackSummary });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || 'Session completed';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    // Return fallback summary on error
    const fallbackSummary = 'Medical consultation session completed';
    return NextResponse.json({ summary: fallbackSummary });
  }
}
