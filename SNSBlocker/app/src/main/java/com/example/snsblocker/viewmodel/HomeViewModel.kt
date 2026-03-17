package com.example.snsblocker.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.snsblocker.SNSBlockerApp
import com.example.snsblocker.data.entity.BlockedApp
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = (application as SNSBlockerApp).database.blockedAppDao()

    val blockedApps: StateFlow<List<BlockedApp>> = dao.getAllApps()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun toggleEnabled(app: BlockedApp) {
        viewModelScope.launch {
            dao.update(app.copy(isEnabled = !app.isEnabled))
        }
    }

    fun deleteApp(app: BlockedApp) {
        viewModelScope.launch {
            dao.delete(app)
        }
    }
}
