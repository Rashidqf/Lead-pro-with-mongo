package com.leadpilot.companion

import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ApiClient(private val baseUrl: String, private var token: String? = null, private var deviceId: String? = null) {
    fun login(email: String, password: String, deviceName: String): JSONObject {
        val body = JSONObject()
            .put("email", email)
            .put("password", password)
            .put("deviceName", deviceName)
        val json = request("POST", "/api/companion/login", body, auth = false)
        token = json.optString("token")
        deviceId = json.optString("deviceId")
        return json
    }

    fun nextCall(): JSONObject? {
        val path = "/api/companion/next-call" + if (!deviceId.isNullOrBlank()) "?deviceId=$deviceId" else ""
        val json = request("GET", path, null, auth = true)
        if (json.isNull("job")) return null
        return json.optJSONObject("job")
    }

    fun callStatus(jobId: String, status: String) {
        val body = JSONObject().put("jobId", jobId).put("status", status)
        request("POST", "/api/companion/call-status", body, auth = true)
    }

    private fun request(method: String, path: String, body: JSONObject?, auth: Boolean): JSONObject {
        val url = URL(baseUrl.trimEnd('/') + path)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15000
            readTimeout = 15000
            setRequestProperty("Accept", "application/json")
            if (auth) {
                val t = token ?: throw IllegalStateException("Not signed in")
                setRequestProperty("Authorization", "Bearer $t")
            }
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                OutputStreamWriter(outputStream).use { it.write(body.toString()) }
            }
        }
        val code = conn.responseCode
        val text = (if (code in 200..299) conn.inputStream else conn.errorStream)
            ?.bufferedReader()?.readText().orEmpty()
        conn.disconnect()
        if (code !in 200..299) {
            val err = runCatching { JSONObject(text).optString("error") }.getOrNull()
            throw IllegalStateException(err?.ifBlank { null } ?: "HTTP $code")
        }
        return if (text.isBlank()) JSONObject() else JSONObject(text)
    }
}
