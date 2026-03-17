package com.example.snsblocker.util

import android.app.usage.UsageStatsManager
import android.content.Context
import java.util.Calendar

object UsageStatsHelper {

    /**
     * 今日0:00からの指定アプリの使用時間を分単位で返す
     */
    fun getTodayUsageMinutes(context: Context, packageName: String): Long {
        val usageStatsManager =
            context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        val appStats = stats?.find { it.packageName == packageName }
        val totalMillis = appStats?.totalTimeInForeground ?: 0L
        return totalMillis / 60_000L
    }
}
