package com.ganbaront.douyin;

import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private long lastBackTime = 0L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 13+：注册系统新通道回调（predictive back）
        // HyperOS 等新系统会绕过 onBackPressed 直接走该通道，必须在这里拦截
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::handleBack);
        }
    }

    /**
     * 返回逻辑（新旧通道统一入口）：
     * 1. 当前不在首页（/me、/video-detail 等任何路由）→ 按一次返回首页
     * 2. 已在首页 → 第一次提示"再按一次退出应用 (v4)"，2 秒内第二次才真正退出
     */
    private void handleBack() {
        WebView webView = bridge != null ? bridge.getWebView() : null;
        String url = webView != null ? webView.getUrl() : null;
        android.util.Log.d("DouyinBack", "handleBack fired, url=" + url);
        if (webView == null) {
            finish();
            return;
        }
        if (!isHomeUrl(url)) {
            android.util.Log.d("DouyinBack", "not home -> loadUrl home");
            webView.loadUrl(getHomeUrl(url));
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastBackTime < 2000L) {
            android.util.Log.d("DouyinBack", "double back -> finish");
            finish();
        } else {
            lastBackTime = now;
            android.util.Log.d("DouyinBack", "first back on home -> toast");
            Toast.makeText(this, "再按一次退出应用 (v4)", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isHomeUrl(String url) {
        if (url == null) {
            return true;
        }
        String path = Uri.parse(url).getPath();
        return path == null || path.isEmpty() || "/".equals(path) || "/index.html".equals(path)
                || "/home".equals(path);
    }

    private String getHomeUrl(String current) {
        Uri uri = Uri.parse(current == null ? "https://localhost/" : current);
        String host = uri.getHost() != null ? uri.getHost() : "localhost";
        int port = uri.getPort();
        return uri.getScheme() + "://" + host + (port > 0 ? ":" + port : "") + "/";
    }

    /**
     * Android 12 及以下的旧通道兜底（13+ 由上方 OnBackInvokedCallback 接管）
     */
    @Override
    public void onBackPressed() {
        handleBack();
    }
}
