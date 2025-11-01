import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface PodcastEpisodeCardProps {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  duration: string;
  publishDate: string;
  className?: string;
}

export const PodcastEpisodeCard: React.FC<PodcastEpisodeCardProps> = ({
  slug,
  title,
  description,
  coverImage,
  duration,
  publishDate,
  className,
}) => {
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/podcast/${slug}`}>
      <Card 
        className={cn(
          "overflow-hidden border border-border hover:border-brand-primary transition-all duration-300 hover:shadow-lg group",
          className
        )}
      >
        <div className="aspect-square relative overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>
      </Card>
    </Link>
  );
};
