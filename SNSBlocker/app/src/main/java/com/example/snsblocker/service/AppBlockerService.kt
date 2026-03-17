package com.example.snsblocker.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.example.snsblocker.SNSBlockerApp
import com.example.snsblocker.data.entity.BlockedApp
import com.example.snsblocker.ui.BlockedActivity
import com.example.snsblocker.util.UsageStatsHelper
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * AccessibilityServiceを利用してフォアグラウンドアプリを監視し、
 * ブロック対象であればBlockedActivityを起動してアクセスを遮断する。
 */
class AppBlockerService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val timeFormatter = DateTimeFormatter.ofPattern("HH:mm")

    // 直前にブロックしたパッケージ名（連続起動を防ぐ）
    private var lastBlockedPackage: String? = null

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return
        // 自分自身は除外
        if (packageName == this.packageName) {
            lastBlockedPackage = null
            return
        }
        // 連続ブロック防止（同じアプリへの連続イベント）
        if (packageName == lastBlockedPackage) return

        serviceScope.launch {
            val db = (application as SNSBlockerApp).database
            val app = db.blockedAppDao().getApp(packageName) ?: return@launch

            if (!app.isEnabled) return@launch

            val reason = determineBlockReason(app) ?: return@launch

            lastBlockedPackage = packageName
            launchBlockedActivity(packageName, app.appName, reason)
        }
    }

    /**
     * ブロックすべき理由を返す。ブロック不要なら null
     */
    private suspend fun determineBlockReason(app: BlockedApp): BlockReason? {
        // 1. 時間帯チェック
        if (app.blockStartTime != null && app.blockEndTime != null) {
            if (isInBlockedTimeRange(app.blockStartTime, app.blockEndTime)) {
                return BlockReason.TIME_RANGE
            }
        }

        // 2. 累計使用時間チェック
        if (app.dailyLimitMinutes > 0) {
            val usedMinutes = UsageStatsHelper.getTodayUsageMinutes(this, app.packageName)
            if (usedMinutes >= app.dailyLimitMinutes) {
                return BlockReason.DAILY_LIMIT
            }
        }

        return null
    }

    /**
     * 現在時刻がブロック時間帯内かどうか判定（深夜をまたぐ範囲にも対応）
     */
    private fun isInBlockedTimeRange(startStr: String, endStr: String): Boolean {
        return try {
            val now = LocalTime.now()
            val start = LocalTime.parse(startStr, timeFormatter)
            val end = LocalTime.parse(endStr, timeFormatter)

            if (start <= end) {
                // 例: 09:00 ～ 22:00
                now >= start && now < end
            } else {
                // 例: 22:00 ～ 07:00（深夜をまたぐ）
                now >= start || now < end
            }
        } catch (e: Exception) {
            false
        }
    }

    private fun launchBlockedActivity(packageName: String, appName: String, reason: BlockReason) {
        val intent = Intent(this, BlockedActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(BlockedActivity.EXTRA_PACKAGE_NAME, packageName)
            putExtra(BlockedActivity.EXTRA_APP_NAME, appName)
            putExtra(BlockedActivity.EXTRA_BLOCK_REASON, reason.name)
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        // サービス中断時の処理（今回は何もしない）
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }

    enum class BlockReason {
        TIME_RANGE,    // 時間帯ブロック
        DAILY_LIMIT    // 1日の使用時間超過
    }
}
