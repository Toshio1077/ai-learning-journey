package com.example.snsblocker.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PermissionGuideScreen(
    isAccessibilityGranted: Boolean,
    isUsageStatsGranted: Boolean,
    onGrantAccessibility: () -> Unit,
    onGrantUsageStats: () -> Unit,
    onComplete: () -> Unit
) {
    val allGranted = isAccessibilityGranted && isUsageStatsGranted

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("初期設定", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "SNS Blockerを使うために\n2つの権限が必要です",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "どちらもアプリの監視目的のみに使用し、個人情報は一切収集しません。",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            PermissionItem(
                icon = Icons.Default.Security,
                title = "アクセシビリティサービス",
                description = "起動中のアプリを検知してブロックするために必要です。",
                isGranted = isAccessibilityGranted,
                onGrant = onGrantAccessibility
            )

            PermissionItem(
                icon = Icons.Default.Timeline,
                title = "使用状況へのアクセス",
                description = "1日の使用時間を計測するために必要です。時間帯ブロックのみ使う場合は不要です。",
                isGranted = isUsageStatsGranted,
                onGrant = onGrantUsageStats
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (allGranted) {
                Button(
                    onClick = onComplete,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("設定完了 - アプリを使い始める", fontWeight = FontWeight.Bold)
                }
            } else if (isAccessibilityGranted) {
                // アクセシビリティのみでも最低限機能するため進めることができる
                OutlinedButton(
                    onClick = onComplete,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Text("時間帯ブロックのみで始める")
                }
            }
        }
    }
}

@Composable
private fun PermissionItem(
    icon: ImageVector,
    title: String,
    description: String,
    isGranted: Boolean,
    onGrant: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isGranted)
                MaterialTheme.colorScheme.secondaryContainer
            else
                MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isGranted) MaterialTheme.colorScheme.secondary
                else MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (!isGranted) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = onGrant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("許可する")
                    }
                } else {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "✓ 許可済み",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
