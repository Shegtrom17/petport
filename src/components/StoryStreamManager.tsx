import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Eye, EyeOff, Trash2, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StoryUpdate {
  id: string;
  story_text: string;
  photo_url: string | null;
  author_name: string | null;
  created_at: string;
  is_visible: boolean;
}

interface StoryStreamManagerProps {
  petId: string;
  petName: string;
}

const MAX_STORY_LENGTH = 450;

export const StoryStreamManager = ({ petId, petName }: StoryStreamManagerProps) => {
  const [stories, setStories] = useState<StoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStories();
  }, [petId]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('story_updates')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load story updates',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!storyText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Story text is required',
      });
      return;
    }

    if (storyText.length > MAX_STORY_LENGTH) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Story must be ${MAX_STORY_LENGTH} characters or less`,
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('story_updates')
        .insert({
          pet_id: petId,
          story_text: storyText.trim(),
          author_name: authorName.trim() || null,
          is_visible: true,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story update posted successfully',
      });

      setStoryText('');
      setAuthorName('');
      setShowForm(false);
      loadStories();
    } catch (error) {
      console.error('Error posting story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post story update',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (storyId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('story_updates')
        .update({ is_visible: !currentVisibility })
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: currentVisibility ? 'Story hidden from public' : 'Story made visible to public',
      });

      loadStories();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update story visibility',
      });
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('story_updates')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story deleted successfully',
      });

      loadStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete story',
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const remainingChars = MAX_STORY_LENGTH - storyText.length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <CardTitle>Story Stream</CardTitle>
            <Badge variant="secondary">{stories.length}</Badge>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            size="sm"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Story Form */}
        {showForm && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author-name">Your Name (Optional)</Label>
                <Input
                  id="author-name"
                  placeholder="e.g., Foster Mom Sarah, Owner"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story-text">
                  Story Update *
                  <span className={`ml-2 text-sm ${remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {remainingChars} characters left
                  </span>
                </Label>
                <Textarea
                  id="story-text"
                  placeholder="Share an update about your pet... (e.g., 'Bailey learned to sit today! 🐾')"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitStory}
                  disabled={submitting || !storyText.trim() || remainingChars < 0}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Story'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stories List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl block mb-2">📖</span>
            <p>No story updates yet</p>
            <p className="text-sm mt-1">Share your pet's journey with the world!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id} className={!story.is_visible ? 'opacity-60 border-dashed' : ''}>
                <CardContent className="pt-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-foreground">
                        {story.author_name || 'Story Update'}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(story.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!story.is_visible && (
                        <Badge variant="outline" className="text-xs">
                          Hidden
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(story.id, story.is_visible)}
                        title={story.is_visible ? 'Hide from public' : 'Make visible'}
                      >
                        {story.is_visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete story">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Story</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this story? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStory(story.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Story Text */}
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {story.story_text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryStreamManager;
