class APIClient {
  constructor() {
    this.auth = {
      updateMe: async (data) => {
        console.log('💾 Saving user data:', data)
        const existingUser = localStorage.getItem('user_data')
        const userData = existingUser ? JSON.parse(existingUser) : {}
        const updatedUser = { ...userData, ...data }
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
        console.log('✅ User data saved:', updatedUser)
        return updatedUser
      },
      getMe: async () => {
        console.log('🔍 Fetching user data...')
        const stored = localStorage.getItem('user_data')
        if (stored) {
          const user = JSON.parse(stored)
          console.log('✅ User found:', user)
          return user
        }
        console.log('❌ No user found')
        return null
      },
      me: async () => {
        console.log('🔍 Fetching user data (me)...')
        const stored = localStorage.getItem('user_data')
        if (stored) {
          const user = JSON.parse(stored)
          console.log('✅ User found:', user)
          return user
        }
        console.log('❌ No user found')
        return null
      }
    }
    
    this.entities = {
      FoodLog: {
        create: async (data) => {
          console.log('📝 Creating food log:', data)
          const logs = JSON.parse(localStorage.getItem('food_logs') || '[]')
          const newLog = { 
            ...data, 
            id: Date.now(), 
            created_at: new Date().toISOString() 
          }
          logs.push(newLog)
          localStorage.setItem('food_logs', JSON.stringify(logs))
          console.log('✅ Food log saved to database')
          return newLog
        },
        list: async () => {
          console.log('📋 Fetching food logs')
          return JSON.parse(localStorage.getItem('food_logs') || '[]')
        },
        filter: async (filter, sort) => {
          console.log('🔍 Filtering food logs:', filter)
          const logs = JSON.parse(localStorage.getItem('food_logs') || '[]')
          return logs.filter(log => {
            for (let key in filter) {
              if (log[key] !== filter[key]) return false
            }
            return true
          })
        },
        getByUser: async (userEmail) => {
          console.log('👤 Fetching logs for user:', userEmail)
          const logs = JSON.parse(localStorage.getItem('food_logs') || '[]')
          return logs.filter(log => log.user_email === userEmail)
        },
        getToday: async (userEmail) => {
          console.log('📅 Fetching today\'s logs for user:', userEmail)
          const logs = JSON.parse(localStorage.getItem('food_logs') || '[]')
          const today = new Date().toISOString().split('T')[0]
          return logs.filter(log => 
            log.user_email === userEmail && 
            log.log_date === today
          )
        }
      },
      
      User: {
        list: async () => {
          console.log('👥 Fetching users')
          return JSON.parse(localStorage.getItem('users') || '[]')
        },
        filter: async (filter) => {
          console.log('🔍 Filtering users:', filter)
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          return users.filter(user => {
            for (let key in filter) {
              if (user[key] !== filter[key]) return false
            }
            return true
          })
        },
        create: async (data) => {
          console.log('➕ Creating user:', data)
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          const newUser = { ...data, id: Date.now(), created_at: new Date().toISOString() }
          users.push(newUser)
          localStorage.setItem('users', JSON.stringify(users))
          return newUser
        }
      },
      
      Post: {
        list: async (sort) => {
          console.log('📱 Fetching posts')
          return JSON.parse(localStorage.getItem('posts') || '[]')
        },
        filter: async (filter) => {
          console.log('🔍 Filtering posts:', filter)
          const posts = JSON.parse(localStorage.getItem('posts') || '[]')
          return posts.filter(post => {
            for (let key in filter) {
              // Handle ID matching for community_id (string/number comparison)
              if (key === 'community_id') {
                const postCommunityId = post.community_id ? String(post.community_id) : null;
                const filterCommunityId = filter[key] ? String(filter[key]) : null;
                if (postCommunityId !== filterCommunityId && 
                    post.community_id !== filter[key] && 
                    post.community_id !== parseInt(filter[key])) {
                  return false;
                }
              } else if (post[key] !== filter[key]) {
                return false;
              }
            }
            return true;
          })
        },
        create: async (data) => {
          console.log('✍️ Creating post:', data)
          const posts = JSON.parse(localStorage.getItem('posts') || '[]')
          const newPost = { ...data, id: Date.now(), created_at: new Date().toISOString() }
          posts.push(newPost)
          localStorage.setItem('posts', JSON.stringify(posts))
          return newPost
        }
      },
      
      Community: {
        list: async (sort) => {
          console.log('👨‍👩‍👧‍👦 Fetching communities')
          return JSON.parse(localStorage.getItem('communities') || '[]')
        },
        filter: async (filter) => {
          console.log('🔍 Filtering communities:', filter)
          const communities = JSON.parse(localStorage.getItem('communities') || '[]')
          return communities.filter(c => {
            for (let key in filter) {
              if (c[key] !== filter[key]) return false
            }
            return true
          })
        },
        getById: async (id) => {
          console.log('🔍 Getting community by id:', id)
          const communities = JSON.parse(localStorage.getItem('communities') || '[]')
          // Try to match by string or number
          const community = communities.find(c => {
            const cId = String(c.id);
            const searchId = String(id);
            return cId === searchId || c.id === parseInt(id) || c.id === id;
          })
          console.log('🔍 Found community:', community)
          return community || null
        },
        create: async (data) => {
          console.log('➕ Creating community:', data)
          const communities = JSON.parse(localStorage.getItem('communities') || '[]')
          const newCommunity = { ...data, id: Date.now(), members_count: data.members_count || 1, created_at: new Date().toISOString() }
          communities.push(newCommunity)
          localStorage.setItem('communities', JSON.stringify(communities))
          return newCommunity
        },
        update: async (id, data) => {
          console.log('✏️ Updating community:', id, data)
          const communities = JSON.parse(localStorage.getItem('communities') || '[]')
          const index = communities.findIndex(c => {
            const cId = String(c.id);
            const searchId = String(id);
            return cId === searchId || c.id === parseInt(id) || c.id === id;
          })
          if (index !== -1) {
            communities[index] = { ...communities[index], ...data }
            localStorage.setItem('communities', JSON.stringify(communities))
            return communities[index]
          }
          return null
        }
      },
      
      CommunityMembership: {
        filter: async (filter) => {
          console.log('🔍 Filtering memberships:', filter)
          const memberships = JSON.parse(localStorage.getItem('community_memberships') || '[]')
          return memberships.filter(m => {
            for (let key in filter) {
              if (m[key] !== filter[key]) return false
            }
            return true
          })
        },
        create: async (data) => {
          console.log('➕ Adding to community:', data)
          const memberships = JSON.parse(localStorage.getItem('community_memberships') || '[]')
          const newMembership = { ...data, id: Date.now(), created_at: new Date().toISOString() }
          memberships.push(newMembership)
          localStorage.setItem('community_memberships', JSON.stringify(memberships))
          return newMembership
        }
      },
      
      Friendship: {
        filter: async (filter) => {
          console.log('🔍 Filtering friendships:', filter)
          const friendships = JSON.parse(localStorage.getItem('friendships') || '[]')
          return friendships.filter(f => {
            for (let key in filter) {
              if (f[key] !== filter[key]) return false
            }
            return true
          })
        }
      },
      
      DailyChallenge: {
        filter: async (filter) => {
          console.log('🏆 Filtering challenges:', filter)
          return []
        }
      }
    }
  }
}

export const client = new APIClient()