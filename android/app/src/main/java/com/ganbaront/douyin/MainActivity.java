package com.ganbaront.douyin;

import android.os.Bundle;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private long lastBackTime = 0L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    /**
     * 直接覆写 Activity 级返回（配合 manifest 的 enableOnBackInvokedCallback=false，
     * 覆盖所有系统版本与手势路径）：
     * 1. WebView 有浏览历史 → 网页内返回
     * 2. 无历史 → 第一次提示"再按一次退出应用"，2 秒内第二次才真正退出
     */
    @Override
    public void onBackPressed() {
        WebView webView = bridge != null ? bridge.getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastBackTime < 2000L) {
            finish();
        } else {
            lastBackTime = now;
            Toast.makeText(this, "再按一次退出应用", Toast.LENGTH_SHORT).show();
        }
    }
}
