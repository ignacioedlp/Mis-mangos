"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Archive, ExternalLink, AlertTriangle, Info, CheckCircle, DollarSign } from "lucide-react"
import { getUserNotifications, markNotificationAsRead, archiveNotification, getUnreadNotificationCount } from "@/actions/notification-actions"
import { toast } from "sonner"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  priority: string
  title: string
  message: string
  isRead: boolean
  actionUrl?: string | null
  actionLabel?: string | null
  createdAt: Date
  metadata?: Record<string, unknown>
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await getUserNotifications(20, 0)
      setNotifications(data as Notification[])
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationCount()
      setUnreadCount(count)
    } catch {
      // Silently fail for count
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success("Notification marked as read")
    } catch {
      toast.error("Failed to mark notification as read")
    }
  }

  async function handleArchive(notificationId: string) {
    try {
      await archiveNotification(notificationId)
      
      // Find the notification before removing it
      const notificationToArchive = notifications?.find(n => n.id === notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      // Update unread count only if the archived notification was unread
      if (notificationToArchive && !notificationToArchive.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success("Notification archived")
    } catch {
      toast.error("Failed to archive notification")
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "BUDGET_EXCEEDED":
      case "BUDGET_WARNING":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "PAYMENT_REMINDER":
        return <DollarSign className="h-4 w-4 text-blue-600" />
      case "MONTHLY_SUMMARY":
        return <Info className="h-4 w-4 text-purple-600" />
      case "SAVINGS_MILESTONE":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "BUDGET_AVAILABLE":
        return <DollarSign className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 border-red-200"
      case "HIGH":
        return "bg-orange-100 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 border-yellow-200"
      case "LOW":
        return "bg-blue-100 border-blue-200"
      default:
        return "bg-gray-100 border-gray-200"
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {unreadCount} no leídas
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Mantente actualizado sobre tu actividad financiera y estado del presupuesto
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : notifications && notifications?.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No hay notificaciones aún</p>
              <p className="text-sm text-muted-foreground">Te notificaremos sobre actualizaciones de presupuesto y eventos financieros importantes</p>
            </div>
          ) : (
            notifications?.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                          {!notification.isRead && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Nuevo
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.createdAt.toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleArchive(notification.id)}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-3">
                    {notification.message}
                  </p>
                  {notification.actionUrl && notification.actionLabel && (
                    <Link href={notification.actionUrl} onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        {notification.actionLabel}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications && notifications?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                // Mark all as read
                notifications?.filter(n => !n.isRead).forEach(n => {
                  handleMarkAsRead(n.id)
                })
              }}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas ({unreadCount})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
