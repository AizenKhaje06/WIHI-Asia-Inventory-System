"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  X,
  Check,
  Calendar,
  RefreshCw,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { DateRangePicker } from "@/components/ui/date-range-picker"

interface EmailSchedule {
  id: string
  recipient_email: string
  recipient_name: string
  report_type: string
  frequency: 'daily' | 'weekly' | 'monthly'
  schedule_time: string
  schedule_day: string | null
  is_active: boolean
  last_sent_at: string | null
  created_at: string
}

interface EmailLog {
  id: string
  schedule_id: string
  recipient_email: string
  report_type: string
  status: 'success' | 'failed'
  sent_at: string
  orders_count: number
  total_amount: number
  error_message: string | null
}

export function EmailReportsManager() {
  const [schedules, setSchedules] = useState<EmailSchedule[]>([])
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sendingTest, setSendingTest] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    recipient_email: '',
    recipient_name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    schedule_time: '08:00',
    schedule_day: '',
    start_date: null as Date | null,
    end_date: null as Date | null
  })

  useEffect(() => {
    fetchSchedules()
    fetchLogs()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const data = await apiGet<EmailSchedule[]>('/api/email-schedules')
      setSchedules(data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const data = await apiGet<EmailLog[]>('/api/email-logs?limit=20')
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const handleAdd = async () => {
    if (!formData.recipient_email || !formData.recipient_name) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await apiPost('/api/email-schedules', formData)
      toast.success('Email schedule added successfully')
      setShowAddForm(false)
      resetForm()
      fetchSchedules()
    } catch (error) {
      toast.error('Failed to add schedule')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      await apiPut('/api/email-schedules', { id, ...formData })
      toast.success('Schedule updated successfully')
      setEditingId(null)
      resetForm()
      fetchSchedules()
    } catch (error) {
      toast.error('Failed to update schedule')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      await apiDelete(`/api/email-schedules?id=${id}`)
      toast.success('Schedule deleted successfully')
      fetchSchedules()
    } catch (error) {
      toast.error('Failed to delete schedule')
    }
  }

  const handleToggleActive = async (schedule: EmailSchedule) => {
    try {
      await apiPut('/api/email-schedules', {
        id: schedule.id,
        is_active: !schedule.is_active
      })
      toast.success(schedule.is_active ? 'Schedule disabled' : 'Schedule enabled')
      fetchSchedules()
    } catch (error) {
      toast.error('Failed to update schedule')
    }
  }

  const handleSendTest = async (email: string) => {
    try {
      setSendingTest(true)
      const response = await fetch('/api/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send test email')
      }

      toast.success(`Test email sent to ${email}`)
      fetchLogs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  const handleEdit = (schedule: EmailSchedule) => {
    setFormData({
      recipient_email: schedule.recipient_email,
      recipient_name: schedule.recipient_name,
      frequency: schedule.frequency,
      schedule_time: schedule.schedule_time,
      schedule_day: schedule.schedule_day || '',
      start_date: null,
      end_date: null
    })
    setEditingId(schedule.id)
    setShowAddForm(false)
  }

  const resetForm = () => {
    setFormData({
      recipient_email: '',
      recipient_name: '',
      frequency: 'daily',
      schedule_time: '08:00',
      schedule_day: '',
      start_date: null,
      end_date: null
    })
  }

  const getFrequencyLabel = (schedule: EmailSchedule) => {
    if (schedule.frequency === 'daily') return 'Daily'
    if (schedule.frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return `Weekly (${days[parseInt(schedule.schedule_day || '0')]})`
    }
    if (schedule.frequency === 'monthly') {
      return `Monthly (Day ${schedule.schedule_day})`
    }
    return schedule.frequency
  }

  return (
    <div className="space-y-8">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Email Reports</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage automated report schedules
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setEditingId(null)
            resetForm()
          }}
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
        >
          {showAddForm ? (
            <><X className="h-4 w-4 mr-2" /> Cancel</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Add Recipient</>
          )}
        </Button>
      </div>

      {/* Add/Edit Form - Minimalist */}
      {(showAddForm || editingId) && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</Label>
                  <Input
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="John Doe"
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                    placeholder="john@company.com"
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</Label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time</Label>
                  <Input
                    type="time"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>

                {formData.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day of Week</Label>
                    <select
                      value={formData.schedule_day}
                      onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm"
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day of Month</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.schedule_day}
                      onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                      placeholder="1-31"
                      className="border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}

                {/* Date Range Picker - Professional & Compact */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Report Date Range (Optional)
                  </Label>
                  <DateRangePicker
                    startDate={formData.start_date}
                    endDate={formData.end_date}
                    onDateChange={(start, end) => {
                      setFormData({ ...formData, start_date: start, end_date: end })
                    }}
                    className="w-full border-slate-200 dark:border-slate-800"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Leave empty to include all orders. Select a range to filter reports by date.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List - Clean Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : schedules.length === 0 ? (
          <Card className="border border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                No email schedules yet
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Recipient
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      schedule.is_active
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'bg-slate-50 dark:bg-slate-900'
                    }`}>
                      <Mail className={`h-5 w-5 ${
                        schedule.is_active
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {schedule.recipient_name}
                        </p>
                        {schedule.is_active ? (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-2">
                        {schedule.recipient_email}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getFrequencyLabel(schedule)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.schedule_time}
                        </span>
                        {schedule.last_sent_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Date(schedule.last_sent_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleActive(schedule)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendTest(schedule.recipient_email)}
                      disabled={sendingTest}
                      className="h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Email Logs - Simple Table */}
      {logs.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Last 20 email deliveries
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} className="border-slate-200 dark:border-slate-800">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Sent At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          {log.status === 'success' ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                              Failed
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.recipient_email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(log.sent_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.orders_count || 0}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                          ₱{(log.total_amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
