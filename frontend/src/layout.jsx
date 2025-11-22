import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { client } from '@/api/client'
import { useQuery } from '@tanstack/react-query'
import {
  Home,
  Camera,
  TrendingUp,
  Users,
  Trophy
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigationItems = [
  { title: 'Dashboard', url: createPageUrl('Dashboard'), icon: Home },
  { title: 'Log Food', url: createPageUrl('LogFood'), icon: Camera },
  { title: 'Leaderboards', url: createPageUrl('Leaderboards'), icon: Trophy },
  { title: 'Feed', url: createPageUrl('Feed'), icon: TrendingUp },
  { title: 'Communities', url: createPageUrl('Communities'), icon: Users },
]

export default function Layout({ children, currentPageName }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch community name if on community detail page
  const { data: community } = useQuery({
    queryKey: ['community', params.id],
    queryFn: async () => {
      if (currentPageName === 'CommunityDetail' && params.id) {
        return await client.entities.Community.getById(params.id);
      }
      return null;
    },
    enabled: currentPageName === 'CommunityDetail' && !!params.id
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get user from localStorage via client
        const userData = await client.auth.getMe()
        console.log('📋 User check result:', userData)
        
        setUser(userData || null)
        
        // If no user and not on onboarding, go to onboarding
        if (!userData && currentPageName !== 'Onboarding') {
          console.log('🚀 No user, redirecting to onboarding')
          navigate(createPageUrl('Onboarding'))
        }
        
        // If user exists but hasn't completed onboarding, go to onboarding
        if (userData && !userData.onboarding_completed && currentPageName !== 'Onboarding') {
          console.log('⏳ Onboarding not complete, redirecting')
          navigate(createPageUrl('Onboarding'))
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        if (currentPageName !== 'Onboarding') {
          navigate(createPageUrl('Onboarding'))
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [currentPageName, navigate])

  // If onboarding page, show full screen
  if (currentPageName === 'Onboarding') {
    return children
  }

  // Show loading while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  // If no user after loading, show loading (will redirect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  // Show layout with user
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9" />

          <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent absolute left-1/2 transform -translate-x-1/2">
            {currentPageName === 'LogFood' && 'Post'}
            {currentPageName === 'Leaderboards' && 'Leaderboards'}
            {currentPageName === 'Feed' && 'For You'}
            {currentPageName === 'Communities' && 'Groups'}
            {currentPageName === 'CommunityDetail' && (community?.name || 'Community')}
            {!['LogFood', 'Leaderboards', 'Feed', 'Communities', 'CommunityDetail'].includes(currentPageName) && 'Vibus'}
          </h1>

          <Link to={createPageUrl('Profile')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 lg:pb-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center justify-center py-3 px-1 rounded-lg transition-all ${
                location.pathname === item.url
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}