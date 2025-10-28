import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MetaTags } from '@/components/MetaTags';
import { SocialShareButtons } from '@/components/SocialShareButtons';

interface StoryUpdate {
  id: string;
  story_text: string;
  photo_url: string | null;
  author_name: string | null;
  created_at: string;
  is_visible: boolean;
}

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string;
}

const PublicStoryStream = () => {
  const { petId } = useParams<{ petId: string }>();
  const [stories, setStories] = useState<StoryUpdate[]>([]);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const storiesPerPage = 10;

  useEffect(() => {
    loadData();
  }, [petId, page]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pet data
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('id, name, species, breed')
        .eq('id', petId)
        .eq('is_public', true)
        .single();

      if (petError) throw petError;
      if (!pet) throw new Error('Pet not found or not public');
      
      setPetData(pet);

      // Load stories
      const from = (page - 1) * storiesPerPage;
      const to = from + storiesPerPage - 1;

      const { data: storiesData, error: storiesError, count } = await supabase
        .from('story_updates')
        .select('*', { count: 'exact' })
        .eq('pet_id', petId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (storiesError) throw storiesError;

      if (storiesData) {
        setStories(prev => page === 1 ? storiesData : [...prev, ...storiesData]);
        setHasMore(storiesData.length === storiesPerPage && (count || 0) > to + 1);
      }
    } catch (error) {
      console.error('Error loading story stream:', error);
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
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!petData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Story Stream Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This pet's story stream is not available or not public.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pageUrl = `${window.location.origin}/story-stream/${petId}`;
  const pageTitle = `${petData.name}'s Story Stream`;
  const pageDescription = `Follow ${petData.name}'s adventures and life updates. ${stories.length} stories shared.`;

  return (
    <>
      <MetaTags
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        type="article"
      />

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/profile/${petId}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h1 className="text-3xl font-bold text-foreground">
                  {petData.name}'s Story Stream
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                {petData.breed} • {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Stories */}
          {stories.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No stories yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <Card 
                  key={story.id} 
                  id={`story-${story.id}`}
                  className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Author & Timestamp */}
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
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
          )}

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
      </div>

      {/* Social Share Dialog */}
      {showShareDialog && (
        <SocialShareButtons
          url={pageUrl}
          title={pageTitle}
          description={pageDescription}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </>
  );
};

export default PublicStoryStream;
