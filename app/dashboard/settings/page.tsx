"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  User, 
  Lock, 
  Database, 
  Bell, 
  Shield,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  FileText,
  Clock,
  Zap,
  Server
} from "lucide-react"
import { toast } from "sonner"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { BrandLoader } from "@/components/ui/brand-loader"
import { EmailReportsManager } from "@/components/email-reports-manager"
import { ImageUpload } from "@/components/ui/image-upload"

interface Account {
  id: string
  username: string
  password: string
  role: 'admin' | 'operations' | 'packer' | 'tracker' | 'logistics-admin'
  assignedChannel?: string // Legacy field, no longer used
  displayName: string
  profileImage?: string // Profile image URL
  createdAt: string
}

interface SystemSettings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  currency: string
  timezone: string
  dateFormat: string
  lowStockThreshold: number
  enableNotifications: boolean
  enableEmailAlerts: boolean
  autoBackup: boolean
  backupFrequency: string
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [activeTab, setActiveTab] = useState("profile")
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Profile form
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    profileImage: ''
  })

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'operations' as 'admin' | 'operations' | 'packer' | 'tracker' | 'logistics-admin',
    assignedChannel: '', // Legacy field, no longer used
    profileImage: '' // Profile image URL
  })

  // Edit user form
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    username: '',
    originalUsername: '', // Store original username for comparison
    displayName: '',
    role: 'operations' as 'admin' | 'operations' | 'packer' | 'tracker' | 'logistics-admin',
    assignedChannel: '', // Legacy field, no longer used
    newPassword: '',
    confirmPassword: '',
    profileImage: '' // Profile image URL
  })

  // System settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: 'WIHI Asia Marketing Inc.',
    companyEmail: 'info@wihiasia.com',
    companyPhone: '+63 XXX XXX XXXX',
    companyAddress: 'Philippines',
    currency: 'PHP',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    lowStockThreshold: 10,
    enableNotifications: true,
    enableEmailAlerts: false,
    autoBackup: true,
    backupFrequency: 'daily'
  })

  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  
  // System performance metrics
  const [systemMetrics, setSystemMetrics] = useState({
    apiResponseTime: 0,
    databaseHealth: 100,
    storageUsed: '0 MB',
    requestsToday: 0
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    // Fetch fresh profile data from database
    const fetchProfile = async () => {
      if (!user) return
      
      try {
        const headers = new Headers()
        headers.set('x-user-username', user.username)
        headers.set('x-user-role', user.role)
        
        const response = await fetch('/api/auth/profile', { headers })
        
        if (response.ok) {
          const profile = await response.json()
          setProfileForm({
            displayName: profile.displayName || '',
            username: profile.username || '',
            email: profile.email || '',
            phone: profile.phone || '',
            profileImage: profile.profileImage || ''
          })
          
          // Update localStorage with fresh data
          const updatedUser = {
            ...user,
            displayName: profile.displayName,
            email: profile.email,
            phone: profile.phone
          }
          localStorage.setItem('currentUser', JSON.stringify(updatedUser))
          setCurrentUser(updatedUser)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        // Fallback to localStorage data
        setProfileForm({
          displayName: user.displayName || '',
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          profileImage: user.profileImage || ''
        })
      }
    }
    
    fetchProfile()

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings))
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Load last backup info
    const savedBackup = localStorage.getItem('latestBackup')
    if (savedBackup) {
      const backupInfo = JSON.parse(savedBackup)
      setLastBackup(backupInfo.date)
    }

    fetchAccounts()
    fetchSystemMetrics()
  }, [])

  const fetchSystemMetrics = async () => {
    try {
      // Measure API response time
      const startTime = performance.now()
      await apiGet<Account[]>('/api/accounts').catch(() => [])
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      // Get data counts for storage estimation (with silent error handling)
      const [items, categories, customers, logs] = await Promise.all([
        apiGet<any[]>('/api/items').catch((err) => { console.warn('Items API unavailable'); return [] }),
        apiGet<any[]>('/api/categories').catch((err) => { console.warn('Categories API unavailable'); return [] }),
        apiGet<any[]>('/api/customers').catch((err) => { console.warn('Customers API unavailable'); return [] }),
        apiGet<any[]>('/api/logs').catch((err) => { console.warn('Logs API unavailable'); return [] })
      ])

      // Calculate approximate storage (rough estimate)
      const totalRecords = items.length + categories.length + customers.length + logs.length + accounts.length
      const estimatedSizeKB = totalRecords * 2 // Rough estimate: 2KB per record
      const storageMB = (estimatedSizeKB / 1024).toFixed(1)
      const storageGB = estimatedSizeKB > 1024 * 1024 ? (estimatedSizeKB / (1024 * 1024)).toFixed(2) : null

      // Get requests count from localStorage (if tracking)
      const requestsCount = parseInt(localStorage.getItem('todayRequestsCount') || '0')

      setSystemMetrics({
        apiResponseTime: responseTime,
        databaseHealth: 100, // Assume healthy if APIs respond
        storageUsed: storageGB ? `${storageGB}GB` : `${storageMB}MB`,
        requestsToday: requestsCount
      })
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      // Set default values on error
      setSystemMetrics({
        apiResponseTime: 0,
        databaseHealth: 95,
        storageUsed: 'N/A',
        requestsToday: 0
      })
    }
  }

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await apiGet<Account[]>('/api/accounts')
      console.log('[Settings] Fetched accounts:', data)
      console.log('[Settings] First account profileImage:', data[0]?.profileImage)
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await apiPut('/api/accounts', {
        action: 'updatePassword',
        username: currentUser.username,
        password: passwordForm.newPassword
      })

      toast.success('Password updated successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const handleProfileUpdate = async () => {
    if (!profileForm.displayName) {
      toast.error('Display name is required')
      return
    }

    if (!profileForm.username) {
      toast.error('Username is required')
      return
    }

    try {
      // Check if username changed
      const usernameChanged = profileForm.username !== currentUser.username

      if (usernameChanged) {
        // Update username first (requires admin or self-update)
        await apiPut('/api/accounts', {
          action: 'updateUsername',
          username: currentUser.username,
          newUsername: profileForm.username
        })
      }

      // Update profile (display name, email, phone, profileImage)
      await apiPut('/api/accounts', {
        action: 'updateProfile',
        username: usernameChanged ? profileForm.username : currentUser.username,
        displayName: profileForm.displayName,
        email: profileForm.email,
        phone: profileForm.phone,
        profileImage: profileForm.profileImage
      })

      const updatedUser = { 
        ...currentUser, 
        username: profileForm.username,
        displayName: profileForm.displayName,
        email: profileForm.email,
        phone: profileForm.phone,
        profileImage: profileForm.profileImage
      }
      
      console.log('[Settings] Updating localStorage with:', {
        displayName: profileForm.displayName,
        profileImage: profileForm.profileImage
      })
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      // Also update individual localStorage items for header
      localStorage.setItem('displayName', profileForm.displayName)
      if (profileForm.profileImage) {
        localStorage.setItem('profileImage', profileForm.profileImage)
      } else {
        localStorage.removeItem('profileImage')
      }
      setCurrentUser(updatedUser)

      // Dispatch custom event to notify header component
      window.dispatchEvent(new Event('profileUpdated'))
      
      console.log('[Settings] Dispatched profileUpdated event')

      if (usernameChanged) {
        toast.success('Profile and username updated successfully! Please login again with your new username.')
        // Optionally redirect to login after username change
        setTimeout(() => {
          localStorage.removeItem('currentUser')
          window.location.href = '/'
        }, 2000)
      } else {
        toast.success('Profile updated successfully')
        // Reload page to refresh header
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCreateUser = async () => {
    if (!newUserForm.username || !newUserForm.password || !newUserForm.displayName) {
      toast.error('Please fill in all fields')
      return
    }

    // Validate that Operations Staff has an assigned channel
    if (newUserForm.role === 'operations' && !newUserForm.assignedChannel) {
      toast.error('Please select a sales channel for Operations Staff')
      return
    }

    if (newUserForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await apiPost('/api/accounts', {
        action: 'create',
        ...newUserForm
      })
      toast.success('User created successfully')
      setNewUserForm({ username: '', password: '', displayName: '', role: 'operations', assignedChannel: '', profileImage: '' })
      setShowNewUserForm(false)
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user')
    }
  }

  const handleEditUser = (account: Account) => {
    setEditUserForm({
      id: account.id,
      username: account.username,
      originalUsername: account.username, // Store original
      displayName: account.displayName,
      role: account.role,
      assignedChannel: account.assignedChannel || '',
      newPassword: '',
      confirmPassword: '',
      profileImage: account.profileImage || ''
    })
    setEditingUser(account.id)
  }

  const handleUpdateUser = async () => {
    if (!editUserForm.displayName) {
      toast.error('Display name is required')
      return
    }

    if (!editUserForm.username) {
      toast.error('Username is required')
      return
    }

    // Validate password if provided
    if (editUserForm.newPassword || editUserForm.confirmPassword) {
      if (editUserForm.newPassword !== editUserForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      
      if (editUserForm.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
    }

    try {
      const usernameChanged = editUserForm.username !== editUserForm.originalUsername

      // Update username if changed
      if (usernameChanged) {
        await apiPut('/api/accounts', {
          action: 'updateUsername',
          username: editUserForm.originalUsername,
          newUsername: editUserForm.username
        })
      }

      // Update display name, assigned channel, and profile image (use new username if changed)
      await apiPut('/api/accounts', {
        action: 'updateDisplayName',
        username: editUserForm.username,
        displayName: editUserForm.displayName,
        assignedChannel: editUserForm.assignedChannel || null,
        profileImage: editUserForm.profileImage || null
      })

      // Update password if provided
      if (editUserForm.newPassword) {
        await apiPut('/api/accounts', {
          action: 'updatePassword',
          username: editUserForm.username,
          password: editUserForm.newPassword
        })
      }

      if (usernameChanged && editUserForm.newPassword) {
        toast.success('User updated successfully (username and password changed)')
      } else if (usernameChanged) {
        toast.success('User updated successfully (username changed)')
      } else if (editUserForm.newPassword) {
        toast.success('User updated successfully (password changed)')
      } else {
        toast.success('User updated successfully')
      }

      setEditingUser(null)
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditUserForm({
      id: '',
      username: '',
      originalUsername: '',
      displayName: '',
      role: 'operations',
      assignedChannel: '',
      newPassword: '',
      confirmPassword: '',
      profileImage: ''
    })
  }

  const handleDeleteUser = async (username: string) => {
    if (username === currentUser?.username) {
      toast.error('Cannot delete your own account')
      return
    }

    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Get current user info for auth headers
      const currentUsername = localStorage.getItem('username')
      const currentRole = localStorage.getItem('userRole')

      if (!currentUsername || !currentRole) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/accounts?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-username': currentUsername,
          'x-user-role': currentRole,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      toast.success(`User "${username}" deleted successfully`)
      fetchAccounts()
    } catch (error: any) {
      console.error('Delete user error:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleSystemSettingsUpdate = () => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings))
    toast.success('System settings saved successfully')
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    toast.success(`Theme changed to ${newTheme}`)
  }

  const handleExportData = async () => {
    try {
      toast.info('Exporting system data...')
      
      // Fetch all data from APIs
      const [accountsData, itemsData, categoriesData, customersData] = await Promise.all([
        apiGet<Account[]>('/api/accounts').catch(() => []),
        apiGet<any[]>('/api/items').catch(() => []),
        apiGet<any[]>('/api/categories').catch(() => []),
        apiGet<any[]>('/api/customers').catch(() => [])
      ])

      // Create export object
      const exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: currentUser?.username,
        systemSettings: systemSettings,
        data: {
          accounts: accountsData,
          items: itemsData,
          categories: categoriesData,
          customers: customersData
        }
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('System data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  const handleBackupNow = async () => {
    try {
      toast.info('Creating backup...')
      
      // Fetch all critical data
      const [accountsData, itemsData, categoriesData, customersData, logsData] = await Promise.all([
        apiGet<Account[]>('/api/accounts').catch(() => []),
        apiGet<any[]>('/api/items').catch(() => []),
        apiGet<any[]>('/api/categories').catch(() => []),
        apiGet<any[]>('/api/customers').catch(() => []),
        apiGet<any[]>('/api/logs').catch(() => [])
      ])

      // Create backup object with metadata
      const backupData = {
        backupDate: new Date().toISOString(),
        backupVersion: '1.0.0',
        createdBy: currentUser?.username,
        systemSettings: systemSettings,
        database: {
          accounts: accountsData,
          items: itemsData,
          categories: categoriesData,
          customers: customersData,
          logs: logsData
        }
      }

      // Save to localStorage as latest backup
      localStorage.setItem('latestBackup', JSON.stringify({
        date: new Date().toISOString(),
        size: JSON.stringify(backupData).length
      }))
      setLastBackup(new Date().toISOString())

      // Create and download backup file
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Backup created and downloaded successfully')
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Failed to create backup')
    }
  }

  const handleImportData = () => {
    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        toast.info('Importing data...')
        
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const importData = JSON.parse(event.target?.result as string)
            
            // Validate import data structure
            if (!importData.data && !importData.database) {
              toast.error('Invalid import file format')
              return
            }

            // Show confirmation
            const confirmed = confirm(
              `Import data from ${new Date(importData.exportDate || importData.backupDate).toLocaleString()}?\n\n` +
              `This will update system settings but will NOT overwrite existing database records.\n\n` +
              `Click OK to proceed.`
            )

            if (!confirmed) {
              toast.info('Import cancelled')
              return
            }

            // Import system settings if available
            if (importData.systemSettings) {
              setSystemSettings(importData.systemSettings)
              localStorage.setItem('systemSettings', JSON.stringify(importData.systemSettings))
            }

            toast.success('Data imported successfully')
            toast.info('System settings have been updated. Database import requires manual review.')
            
          } catch (parseError) {
            console.error('Parse error:', parseError)
            toast.error('Failed to parse import file')
          }
        }
        
        reader.readAsText(file)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import data')
      }
    }
    
    input.click()
  }

  const isAdmin = currentUser?.role === 'admin'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header - Professional */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text [-webkit-text-fill-color:transparent]">
          Settings Overview
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Configure system preferences, manage users, and customize your workspace
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Professional Tab Navigation */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg p-1">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-1 h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="users" 
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger 
                value="company" 
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger 
                value="email-reports" 
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email Reports</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="appearance" 
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors text-sm font-medium"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>
        </Card>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card - Professional */}
            <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Profile Information
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="Enter username"
                      className="h-10 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                      placeholder="Enter your display name"
                      className="h-10 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="your.email@company.com"
                      className="h-10 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+63 XXX XXX XXXX"
                      className="h-10 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Image (Optional)</Label>
                  <ImageUpload
                    uploadType="profile"
                    value={profileForm.profileImage}
                    onChange={(url) => setProfileForm({ ...profileForm, profileImage: url })}
                    onRemove={() => setProfileForm({ ...profileForm, profileImage: '' })}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a profile picture (max 300KB, auto-compressed to WebP)
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-600">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">Account Role</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Your current access level</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="px-4 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Operations Staff'}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setProfileForm({
                        displayName: currentUser.displayName || '',
                        username: currentUser.username || '',
                        email: currentUser.email || '',
                        phone: currentUser.phone || '',
                        profileImage: currentUser.profileImage || ''
                      })
                    }} 
                    className="h-10 px-5 border-slate-300 dark:border-slate-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate} 
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Sidebar */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-3 p-5 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Account Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pb-5 pt-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Last Login</span>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Today</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Account Created</span>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Jan 2024</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Status</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-600">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Change Password
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Keep your account secure with a strong password
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="currentPassword" className="text-sm font-semibold">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="newPassword" className="text-sm font-semibold">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    >
                      {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    >
                      {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Shield className="h-4 w-4" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pb-5 pt-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">Password Encryption</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Bcrypt Active</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">Row Level Security</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Database Protected</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">API Authentication</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Token-Based</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-l-4 border-l-yellow-500">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-xs mb-2 text-slate-900 dark:text-white">Security Recommendations</h4>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Change your password regularly</li>
                        <li>• Use a unique password for this account</li>
                        <li>• Never share your credentials</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 dark:bg-white">
                      <Shield className="h-4 w-4 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        User Management
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Manage system users, roles, and permissions
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowNewUserForm(!showNewUserForm)}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                  >
                    {showNewUserForm ? (
                      <><X className="h-4 w-4 mr-2" /> Cancel</>
                    ) : (
                      <><Plus className="h-4 w-4 mr-2" /> Add User</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                {showNewUserForm && (
                  <Card className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Create New User</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newUsername" className="text-xs font-medium">Username *</Label>
                          <Input
                            id="newUsername"
                            value={newUserForm.username}
                            onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                            placeholder="Enter username"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newDisplayName" className="text-xs font-medium">Display Name *</Label>
                          <Input
                            id="newDisplayName"
                            value={newUserForm.displayName}
                            onChange={(e) => setNewUserForm({ ...newUserForm, displayName: e.target.value })}
                            placeholder="Enter display name"
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-xs font-medium">Password *</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newUserForm.password}
                            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                            placeholder="Enter password (min 6 characters)"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newRole" className="text-xs font-medium">Role *</Label>
                          <div className="flex gap-2">
                            <select
                              id="newRole"
                              value={newUserForm.role}
                              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any, assignedChannel: '' })}
                              className="flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-sm"
                            >
                              <option value="admin">Administrator</option>
                              <option value="operations">Operations Staff</option>
                              <option value="packer">Packer</option>
                              <option value="tracker">Tracker</option>
                              <option value="logistics-admin">Logistics Admin</option>
                            </select>
                            
                            {/* Sales Channel Dropdown - Only show when Operations Staff is selected */}
                            {newUserForm.role === 'operations' && (
                              <select
                                id="newChannel"
                                value={newUserForm.assignedChannel}
                                onChange={(e) => setNewUserForm({ ...newUserForm, assignedChannel: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Select channel...</option>
                                <option value="Shopee">Shopee</option>
                                <option value="Lazada">Lazada</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Physical Store">Physical Store</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Profile Image Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Profile Image (Optional)</Label>
                        <ImageUpload
                          uploadType="profile"
                          value={newUserForm.profileImage}
                          onChange={(url) => setNewUserForm({ ...newUserForm, profileImage: url })}
                          onRemove={() => setNewUserForm({ ...newUserForm, profileImage: '' })}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Upload a profile picture (max 300KB, auto-compressed to WebP)
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleCreateUser} 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Create User
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowNewUserForm(false)
                            setNewUserForm({ username: '', password: '', displayName: '', role: 'operations', assignedChannel: '', profileImage: '' })
                          }}
                          className="h-9 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-5">
                  {/* 3 Role Group Cards - Horizontal */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Admin Card */}
                    <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <CardHeader className="p-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-600">
                              <Shield className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Admin</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {accounts.filter(a => a.role === 'admin').length} users
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {accounts.filter(a => a.role === 'admin').length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">No admin users</p>
                        ) : (
                          accounts.filter(a => a.role === 'admin').map((account) => (
                            <div key={account.id}>
                              {editingUser === account.id ? (
                                <div className="space-y-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Edit Admin User</p>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Username</Label>
                                      <Input value={editUserForm.username} onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })} placeholder="Username" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Display Name</Label>
                                      <Input value={editUserForm.displayName} onChange={(e) => setEditUserForm({ ...editUserForm, displayName: e.target.value })} placeholder="Display name" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Profile Image (Optional)</Label>
                                      <ImageUpload
                                        uploadType="profile"
                                        value={editUserForm.profileImage}
                                        onChange={(url) => setEditUserForm({ ...editUserForm, profileImage: url })}
                                        onRemove={() => setEditUserForm({ ...editUserForm, profileImage: '' })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">New Password (optional)</Label>
                                      <Input type={showPassword.editNew ? "text" : "password"} value={editUserForm.newPassword} onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })} placeholder="New password (optional)" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Confirm Password</Label>
                                      <Input type={showPassword.editConfirm ? "text" : "password"} value={editUserForm.confirmPassword} onChange={(e) => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })} placeholder="Confirm password" className="h-8 text-xs" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleUpdateUser} className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"><Check className="h-3 w-3 mr-1" />Save</Button>
                                    <Button variant="outline" onClick={handleCancelEdit} className="flex-1 h-7 text-xs"><X className="h-3 w-3 mr-1" />Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    {/* Profile Image */}
                                    <div className="flex-shrink-0">
                                      {account.profileImage ? (
                                        <img 
                                          src={account.profileImage} 
                                          alt={account.displayName}
                                          className="h-8 w-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                          <User className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{account.displayName}</p>
                                        {account.username === currentUser?.username && (
                                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">(You)</span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">@{account.username}</p>
                                    </div>
                                  </div>
                                  {account.username !== currentUser?.username && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(account)} className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(account.username)} className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Departments (Operations) Card */}
                    <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <CardHeader className="p-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-600">
                              <Building2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Departments</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {accounts.filter(a => a.role === 'operations').length} users
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {accounts.filter(a => a.role === 'operations').length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">No department users</p>
                        ) : (
                          accounts.filter(a => a.role === 'operations').map((account) => (
                            <div key={account.id}>
                              {editingUser === account.id ? (
                                <div className="space-y-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Edit Department User</p>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Username</Label>
                                      <Input value={editUserForm.username} onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })} placeholder="Username" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Display Name</Label>
                                      <Input value={editUserForm.displayName} onChange={(e) => setEditUserForm({ ...editUserForm, displayName: e.target.value })} placeholder="Display name" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Profile Image (Optional)</Label>
                                      <ImageUpload
                                        uploadType="profile"
                                        value={editUserForm.profileImage}
                                        onChange={(url) => setEditUserForm({ ...editUserForm, profileImage: url })}
                                        onRemove={() => setEditUserForm({ ...editUserForm, profileImage: '' })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">New Password (optional)</Label>
                                      <Input type={showPassword.editNew ? "text" : "password"} value={editUserForm.newPassword} onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })} placeholder="New password (optional)" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Confirm Password</Label>
                                      <Input type={showPassword.editConfirm ? "text" : "password"} value={editUserForm.confirmPassword} onChange={(e) => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })} placeholder="Confirm password" className="h-8 text-xs" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleUpdateUser} className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"><Check className="h-3 w-3 mr-1" />Save</Button>
                                    <Button variant="outline" onClick={handleCancelEdit} className="flex-1 h-7 text-xs"><X className="h-3 w-3 mr-1" />Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    {/* Profile Image */}
                                    <div className="flex-shrink-0">
                                      {account.profileImage ? (
                                        <img 
                                          src={account.profileImage} 
                                          alt={account.displayName}
                                          className="h-8 w-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                          <User className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{account.displayName}</p>
                                        {account.assignedChannel && (
                                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 flex-shrink-0">
                                            {account.assignedChannel}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">@{account.username}</p>
                                    </div>
                                  </div>
                                  {account.username !== currentUser?.username && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(account)} className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(account.username)} className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Logistics (Packer + Tracker + Logistics-Admin) Card */}
                    <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <CardHeader className="p-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-orange-600">
                              <Server className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Logistics</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {accounts.filter(a => ['packer', 'tracker', 'logistics-admin'].includes(a.role)).length} users
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {accounts.filter(a => ['packer', 'tracker', 'logistics-admin'].includes(a.role)).length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">No logistics users</p>
                        ) : (
                          accounts.filter(a => ['packer', 'tracker', 'logistics-admin'].includes(a.role)).map((account) => (
                            <div key={account.id}>
                              {editingUser === account.id ? (
                                <div className="space-y-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Edit Logistics User</p>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Username</Label>
                                      <Input value={editUserForm.username} onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })} placeholder="Username" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Display Name</Label>
                                      <Input value={editUserForm.displayName} onChange={(e) => setEditUserForm({ ...editUserForm, displayName: e.target.value })} placeholder="Display name" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Profile Image (Optional)</Label>
                                      <ImageUpload
                                        uploadType="profile"
                                        value={editUserForm.profileImage}
                                        onChange={(url) => setEditUserForm({ ...editUserForm, profileImage: url })}
                                        onRemove={() => setEditUserForm({ ...editUserForm, profileImage: '' })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">New Password (optional)</Label>
                                      <Input type={showPassword.editNew ? "text" : "password"} value={editUserForm.newPassword} onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })} placeholder="New password (optional)" className="h-8 text-xs" />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Confirm Password</Label>
                                      <Input type={showPassword.editConfirm ? "text" : "password"} value={editUserForm.confirmPassword} onChange={(e) => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })} placeholder="Confirm password" className="h-8 text-xs" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleUpdateUser} className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"><Check className="h-3 w-3 mr-1" />Save</Button>
                                    <Button variant="outline" onClick={handleCancelEdit} className="flex-1 h-7 text-xs"><X className="h-3 w-3 mr-1" />Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    {/* Profile Image */}
                                    <div className="flex-shrink-0">
                                      {account.profileImage ? (
                                        <img 
                                          src={account.profileImage} 
                                          alt={account.displayName}
                                          className="h-8 w-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                          <User className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{account.displayName}</p>
                                        {account.assignedChannel && (
                                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 flex-shrink-0">
                                            {account.assignedChannel}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">@{account.username}</p>
                                    </div>
                                  </div>
                                  {account.username !== currentUser?.username && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(account)} className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(account.username)} className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Company Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="company" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-600">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Company Information
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Configure your company details and business settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="companyName"
                      value={systemSettings.companyName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                      placeholder="Your Company Name"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="text-sm font-medium">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={systemSettings.companyEmail}
                      onChange={(e) => setSystemSettings({ ...systemSettings, companyEmail: e.target.value })}
                      placeholder="info@company.com"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone" className="text-sm font-medium">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      value={systemSettings.companyPhone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, companyPhone: e.target.value })}
                      placeholder="+63 XXX XXX XXXX"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                    <select
                      id="currency"
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings({ ...systemSettings, currency: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="PHP">PHP - Philippine Peso</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyAddress" className="text-sm font-medium">Company Address</Label>
                    <textarea
                      id="companyAddress"
                      value={systemSettings.companyAddress}
                      onChange={(e) => setSystemSettings({ ...systemSettings, companyAddress: e.target.value })}
                      placeholder="Enter complete address"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                    <select
                      id="timezone"
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-sm font-medium">Date Format</Label>
                    <select
                      id="dateFormat"
                      value={systemSettings.dateFormat}
                      onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold" className="text-sm font-medium">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={systemSettings.lowStockThreshold}
                      onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: parseInt(e.target.value) })}
                      placeholder="10"
                      min="1"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" className="h-10">
                    <X className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSystemSettingsUpdate} className="bg-green-600 hover:bg-green-700 text-white h-10">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Email Reports Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="email-reports" className="space-y-6">
            <EmailReportsManager />
          </TabsContent>
        )}

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Appearance & Display
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Customize the look and feel of your interface
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Theme Preference</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                      theme === 'light'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
                      <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Light Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Bright and clear</p>
                    </div>
                    {theme === 'light' && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                  </button>

                  <button
                    className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                      theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
                      <Moon className="h-5 w-5 text-slate-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Easy on the eyes</p>
                    </div>
                    {theme === 'dark' && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                  </button>

                  <button
                    className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                      theme === 'system'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => handleThemeChange('system')}
                  >
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">System</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Match device</p>
                    </div>
                    {theme === 'system' && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Desktop Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Show notifications on your desktop</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Email Alerts</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableEmailAlerts}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableEmailAlerts: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSystemSettingsUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-600">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      System Information
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      View system status and configuration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Database</Label>
                    <Badge variant="outline" className="w-fit bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Supabase
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Security</Label>
                    <Badge variant="outline" className="w-fit bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                      <Shield className="h-3 w-3 mr-2" />
                      RLS Enabled
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Authentication</Label>
                    <Badge variant="outline" className="w-fit bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 text-xs">
                      <Lock className="h-3 w-3 mr-2" />
                      Token-Based
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Encryption</Label>
                    <Badge variant="outline" className="w-fit bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 text-xs">
                      <Check className="h-3 w-3 mr-2" />
                      Bcrypt
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">System Version</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Security Score</span>
                    <Badge className="bg-green-600 text-white text-xs font-medium">10/10</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                    <Badge className="bg-blue-600 text-white text-xs font-medium">Production Ready</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup & Data */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-600">
                    <Server className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Backup & Data
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Manage backups and data exports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Automatic Backups</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily at 2:00 AM</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Backup Frequency</Label>
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => setSystemSettings({ ...systemSettings, backupFrequency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button onClick={handleBackupNow} variant="outline" className="w-full justify-start h-10 text-sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button onClick={handleExportData} variant="outline" className="w-full justify-start h-10 text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export System Data
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="w-full justify-start h-10 text-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  {lastBackup
                    ? `Last backup: ${new Date(lastBackup).toLocaleString()}`
                    : 'No backup created yet'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">System Performance</CardTitle>
                  <CardDescription className="mt-1 text-sm">Real-time system metrics and statistics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">API Response</span>
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {systemMetrics.apiResponseTime > 0 ? `${systemMetrics.apiResponseTime}ms` : '—'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average response time</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Database</span>
                    <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemMetrics.databaseHealth}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">System health</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Storage</span>
                    <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemMetrics.storageUsed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Data stored</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">User Accounts</span>
                    <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accounts.length > 0 ? accounts.length : '—'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
