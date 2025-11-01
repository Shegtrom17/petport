import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from './ui/card';

interface PodcastTranscriptProps {
  transcript: string;
}

export const PodcastTranscript: React.FC<PodcastTranscriptProps> = ({ transcript }) => {
  // Check if transcript contains HTML tags
  const isHTML = transcript.trim().startsWith('<');

  if (isHTML) {
    return (
      <Card className="p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-6 w-6 text-brand-primary" />
          <h2 className="text-2xl font-bold text-foreground">Full Transcript</h2>
        </div>

        <div 
          className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-brand-primary prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: transcript }}
        />
      </Card>
    );
  }

  // Plain text fallback
  const paragraphs = transcript.split('\n\n').filter(p => p.trim());

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-brand-primary" />
        <h2 className="text-2xl font-bold text-foreground">Full Transcript</h2>
      </div>

      <div className="prose prose-sm max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className="text-foreground mb-4 leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
};
