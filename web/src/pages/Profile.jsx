import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar,
  Activity,
  HardDrive,
  Files,
  Save,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  })
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [profileResponse, statsResponse, historyResponse] = await Promise.all([
        api.getProfile(),
        api.getUserStats(),
        api.getUserHistory(1, 10)
      ])
      
      setProfile({
        name: profileResponse.user.name || '',
        email: profileResponse.user.email || ''
      })
      setStats(statsResponse.stats)
      setHistory(historyResponse.history)
    } catch (error) {
      toast.error('Failed to load profile data')
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.updateProfile(profile)
      
      // Also update in Supabase Auth if needed
      if (profile.name !== user.user_metadata?.name) {
        await updateProfile({
          data: { name: profile.name }
        })
      }
      
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.'
    )
    
    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )
    
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      await api.deleteAccount()
      toast.success('Account deleted successfully')
      // The auth context will handle the redirect
    } catch (error) {
      toast.error('Failed to delete account')
      console.error('Account deletion error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page mobile-spacing-dark">
      <div className="mobile-container py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="mobile-text-3xl font-bold text-gradient-hero mb-2 sm:mb-4">Profile Settings</h1>
          <p className="mobile-text-base text-card-foreground">
            Manage your account settings and view your activity
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <div className="mobile-overflow-x">
            <TabsList className="inline-flex w-full sm:w-auto min-w-max bg-elevated border border-border rounded-xl p-1">
              <TabsTrigger value="profile" className="mobile-btn-sm mobile-touch-target flex items-center justify-center">
                <User className="mr-1 sm:mr-2 mobile-icon-sm" />
                <span className="text-xs sm:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="mobile-btn-sm mobile-touch-target flex items-center justify-center">
                <Activity className="mr-1 sm:mr-2 mobile-icon-sm" />
                <span className="text-xs sm:text-sm">Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="mobile-btn-sm mobile-touch-target flex items-center justify-center">
                <Calendar className="mr-1 sm:mr-2 mobile-icon-sm" />
                <span className="text-xs sm:text-sm">Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-4 sm:gap-6">
            <Card className="dark-card mobile-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="heading-dark-4 text-foreground text-base sm:text-lg">Personal Information</CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-2 text-card-foreground">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={profile.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="dark-input pl-9 sm:pl-10 text-sm sm:text-base h-10 sm:h-11 mobile-touch-target"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-2 text-card-foreground">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="dark-input pl-9 sm:pl-10 text-sm sm:text-base h-10 sm:h-11 mobile-touch-target"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving} className="btn-blue w-full sm:w-auto mobile-btn mobile-touch-target">
                      <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-sm sm:text-base">{saving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="dark-card border-red-800 mobile-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-red-400 text-base sm:text-lg">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full md:w-auto mobile-btn mobile-touch-target text-sm sm:text-base"
                >
                  <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Delete Account
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  This action cannot be undone. All your files and data will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="dark-card mobile-card-compact">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground truncate">Total Files</CardTitle>
                  <Files className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    {stats.filesLimit - stats.totalFiles} remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="dark-card mobile-card-compact">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground truncate">Storage Used</CardTitle>
                  <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-400 truncate">{formatFileSize(stats.totalStorage)}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    of {formatFileSize(stats.storageLimit)}
                  </p>
                </CardContent>
              </Card>

              <Card className="dark-card mobile-card-compact">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground truncate">Activity</CardTitle>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">{stats.recentActivity}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="history">
          <Card className="dark-card mobile-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="heading-dark-4 text-foreground text-base sm:text-lg">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Your recent file operations and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {history.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Activity className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2 text-card-foreground">No activity yet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your file operations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-xl bg-elevated mobile-touch-target gap-2 sm:gap-0"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize text-card-foreground text-xs sm:text-sm truncate">
                            {item.action} operation
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {item.files?.filename || 'File operation'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground pl-5 sm:pl-0">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

export default Profile