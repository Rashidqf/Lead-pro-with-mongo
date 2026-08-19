package com.leadpilot.companion

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val prefs = getSharedPreferences("leadpilot", MODE_PRIVATE)

        val pad = (16 * resources.displayMetrics.density).toInt()
        val column = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(pad, pad, pad, pad)
        }

        fun field(hint: String, value: String, password: Boolean = false): EditText {
            val input = EditText(this).apply {
                this.hint = hint
                setText(value)
                if (password) inputType =
                    android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            }
            column.addView(input)
            return input
        }

        val title = TextView(this).apply {
            text = "LeadPilot companion"
            textSize = 22f
            setPadding(0, 0, 0, pad)
        }
        column.addView(title)

        val help = TextView(this).apply {
            text = "Sign in with your CRM account. Keep this app running so Call in the CRM uses this phone’s SIM."
            setPadding(0, 0, 0, pad)
        }
        column.addView(help)

        val url = field("CRM URL (http://192.168.x.x:PORT)", prefs.getString("baseUrl", "") ?: "")
        val email = field("Email", prefs.getString("email", "") ?: "")
        val password = field("Password", "", password = true)

        val status = TextView(this).apply { setPadding(0, pad, 0, pad) }
        column.addView(status)

        val start = Button(this).apply { text = "Connect and listen" }
        val stop = Button(this).apply { text = "Stop" }
        column.addView(start)
        column.addView(stop)

        start.setOnClickListener {
            requestPerms()
            val baseUrl = url.text.toString().trim()
            val mail = email.text.toString().trim()
            val pass = password.text.toString()
            if (baseUrl.isBlank() || mail.isBlank() || pass.isBlank()) {
                Toast.makeText(this, "Fill URL, email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            status.text = "Signing in…"
            thread {
                try {
                    val api = ApiClient(baseUrl)
                    val json = api.login(mail, pass, Build.MODEL)
                    prefs.edit()
                        .putString("baseUrl", baseUrl)
                        .putString("email", mail)
                        .putString("token", json.optString("token"))
                        .putString("deviceId", json.optString("deviceId"))
                        .apply()
                    runOnUiThread {
                        status.text = "Connected. Waiting for calls."
                        ContextCompat.startForegroundService(this, Intent(this, CallPollService::class.java))
                    }
                } catch (e: Exception) {
                    runOnUiThread { status.text = e.message ?: "Login failed" }
                }
            }
        }

        stop.setOnClickListener {
            stopService(Intent(this, CallPollService::class.java))
            status.text = "Stopped"
        }

        setContentView(ScrollView(this).apply { addView(column) })
        requestPerms()
    }

    private fun requestPerms() {
        val needed = mutableListOf(Manifest.permission.CALL_PHONE)
        if (Build.VERSION.SDK_INT >= 33) needed += Manifest.permission.POST_NOTIFICATIONS
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), 12)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(POWER_SERVICE) as android.os.PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                startActivity(
                    Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    },
                )
            }
        }
    }
}
