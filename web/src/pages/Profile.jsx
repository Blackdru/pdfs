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
      <div className="min-h-screen bg-grey-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
      <div className="layout-dark-container py-12">
        <div className="text-center mb-12">
          <h1 className="heading-dark-1 text-gradient-hero">Profile Settings</h1>
          <p className="body-dark-large text-grey-300 mt-4">
            Manage your account settings and view your activity
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="tab-dark-list">
            <TabsTrigger value="profile" className="tab-dark-button">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="tab-dark-button">
              <Activity className="mr-2 h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="history" className="tab-dark-button">
              <Calendar className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card className="dark-card">
              <CardHeader>
                <CardTitle className="heading-dark-4 text-grey-100">Personal Information</CardTitle>
                <CardDescription className="text-grey-400">
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-grey-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={profile.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="dark-input pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-grey-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="dark-input pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="btn-blue">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="dark-card border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-grey-400">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full md:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
                <p className="text-sm text-grey-400 mt-2">
                  This action cannot be undone. All your files and data will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dark-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-grey-200">Total Files</CardTitle>
                  <Files className="h-4 w-4 text-grey-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{stats.totalFiles}</div>
                  <p className="text-xs text-grey-400">
                    {stats.filesLimit - stats.totalFiles} remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="dark-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-grey-200">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-grey-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{formatFileSize(stats.totalStorage)}</div>
                  <p className="text-xs text-grey-400">
                    of {formatFileSize(stats.storageLimit)} used
                  </p>
                </CardContent>
              </Card>

              <Card className="dark-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-grey-200">Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-grey-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{stats.recentActivity}</div>
                  <p className="text-xs text-grey-400">
                    operations this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="history">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle className="heading-dark-4 text-grey-100">Recent Activity</CardTitle>
              <CardDescription className="text-grey-400">
                Your recent file operations and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-grey-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-grey-200">No activity yet</h3>
                  <p className="text-grey-400">
                    Your file operations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-grey-800 rounded-xl bg-grey-800"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div>
                          <p className="font-medium capitalize text-grey-200">
                            {item.action} operation
                          </p>
                          <p className="text-sm text-grey-400">
                            {item.files?.filename || 'File operation'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-grey-400">
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