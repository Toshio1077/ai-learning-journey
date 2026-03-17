package com.example.snsblocker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.snsblocker.ui.screens.*
import com.example.snsblocker.ui.theme.SNSBlockerTheme
import com.example.snsblocker.util.PermissionHelper

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SNSBlockerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SNSBlockerNavHost()
                }
            }
        }
    }
}

@Composable
fun SNSBlockerNavHost() {
    val navController = rememberNavController()
    val context = LocalContext.current

    // アクセシビリティ権限の状態を監視（画面再表示時に再チェック）
    var isAccessibilityGranted by remember {
        mutableStateOf(PermissionHelper.isAccessibilityServiceEnabled(context))
    }
    var isUsageStatsGranted by remember {
        mutableStateOf(PermissionHelper.isUsageStatsPermissionGranted(context))
    }

    // 起動時に権限チェック → 未許可ならPermissionGuideへ
    val startDestination = if (isAccessibilityGranted) "home" else "permission_guide"

    NavHost(navController = navController, startDestination = startDestination) {

        composable("permission_guide") {
            // 画面に戻るたびに権限状態を再チェック
            val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
            val lifecycle = lifecycleOwner.lifecycle
            DisposableEffect(lifecycle) {
                val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
                    if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                        isAccessibilityGranted = PermissionHelper.isAccessibilityServiceEnabled(context)
                        isUsageStatsGranted = PermissionHelper.isUsageStatsPermissionGranted(context)
                    }
                }
                lifecycle.addObserver(observer)
                onDispose { lifecycle.removeObserver(observer) }
            }

            PermissionGuideScreen(
                isAccessibilityGranted = isAccessibilityGranted,
                isUsageStatsGranted = isUsageStatsGranted,
                onGrantAccessibility = {
                    context.startActivity(PermissionHelper.accessibilitySettingsIntent())
                },
                onGrantUsageStats = {
                    context.startActivity(PermissionHelper.usageAccessSettingsIntent())
                },
                onComplete = {
                    navController.navigate("home") {
                        popUpTo("permission_guide") { inclusive = true }
                    }
                }
            )
        }

        composable("home") {
            HomeScreen(
                onAddApp = { navController.navigate("app_picker") },
                onAppSettings = { packageName ->
                    navController.navigate("app_settings/$packageName")
                }
            )
        }

        composable("app_picker") {
            AppPickerScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = "app_settings/{packageName}",
            arguments = listOf(navArgument("packageName") { type = NavType.StringType })
        ) {
            AppSettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
