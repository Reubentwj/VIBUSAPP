import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '@/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, ArrowLeft, Shield, Info, UserPlus, Check } from 'lucide-react';
import CreateCommunityPostDialog from '../components/communities/CreateCommunityPostDialog.jsx';
import PostCard from '../components/feed/PostCard.jsx';

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await client.auth.getMe();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: community, isLoading: communityLoading, error: communityError } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      if (!id) return null;
      // Try to get by ID
      let found = await client.entities.Community.getById(id);
      
      // If not found, try to find by listing all and matching
      if (!found) {
        console.log('⚠️ Not found by ID, trying to list all communities');
        const allCommunities = await client.entities.Community.list();
        found = allCommunities.find(c => {
          const cId = String(c.id);
          const searchId = String(id);
          return cId === searchId || c.id === parseInt(id) || c.id === id;
        });
      }
      
      console.log('🔍 Community query result:', found, 'for id:', id);
      return found || null;
    },
    enabled: !!id,
    retry: 1
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', id],
    queryFn: async () => {
      if (!id) return [];
      // Filter posts by community_id
      return await client.entities.Post.filter({ community_id: id });
    },
    enabled: !!id,
    initialData: [],
    refetchInterval: 3000 // Refetch every 3 seconds to catch new posts
  });

  const { data: isMember, refetch: refetchMembership } = useQuery({
    queryKey: ['isMember', id, user?.email],
    queryFn: async () => {
      if (!user || !id) return false;
      const memberships = await client.entities.CommunityMembership.filter({
        community_id: id,
        user_email: user.email
      });
      return memberships.length > 0;
    },
    enabled: !!user && !!id,
    initialData: false
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) return;
      
      await client.entities.CommunityMembership.create({
        community_id: id,
        user_email: user.email,
        role: 'member',
        joined_date: new Date().toISOString().split('T')[0]
      });

      // Update members count
      await client.entities.Community.update(id, {
        members_count: (community?.members_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['isMember', id, user?.email] });
      queryClient.invalidateQueries({ queryKey: ['communityMembers', id] });
      refetchMembership();
    }
  });

  const { data: members } = useQuery({
    queryKey: ['communityMembers', id],
    queryFn: async () => {
      if (!id) return [];
      return await client.entities.CommunityMembership.filter({ community_id: id });
    },
    enabled: !!id,
    initialData: []
  });

  if (communityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!community && !communityLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community not found</h2>
          <p className="text-gray-600 mb-4">The community with ID "{id}" could not be found.</p>
          <Button onClick={() => navigate('/communities')} className="bg-gradient-to-r from-emerald-500 to-teal-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
        </Card>
      </div>
    );
  }

  if (!community) {
    return null; // Still loading or error
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/communities')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Button>

        {/* Community Header */}
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardTitle className="text-3xl lg:text-4xl">{community.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">About</h2>
              </div>
              <p className="text-gray-700">
                {community.description || 'No description available for this community.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-lg font-bold text-gray-900">
                    {community.members_count || (members && members.length) || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Moderators</p>
                  <p className="text-lg font-bold text-gray-900">
                    {community.moderators && community.moderators.length > 0 ? community.moderators.length : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Moderators List */}
            {community.moderators && community.moderators.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Moderators
                </h3>
                <div className="flex flex-wrap gap-2">
                  {community.moderators.map((modEmail, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {modEmail}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members List (if available) */}
            {members && members.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members ({members.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.slice(0, 10).map((member, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {member.user_email}
                    </span>
                  ))}
                  {members.length > 10 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                      +{members.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Join/Leave Button */}
            {user && (
              <div className="pt-4 border-t">
                {!isMember ? (
                  <Button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {joinMutation.isLoading ? (
                      'Joining...'
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Join Community
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">You're a member</span>
                    </div>
                    <Button
                      onClick={() => setShowCreatePostDialog(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Post
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Section */}
        {isMember ? (
          <div className="space-y-4">
            {postsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
                  <Button
                    onClick={() => setShowCreatePostDialog(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Post
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUser={user} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join to see posts</h3>
              <p className="text-gray-600 mb-4">Join this community to view and create posts!</p>
              <Button
                onClick={() => navigate('/communities')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                Go to Communities
              </Button>
            </div>
          </Card>
        )}
      </div>

      {user && community && (
        <CreateCommunityPostDialog
          open={showCreatePostDialog}
          onClose={() => setShowCreatePostDialog(false)}
          user={user}
          community={community}
        />
      )}
    </div>
  );
}

