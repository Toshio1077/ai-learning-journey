package com.example.snsblocker

import android.app.Application
import com.example.snsblocker.data.AppDatabase

class SNSBlockerApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getInstance(this) }
}
