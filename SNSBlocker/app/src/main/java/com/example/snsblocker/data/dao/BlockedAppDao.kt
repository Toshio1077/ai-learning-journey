package com.example.snsblocker.data.dao

import androidx.room.*
import com.example.snsblocker.data.entity.BlockedApp
import kotlinx.coroutines.flow.Flow

@Dao
interface BlockedAppDao {

    @Query("SELECT * FROM blocked_apps ORDER BY appName ASC")
    fun getAllApps(): Flow<List<BlockedApp>>

    @Query("SELECT * FROM blocked_apps WHERE isEnabled = 1")
    fun getEnabledApps(): Flow<List<BlockedApp>>

    @Query("SELECT * FROM blocked_apps WHERE packageName = :packageName")
    suspend fun getApp(packageName: String): BlockedApp?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(app: BlockedApp)

    @Update
    suspend fun update(app: BlockedApp)

    @Delete
    suspend fun delete(app: BlockedApp)

    @Query("DELETE FROM blocked_apps WHERE packageName = :packageName")
    suspend fun deleteByPackageName(packageName: String)

    @Query("UPDATE blocked_apps SET isEnabled = :isEnabled WHERE packageName = :packageName")
    suspend fun setEnabled(packageName: String, isEnabled: Boolean)
}
