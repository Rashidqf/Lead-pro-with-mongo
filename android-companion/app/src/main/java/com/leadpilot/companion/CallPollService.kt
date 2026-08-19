package com.leadpilot.companion

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import kotlin.concurrent.thread

class CallPollService : Service() {
    @Volatile private var running = false
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prefs = getSharedPreferences("leadpilot", MODE_PRIVATE)
        val baseUrl = prefs.getString("baseUrl", "") ?: ""
        val token = prefs.getString("token", "") ?: ""
        val deviceId = prefs.getString("deviceId", "") ?: ""
        if (baseUrl.isBlank() || token.isBlank()) {
            stopSelf()
            return START_NOT_STICKY
        }
        startFg()
        acquireWakeLock()
        if (!running) {
            running = true
            thread(name = "leadpilot-poll", isDaemon = true) {
                val api = ApiClient(baseUrl, token, deviceId)
                while (running) {
                    try {
                        val job = api.nextCall()
                        if (job != null) {
                            val jobId = job.optString("jobId")
                            val phone = job.optString("phone")
                            placeCall(phone)
                            runCatching { api.callStatus(jobId, "dialed") }
                        }
                    } catch (_: Exception) {
                    }
                    try {
                        Thread.sleep(3000)
                    } catch (_: InterruptedException) {
                        break
                    }
                }
            }
        }
        return START_STICKY
    }

    private fun placeCall(phone: String) {
        val intent = Intent(Intent.ACTION_CALL).apply {
            data = Uri.parse("tel:$phone")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(intent)
    }

    private fun startFg() {
        val channelId = "calls"
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(channelId, "LeadPilot calls", NotificationManager.IMPORTANCE_LOW),
        )
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("LeadPilot")
            .setContentText("Waiting for CRM calls")
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setContentIntent(open)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(
                41,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC or ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL,
            )
        } else {
            startForeground(41, notification)
        }
    }

    private fun acquireWakeLock() {
        if (wakeLock?.isHeld == true) return
        wakeLock = (getSystemService(POWER_SERVICE) as PowerManager)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "leadpilot:calls")
            .also { it.acquire() }
    }

    override fun onDestroy() {
        running = false
        wakeLock?.let { if (it.isHeld) it.release() }
        super.onDestroy()
    }
}
