import React, { useState, useEffect } from 'react';
import { client } from '@/api/client'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CreateCommunityDialog from '../components/communities/CreateCommunityDialog.jsx';
import CommunityCard from '../components/communities/CommunityCard.jsx';

export default function Communities() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await client.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Initialize fake communities
  useEffect(() => {
    const initializeFakeCommunities = async () => {
      try {
        const allCommunities = await client.entities.Community.list();
        
        // Check if communities already exist (case-insensitive)
        const japanExists = allCommunities.some(c => 
          c.name.toLowerCase().includes('japan') || c.name.toLowerCase().includes('japanese')
        );
        const chineseExists = allCommunities.some(c => 
          c.name.toLowerCase().includes('chinese') || c.name.toLowerCase().includes('china')
        );

        // Create "japan food" if it doesn't exist
        if (!japanExists) {
          await client.entities.Community.create({
            name: 'japan food',
            description: 'A community for Japanese food enthusiasts! Share your favorite sushi, ramen, and other delicious Japanese dishes.',
            creator_email: 'admin@example.com',
            members_count: 42,
            visibility: 'public',
            moderators: ['admin@example.com']
          });
          console.log('✅ Created "japan food" community');
        }

        // Create "chinese food" if it doesn't exist
        if (!chineseExists) {
          await client.entities.Community.create({
            name: 'chinese food',
            description: 'Calling all Chinese food lovers! From dim sum to hot pot, share your Chinese food adventures here.',
            creator_email: 'admin@example.com',
            members_count: 38,
            visibility: 'public',
            moderators: ['admin@example.com']
          });
          console.log('✅ Created "chinese food" community');
        }

        // Invalidate queries to refresh the list
        if (!japanExists || !chineseExists) {
          queryClient.invalidateQueries({ queryKey: ['communities'] });
        }
      } catch (error) {
        console.error('❌ Error initializing fake communities:', error);
      }
    };

    initializeFakeCommunities();
  }, [queryClient]);

  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      return await client.entities.Community.list('-members_count');
    },
    initialData: []
  });

  const { data: myMemberships } = useQuery({
    queryKey: ['myMemberships', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await client.entities.CommunityMembership.filter({ user_email: user.email });
    },
    enabled: !!user,
    initialData: []
  });

  const myCommunityIds = myMemberships.map(m => m.community_id);
  const myCommunities = communities.filter(c => myCommunityIds.includes(c.id));
  const otherCommunities = communities.filter(c => !myCommunityIds.includes(c.id));

  const filteredOtherCommunities = otherCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Communities</h1>
            <p className="text-gray-600">Connect with like-minded people on their fitness journey</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Community
          </Button>
        </div>

        {/* My Communities */}
        {myCommunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
              My Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={true}
                  userEmail={user.email}
                />
              ))}
            </div>
          </div>
        )}

        {/* Discover Communities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Discover Communities
            </h2>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOtherCommunities.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No communities found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Be the first to create a community!'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    Create Community
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOtherCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={false}
                  userEmail={user.email}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCommunityDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        user={user}
      />
    </div>
  );
}