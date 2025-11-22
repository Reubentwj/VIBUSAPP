import React, { useState } from 'react';
import { client } from '@/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, EyeOff, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function PostCard({ post, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const { data: likes } = useQuery({
    queryKey: ['likes', post.id],
    queryFn: async () => {
      return await client.entities.Like.filter({ post_id: post.id });
    },
    initialData: []
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      return await client.entities.Comment.filter({ post_id: post.id }, '-created_date');
    },
    enabled: showComments,
    initialData: []
  });

  const isLiked = likes.some(like => like.user_email === currentUser.email);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        const like = likes.find(l => l.user_email === currentUser.email);
        await client.entities.Like.delete(like.id);
      } else {
        await client.entities.Like.create({
          post_id: post.id,
          user_email: currentUser.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', post.id] });
    }
  });

  const visibilityIcons = {
    public: <Eye className="w-3 h-3" />,
    friends: <Users className="w-3 h-3" />,
    private: <EyeOff className="w-3 h-3" />
  };

  return (
    <Card className="overflow-hidden shadow-lg border-2 hover:shadow-xl transition-all">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.user_avatar} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              {post.user_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{post.user_name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{format(new Date(post.created_date), 'MMM d, yyyy • HH:mm')}</span>
              <Badge variant="outline" className="text-xs">
                {visibilityIcons[post.visibility]}
                <span className="ml-1">{post.visibility}</span>
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

        {post.media_url && post.media_type === 'photo' && (
          <img
            src={post.media_url}
            alt="Post media"
            className="w-full rounded-xl mb-3 object-cover max-h-96"
          />
        )}
      </div>

      <div className="px-4 py-3 border-t-2 border-gray-100 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => likeMutation.mutate()}
          className={`gap-2 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} />
          <span>{likes.length}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2 text-gray-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || 0}</span>
        </Button>
      </div>

      {showComments && (
        <div className="px-4 py-3 border-t-2 border-gray-100 bg-gray-50">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                      {comment.user_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white rounded-lg p-2 border">
                    <p className="text-xs font-semibold text-gray-900">{comment.user_name}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}