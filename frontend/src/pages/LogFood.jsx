import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { client } from '@/api/client'
import { createPageUrl } from '@/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, Search, Upload, CheckCircle, X, Globe, Users, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'

import PhotoUpload from '../components/logfood/PhotoUpload.jsx'
import ManualEntry from '../components/logfood/ManualEntry.jsx'
import FoodSearch from '../components/logfood/FoodSearch.jsx'

export default function LogFood() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('photo')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState(null)
  const [currentFood, setCurrentFood] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [postLocation, setPostLocation] = useState('')
  const [postCaption, setPostCaption] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [user, setUser] = useState(null)
  const [showCaptionDialog, setShowCaptionDialog] = useState(false)
  const [pendingVisibility, setPendingVisibility] = useState(null)

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

  const handleLogFood = async (foodData, base64Image) => {
    setIsProcessing(true)
    setMessage(null)
    
    try {
      console.log('📝 Food detected:', foodData)
      
      // Store the food data and image for the review screen
      setCurrentFood(foodData)
      setImageData(base64Image)
      setIsProcessing(false)
      
    } catch (error) {
      console.error('❌ Error:', error)
      setMessage({
        type: 'error',
        text: '❌ Error processing food. Try again.'
      })
      setIsProcessing(false)
    }
  }

  const handlePostButtonClick = (visibility) => {
    // For public or friends, show caption dialog first
    if (visibility === 'public' || visibility === 'friends') {
      setPendingVisibility(visibility)
      setShowCaptionDialog(true)
    } else {
      // For private, just log it directly
      handlePostFood('private')
    }
  }

  const handleCaptionSubmit = () => {
    if (!postCaption.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a caption before posting'
      })
      return
    }
    setShowCaptionDialog(false)
    handlePostFood(pendingVisibility)
  }

  const handlePostFood = async (visibility) => {
    setIsPosting(true)
    setMessage(null)
    
    try {
      console.log(`📤 Posting ${visibility}:`, currentFood)
      
      // Create food log entry
      const foodLog = {
        ...currentFood,
        log_date: format(new Date(), 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        id: Date.now(),
        user_email: user?.email || 'testuser',
        location: postLocation || null,
        image: imageData
      }
      
      // Save to localStorage
      const savedLog = await client.entities.FoodLog.create(foodLog)
      console.log('✅ Food logged successfully:', savedLog)
      
      // Only create a post if visibility is 'public' or 'friends'
      if (visibility === 'public' || visibility === 'friends') {
        const postContent = postCaption.trim() || `Just logged ${currentFood.food_name}! ${currentFood.calories} cal • ${currentFood.protein_g}g protein${postLocation ? ` • From ${postLocation}` : ''}`
        
        const postData = {
          user_email: user?.email || 'testuser',
          user_name: user?.full_name || user?.email || 'User',
          user_avatar: user?.avatar_url || null,
          content: postContent,
          media_url: imageData || null,
          media_type: imageData ? 'photo' : 'none',
          visibility: visibility, // 'public' or 'friends'
          likes_count: 0,
          comments_count: 0,
          created_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
        
        const createdPost = await client.entities.Post.create(postData)
        console.log('✅ Post created successfully:', createdPost)
        
        // Invalidate posts query to refresh Feed
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        
        // Show success message
        setMessage({
          type: 'success',
          text: `✅ Posted! ${currentFood.food_name} logged and shared!`
        })
      } else {
        // Private - just log it, no post
        setMessage({
          type: 'success',
          text: `✅ ${currentFood.food_name} logged privately!`
        })
      }
      
      // Reset and go back to photo tab after 2 seconds
      setTimeout(() => {
        setCurrentFood(null)
        setImageData(null)
        setPostLocation('')
        setPostCaption('')
        setShowCaptionDialog(false)
        setPendingVisibility(null)
        setActiveTab('photo')
        setMessage(null)
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error posting food:', error)
      setMessage({
        type: 'error',
        text: '❌ Error posting food. Try again.'
      })
    } finally {
      setIsPosting(false)
    }
  }


  // Show post/share screen when food is detected
  if (currentFood) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentFood(null)
                  setImageData(null)
                  setPostLocation('')
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Review & Share</h1>
            <p className="text-gray-600">Check the details and decide who sees this</p>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div>
              <Card className="shadow-2xl border-2 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <CardTitle>Your Meal</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {imageData && (
                    <img
                      src={imageData}
                      alt="Meal"
                      className="w-full h-96 object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Details & Options */}
            <div className="space-y-4">
              {/* Nutrition Card */}
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardTitle>Nutrition Info</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="font-bold text-emerald-600 text-lg">{currentFood.calories}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="font-bold text-blue-600 text-lg">{currentFood.protein_g}g</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="font-bold text-orange-600 text-lg">{currentFood.carbs_g}g</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-gray-600">Fats</p>
                      <p className="font-bold text-purple-600 text-lg">{currentFood.fats_g}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Food Details Card */}
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle>Food Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Food Name</Label>
                    <Input
                      value={currentFood.food_name}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Location (Where you bought it)
                    </Label>
                    <Input
                      placeholder="e.g., Whole Foods, McDonald's, Home cooked..."
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  {currentFood.confidence_percent && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600">AI Confidence</p>
                      <p className="font-bold text-blue-600">{currentFood.confidence_percent.toFixed(1)}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Share Options */}
              <Card className="shadow-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg">Share This Meal?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handlePostButtonClick('public')}
                    disabled={isPosting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  >
                    <Globe className="w-5 h-5" />
                    {isPosting ? 'Posting...' : 'Post Publicly'}
                  </Button>

                  <Button
                    onClick={() => handlePostButtonClick('friends')}
                    disabled={isPosting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  >
                    <Users className="w-5 h-5" />
                    {isPosting ? 'Posting...' : 'Post to Friends Only'}
                  </Button>

                  <Button
                    onClick={() => handlePostButtonClick('private')}
                    disabled={isPosting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  >
                    {isPosting ? 'Logging...' : 'Just Log It (Private)'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Caption Dialog */}
        <Dialog open={showCaptionDialog} onOpenChange={setShowCaptionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a Caption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="What's on your mind? Share your meal experience..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCaptionDialog(false)
                    setPendingVisibility(null)
                    setPostCaption('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCaptionSubmit}
                  disabled={!postCaption.trim() || isPosting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Normal photo/search/manual entry screen
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Log Your Food</h1>
          <p className="text-gray-600">Take a photo, search, or manually enter what you ate</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Input Form */}
        <Card className="shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle>Add a Meal</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="photo" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photo">
                <PhotoUpload onSubmit={handleLogFood} isProcessing={isProcessing} />
              </TabsContent>

              <TabsContent value="search">
                <FoodSearch onSubmit={handleLogFood} isProcessing={isProcessing} />
              </TabsContent>

              <TabsContent value="manual">
                <ManualEntry onSubmit={handleLogFood} isProcessing={isProcessing} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}