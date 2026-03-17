package com.example.snsblocker.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * ブロック対象のSNSアプリ設定
 *
 * @param packageName アプリのパッケージ名（例: com.twitter.android）
 * @param appName 表示名
 * @param isEnabled ブロック有効/無効
 * @param dailyLimitMinutes 1日の使用時間上限（分）。0 = 時間制限なし
 * @param blockStartTime 時間帯ブロック開始時刻（例: "22:00"）。nullなら時間帯ブロックなし
 * @param blockEndTime 時間帯ブロック終了時刻（例: "07:00"）。nullなら時間帯ブロックなし
 */
@Entity(tableName = "blocked_apps")
data class BlockedApp(
    @PrimaryKey val packageName: String,
    val appName: String,
    val isEnabled: Boolean = true,
    val dailyLimitMinutes: Int = 0,
    val blockStartTime: String? = null,
    val blockEndTime: String? = null
)
