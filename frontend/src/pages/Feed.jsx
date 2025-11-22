import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, Flame, Award, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import PostCard from '../components/feed/PostCard.jsx'

export default function Feed() {
  const [user, setUser] = useState(null)
  const [reels, setReels] = useState([])
  const [likedReels, setLikedReels] = useState(new Set())

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await client.auth.getMe();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, [])

  // Fetch actual posts from database
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'feed'],
    queryFn: async () => {
      const allPosts = await client.entities.Post.list('-created_at');
      // Filter to show only public posts or friends posts (if user has friends)
      // Exclude posts that belong to communities (community_id is set)
      return allPosts.filter(post => 
        (post.visibility === 'public' || post.visibility === 'friends') &&
        !post.community_id // Only show posts that are NOT in a community
      );
    },
    refetchInterval: 3000 // Refetch every 3 seconds to catch new posts
  });

  useEffect(() => {
    // Generate fake reels data
    const generateFakeReels = () => {
      const fakeData = [
        {
          id: 1,
          author: 'Sarah Chen',
          avatar: '👩‍⚕️',
          content: 'Just hit my daily protein goal! 💪 Started my fitness journey 2 months ago and already seeing amazing results.',
          image: '🥗',
          stats: {
            calories: 1850,
            protein: 145,
            goal: 'Lose Weight'
          },
          likes: 342,
          comments: 28,
          timestamp: '2 hours ago'
        },
        {
          id: 2,
          author: 'Mike Johnson',
          avatar: '💪',
          content: 'Meal prep Sunday! Cooked 10 meals for the week. Consistency is key to hitting your fitness goals! 🎯',
          image: '🍱',
          stats: {
            calories: 2150,
            protein: 165,
            goal: 'Gain Muscle'
          },
          likes: 512,
          comments: 45,
          timestamp: '4 hours ago'
        },
        {
          id: 3,
          author: 'Emma Wilson',
          avatar: '🏃‍♀️',
          content: 'Finally fitting into my goal jeans! 🎉 6 months of dedication paying off. Never give up on yourself!',
          image: '👖',
          stats: {
            calories: 1650,
            protein: 120,
            goal: 'Lose Weight'
          },
          likes: 789,
          comments: 67,
          timestamp: '6 hours ago'
        },
        {
          id: 4,
          author: 'Alex Rodriguez',
          avatar: '🥇',
          content: 'Personal best today! Crushed my workout and nailed my macros. The grind never stops 🔥',
          image: '💯',
          stats: {
            calories: 2300,
            protein: 180,
            goal: 'Gain Muscle'
          },
          likes: 456,
          comments: 34,
          timestamp: '8 hours ago'
        },
        {
          id: 5,
          author: 'Jessica Park',
          avatar: '🧘‍♀️',
          content: 'Fitness is not just about the destination, it\'s about the journey and the healthy habits you build! 🌟',
          image: '🏋️',
          stats: {
            calories: 1750,
            protein: 130,
            goal: 'Maintain'
          },
          likes: 623,
          comments: 52,
          timestamp: '10 hours ago'
        },
        {
          id: 6,
          author: 'David Kim',
          avatar: '🎯',
          content: 'Down 15 lbs this month! Tracking calories and staying consistent is everything. You got this! 💯',
          image: '📊',
          stats: {
            calories: 1600,
            protein: 125,
            goal: 'Lose Weight'
          },
          likes: 567,
          comments: 41,
          timestamp: '12 hours ago'
        }
      ]
      return fakeData
    }

    setReels(generateFakeReels())
  }, [])

  const toggleLike = (id) => {
    const newLiked = new Set(likedReels)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLikedReels(newLiked)
  }

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'Lose Weight':
        return 'from-orange-400 to-red-500'
      case 'Gain Muscle':
        return 'from-blue-400 to-purple-500'
      case 'Maintain':
        return 'from-green-400 to-teal-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
          <p className="text-gray-600">See what others are achieving</p>
        </div>

        {/* Actual Posts from Database */}
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              user && <PostCard key={post.id} post={post} currentUser={user} />
            ))}
          </div>
        ) : null}

        {/* Fake Reels Feed (for demo purposes) */}
        {reels.map((reel) => (
          <Card key={reel.id} className="border-2 shadow-lg overflow-hidden">
            {/* Reel Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{reel.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{reel.author}</p>
                    <p className="text-xs text-gray-500">{reel.timestamp}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGoalColor(reel.stats.goal)}`}>
                  {reel.stats.goal}
                </span>
              </div>
            </CardHeader>

            {/* Reel Content */}
            <CardContent className="p-4 space-y-4">
              {/* Text Content */}
              <p className="text-gray-800 text-lg leading-relaxed">{reel.content}</p>

              {/* Image/Emoji */}
              <div className="text-6xl text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                {reel.image}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-gray-600">Calories</p>
                  </div>
                  <p className="font-bold text-emerald-600">{reel.stats.calories}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-gray-600">Protein</p>
                  </div>
                  <p className="font-bold text-blue-600">{reel.stats.protein}g</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-gray-600">Goal</p>
                  </div>
                  <p className="font-bold text-purple-600 text-sm">{reel.stats.goal}</p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex gap-4 py-3 border-t border-b border-gray-200 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {likedReels.has(reel.id) ? reel.likes + 1 : reel.likes} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {reel.comments} comments
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="ghost"
                  className={`gap-2 ${likedReels.has(reel.id) ? 'text-red-500' : 'text-gray-600'}`}
                  onClick={() => toggleLike(reel.id)}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={likedReels.has(reel.id) ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm">{likedReels.has(reel.id) ? 'Liked' : 'Like'}</span>
                </Button>
                <Button variant="ghost" className="gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Comment</span>
                </Button>
                <Button variant="ghost" className="gap-2 text-gray-600">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More */}
        <div className="flex justify-center py-4">
          <Button variant="outline" className="w-full max-w-xs">
            Load More
          </Button>
        </div>
      </div>
    </div>
  )
}