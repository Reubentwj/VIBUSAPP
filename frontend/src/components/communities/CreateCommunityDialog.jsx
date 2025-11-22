import React, { useState } from 'react';
import { client } from '@/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateCommunityDialog({ open, onClose, user }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const queryClient = useQueryClient();

  const createCommunityMutation = useMutation({
    mutationFn: async (communityData) => {
      const community = await client.entities.Community.create(communityData);
      
      // Create creator membership
      await client.entities.CommunityMembership.create({
        community_id: community.id,
        user_email: user.email,
        role: 'creator',
        joined_date: new Date().toISOString().split('T')[0]
      });
      
      return community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
      handleClose();
    }
  });

  const handleClose = () => {
    setName('');
    setDescription('');
    setVisibility('public');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await createCommunityMutation.mutateAsync({
      name,
      description,
      visibility,
      creator_email: user.email,
      members_count: 1,
      moderators: [user.email]
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Keto Enthusiasts, Gym Bros, New Moms..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is your community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can join</SelectItem>
                <SelectItem value="private">Private - Approval required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> As the creator, you can appoint moderators to help manage 
              the community and its leaderboards.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || createCommunityMutation.isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {createCommunityMutation.isLoading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}