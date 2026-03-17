package com.example.snsblocker.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.snsblocker.data.dao.BlockedAppDao
import com.example.snsblocker.data.entity.BlockedApp

@Database(
    entities = [BlockedApp::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun blockedAppDao(): BlockedAppDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sns_blocker.db"
                ).build().also { INSTANCE = it }
            }
        }
    }
}
