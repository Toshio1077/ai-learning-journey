package com.example.snsblocker.viewmodel

import android.app.Application
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.snsblocker.SNSBlockerApp
import com.example.snsblocker.data.entity.BlockedApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class InstalledAppInfo(
    val packageName: String,
    val appName: String,
    val isAlreadyAdded: Boolean
)

class AppPickerViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = (application as SNSBlockerApp).database.blockedAppDao()
    private val pm = application.packageManager

    private val _installedApps = MutableStateFlow<List<InstalledAppInfo>>(emptyList())
    val installedApps: StateFlow<List<InstalledAppInfo>> = _installedApps.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    val filteredApps: StateFlow<List<InstalledAppInfo>> = combine(
        _installedApps,
        _searchQuery
    ) { apps, query ->
        if (query.isBlank()) apps
        else apps.filter { it.appName.contains(query, ignoreCase = true) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadInstalledApps()
    }

    private fun loadInstalledApps() {
        viewModelScope.launch {
            val apps = withContext(Dispatchers.IO) {
                val blockedPackages = dao.getAllApps().first().map { it.packageName }.toSet()

                pm.getInstalledApplications(PackageManager.GET_META_DATA)
                    .filter { appInfo ->
                        // ユーザーがインストールしたアプリのみ（システムアプリ除外）
                        appInfo.flags and ApplicationInfo.FLAG_SYSTEM == 0
                    }
                    .map { appInfo ->
                        InstalledAppInfo(
                            packageName = appInfo.packageName,
                            appName = pm.getApplicationLabel(appInfo).toString(),
                            isAlreadyAdded = appInfo.packageName in blockedPackages
                        )
                    }
                    .sortedBy { it.appName }
            }
            _installedApps.value = apps
        }
    }

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
    }

    fun addApp(info: InstalledAppInfo) {
        viewModelScope.launch {
            dao.insert(
                BlockedApp(
                    packageName = info.packageName,
                    appName = info.appName,
                    isEnabled = true
                )
            )
            // リストを更新
            _installedApps.update { current ->
                current.map { if (it.packageName == info.packageName) it.copy(isAlreadyAdded = true) else it }
            }
        }
    }
}
