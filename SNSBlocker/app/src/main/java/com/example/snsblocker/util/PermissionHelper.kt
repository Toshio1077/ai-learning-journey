package com.example.snsblocker.util

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.example.snsblocker.service.AppBlockerService

object PermissionHelper {

    /**
     * AccessibilityServiceが有効になっているか確認
     */
    fun isAccessibilityServiceEnabled(context: Context): Boolean {
        val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val serviceName = "${context.packageName}/${AppBlockerService::class.java.canonicalName}"
        return enabledServices.split(":").any { it.equals(serviceName, ignoreCase = true) }
    }

    /**
     * PACKAGE_USAGE_STATS権限が付与されているか確認
     */
    fun isUsageStatsPermissionGranted(context: Context): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /**
     * アクセシビリティ設定画面へのIntentを返す
     */
    fun accessibilitySettingsIntent(): Intent =
        Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)

    /**
     * 使用状況アクセス設定画面へのIntentを返す
     */
    fun usageAccessSettingsIntent(): Intent =
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
}
