import React, { useState, useRef } from 'react';
import { client } from '@/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, X } from 'lucide-react';

export default function CreatePostDialog({ open, onClose, user }) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      return await client.entities.Post.create(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      handleClose();
    }
  });

  const handleClose = () => {
    setContent('');
    setVisibility('public');
    setMediaFile(null);
    setMediaPreview(null);
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsUploading(true);
    try {
      let media_url = null;
      let media_type = 'none';

      if (mediaFile) {
        const { file_url } = await client.integrations.Core.UploadFile({ file: mediaFile });
        media_url = file_url;
        media_type = mediaFile.type.startsWith('image/') ? 'photo' : 'video';
      }

      await createPostMutation.mutateAsync({
        content,
        visibility,
        media_url,
        media_type,
        user_email: user.email,
        user_name: user.full_name || user.email,
        user_avatar: user.avatar_url
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setIsUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Share your progress, meals, or fitness journey..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />

          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
              <img src={mediaPreview} alt="Preview" className="w-full h-64 object-cover" />
              <button
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex-1">
              <Label className="text-sm text-gray-600">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isUploading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {isUploading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}