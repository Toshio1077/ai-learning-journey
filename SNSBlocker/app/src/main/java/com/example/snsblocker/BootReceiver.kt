package com.example.snsblocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * 端末再起動時に受け取るBroadcastReceiver。
 * AccessibilityServiceはシステムが自動的に再起動するため、
 * ここでは設定画面を案内するログや将来の拡張用に使う。
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // AccessibilityServiceはAndroidが自動再起動する
            // 追加のサービスが必要な場合はここで起動する
        }
    }
}
