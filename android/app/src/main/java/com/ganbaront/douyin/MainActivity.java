package com.ganbaront.douyin;

import android.net.Uri;
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
     * 返回逻辑（覆盖所有系统版本与手势路径）：
     * 1. 当前不在首页（/me、/video-detail 等任何路由）→ 按一次返回首页
     * 2. 已在首页 → 第一次提示"再按一次退出应用"，2 秒内第二次才真正退出
     */
    @Override
    public void onBackPressed() {
        WebView webView = bridge != null ? bridge.getWebView() : null;
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        String url = webView.getUrl();
        if (!isHomeUrl(url)) {
            webView.loadUrl(getHomeUrl(url));
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

    private boolean isHomeUrl(String url) {
        if (url == null) {
            return true;
        }
        String path = Uri.parse(url).getPath();
        return path == null || path.isEmpty() || "/".equals(path) || "/index.html".equals(path);
    }

    private String getHomeUrl(String current) {
        Uri uri = Uri.parse(current == null ? "https://localhost/" : current);
        String host = uri.getHost() != null ? uri.getHost() : "localhost";
        int port = uri.getPort();
        return uri.getScheme() + "://" + host + (port > 0 ? ":" + port : "") + "/";
    }
}
