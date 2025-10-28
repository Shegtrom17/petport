import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface StoryUpdate {
  id: string;
  story_text: string;
  photo_url: string | null;
  author_name: string | null;
  created_at: string;
  is_visible: boolean;
}

interface StoryStreamProps {
  petId: string;
  petName: string;
}

const StoryStream = ({ petId, petName }: StoryStreamProps) => {
  const [stories, setStories] = useState<StoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const storiesPerPage = 10;

  useEffect(() => {
    loadStories();
  }, [petId, page]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const from = (page - 1) * storiesPerPage;
      const to = from + storiesPerPage - 1;

      const { data, error, count } = await supabase
        .from('story_updates')
        .select('*', { count: 'exact' })
        .eq('pet_id', petId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        setStories(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === storiesPerPage && (count || 0) > to + 1);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📖</span>
          <h2 className="text-2xl font-bold text-foreground">Story Stream</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
              <div className="h-20 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && stories.length === 0) {
    return null; // Don't show section if no stories
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📖</span>
        <h2 className="text-2xl font-bold text-foreground">
          {petName}'s Story Stream
        </h2>
      </div>

      <div className="space-y-4">
        {stories.map((story) => (
          <Card 
            key={story.id} 
            id={`story-${story.id}`}
            className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            {/* Author & Timestamp Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {story.author_name ? (
                  <>
                    <User className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      {story.author_name}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      Story Update
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(story.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap mb-4">
              {story.story_text}
            </p>

            {/* Optional Photo */}
            {story.photo_url && (
              <div className="rounded-lg overflow-hidden mt-4">
                <img
                  src={story.photo_url}
                  alt="Story photo"
                  className="w-full max-h-96 object-contain bg-muted"
                  loading="lazy"
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? 'Loading...' : 'Load More Stories'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryStream;
