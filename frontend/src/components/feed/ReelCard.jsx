import React, { useState } from 'react';
import { client } from '@/api/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ReelCard({ post, currentUser, isActive }) {
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

  return (
    <div className="relative h-full w-full bg-black">
      {/* Background Image/Media */}
      {post.media_url && post.media_type === 'photo' ? (
        <div className="absolute inset-0">
          <img
            src={post.media_url}
            alt="Post media"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-900" />
      )}

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
        {/* Top Section - User Info */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={post.user_avatar} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500">
              {post.user_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-white drop-shadow-lg">{post.user_name}</p>
            <p className="text-xs text-white/80 drop-shadow">
              {format(new Date(post.created_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Bottom Section - Caption & Actions */}
        <div className="flex gap-4">
          {/* Caption */}
          <div className="flex-1 pb-2">
            <p className="text-white drop-shadow-lg font-medium mb-2">{post.user_name}</p>
            <p className="text-white/90 drop-shadow text-sm line-clamp-3">
              {post.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 items-center justify-end pb-2">
            <button
              onClick={() => likeMutation.mutate()}
              className="flex flex-col items-center gap-1 transition-transform active:scale-110"
            >
              <div className={`p-3 rounded-full ${isLiked ? 'bg-red-500/20' : 'bg-black/30'} backdrop-blur-sm`}>
                <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </div>
              <span className="text-xs font-semibold drop-shadow">{likes.length}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1 transition-transform active:scale-110"
            >
              <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-semibold drop-shadow">{post.comments_count || 0}</span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform active:scale-110">
              <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[60vh] overflow-y-auto p-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-900 mb-4">Comments</h3>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
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
                  <div className="flex-1 bg-gray-100 rounded-2xl p-3">
                    <p className="text-xs font-semibold text-gray-900">{comment.user_name}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}