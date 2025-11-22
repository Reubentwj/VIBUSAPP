// Script to create fake communities in localStorage
// Run this in the browser console or import into your app

const communities = [
  {
    id: Date.now(),
    name: "We Love Japanese Food",
    description: "A community for Japanese food enthusiasts! Share your favorite sushi, ramen, and other delicious Japanese dishes.",
    creator_email: "foodie@example.com",
    cover_image: "",
    members_count: 42,
    visibility: "public",
    moderators: ["foodie@example.com"],
    created_at: new Date().toISOString()
  },
  {
    id: Date.now() + 1,
    name: "Chinese Grubbers",
    description: "Calling all Chinese food lovers! From dim sum to hot pot, share your Chinese food adventures here.",
    creator_email: "grubber@example.com",
    cover_image: "",
    members_count: 38,
    visibility: "public",
    moderators: ["grubber@example.com"],
    created_at: new Date().toISOString()
  }
]

// Get existing communities from localStorage
const existingCommunities = JSON.parse(localStorage.getItem('communities') || '[]')

// Add new communities
const updatedCommunities = [...existingCommunities, ...communities]

// Save back to localStorage
localStorage.setItem('communities', JSON.stringify(updatedCommunities))

console.log('✅ Successfully created 2 communities:')
console.log('1. We Love Japanese Food')
console.log('2. Chinese Grubbers')
console.log('\nTotal communities:', updatedCommunities.length)
