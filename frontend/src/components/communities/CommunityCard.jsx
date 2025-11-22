import React from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Globe, UserPlus, Check } from 'lucide-react';

export default function CommunityCard({ community, isMember, userEmail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: async () => {
      await client.entities.CommunityMembership.create({
        community_id: community.id,
        user_email: userEmail,
        role: 'member',
        joined_date: new Date().toISOString().split('T')[0]
      });

      // Update members count
      await client.entities.Community.update(community.id, {
        members_count: (community.members_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['isMember'] });
      queryClient.invalidateQueries({ queryKey: ['communityMembers'] });
    }
  });

  const handleCardClick = () => {
    navigate(`/communities/${community.id}`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    joinMutation.mutate();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all border-2 hover:border-emerald-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {community.visibility === 'public' ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {community.name}
        </h3>
        
        {community.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {community.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{community.members_count || 0} members</span>
          </div>

          {!isMember ? (
            <Button
              size="sm"
              onClick={handleJoinClick}
              disabled={joinMutation.isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {joinMutation.isLoading ? (
                'Joining...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Join
                </>
              )}
            </Button>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              Joined
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}