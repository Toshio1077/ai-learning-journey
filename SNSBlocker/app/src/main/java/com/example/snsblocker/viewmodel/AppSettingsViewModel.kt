package com.example.snsblocker.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import com.example.snsblocker.SNSBlockerApp
import com.example.snsblocker.data.entity.BlockedApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppSettingsViewModel(
    application: Application,
    savedStateHandle: SavedStateHandle
) : AndroidViewModel(application) {

    private val dao = (application as SNSBlockerApp).database.blockedAppDao()
    private val packageName: String = checkNotNull(savedStateHandle["packageName"])

    private val _app = MutableStateFlow<BlockedApp?>(null)
    val app: StateFlow<BlockedApp?> = _app.asStateFlow()

    init {
        viewModelScope.launch {
            _app.value = dao.getApp(packageName)
        }
    }

    fun save(
        dailyLimitMinutes: Int,
        blockStartTime: String?,
        blockEndTime: String?
    ) {
        val current = _app.value ?: return
        viewModelScope.launch {
            dao.update(
                current.copy(
                    dailyLimitMinutes = dailyLimitMinutes,
                    blockStartTime = blockStartTime?.ifBlank { null },
                    blockEndTime = blockEndTime?.ifBlank { null }
                )
            )
        }
    }
}
