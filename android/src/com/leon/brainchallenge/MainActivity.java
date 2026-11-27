package com.leon.brainchallenge;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Offline WebView host for the "Brain Challenge!" (مغزتو به چالش بکش!) web game.
 *
 * - The entire static export of the game ships in the APK assets folder and is
 *   served to the WebView through shouldInterceptRequest() over a synthetic
 *   https origin (https://appassets.local/) so that localStorage, WebAudio and
 *   fetch() behave exactly like on a real website — fully offline.
 * - A native studio splash (Candy Team logo) is shown while the game loads.
 * - The Android system back button is forwarded to the game via
 *   window.__handleAndroidBack(); only when the game is on its main menu does
 *   the double-back-to-exit pattern apply.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.local";
    private static final String START_URL = "https://" + HOST + "/index.html";

    private WebView webView;
    private View splashOverlay;
    private long lastBackAt = 0L;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#030206"));
        window.setNavigationBarColor(Color.parseColor("#33205E"));

        webView = new WebView(this);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setTextZoom(100); /* keep the game layout independent of system font scale */
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (HOST.equals(url.getHost())) {
                    return serveAsset(url.getPath());
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                /* never navigate away from the bundled game */
                return !HOST.equals(request.getUrl().getHost());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                /* the web game shows its own splash; hand over smoothly */
                view.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        hideSplash();
                        /* settle the status bar onto the game's deep purple */
                        getWindow().setStatusBarColor(Color.parseColor("#33205E"));
                    }
                }, 450);
            }
        });

        applyImmersive();

        /* root = webview + studio splash on top */
        FrameLayout root = new FrameLayout(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        ImageView splash = new ImageView(this);
        splash.setScaleType(ImageView.ScaleType.FIT_CENTER);
        splash.setBackgroundColor(Color.parseColor("#030206"));
        int pad = (int) (32 * getResources().getDisplayMetrics().density);
        splash.setPadding(pad, pad, pad, pad);
        try {
            splash.setImageBitmap(BitmapFactory.decodeStream(getAssets().open("candy-team-logo.png")));
        } catch (IOException ignored) {
            /* no logo asset — keep the colored splash */
        }
        root.addView(splash, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        splashOverlay = splash;

        setContentView(root);
        webView.loadUrl(START_URL);
    }

    private void hideSplash() {
        final View v = splashOverlay;
        if (v == null || v.getVisibility() != View.VISIBLE) {
            return;
        }
        v.animate().alpha(0f).setDuration(400).withEndAction(new Runnable() {
            @Override
            public void run() {
                v.setVisibility(View.GONE);
            }
        }).start();
    }

    private void applyImmersive() {
        View decor = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            decor.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
        /* re-apply after focus changes (dialogs, keyboard, ...) */
        decor.setOnSystemUiVisibilityChangeListener(new View.OnSystemUiVisibilityChangeListener() {
            @Override
            public void onSystemUiVisibilityChange(int visibility) {
                applyImmersive();
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyImmersive();
        }
    }

    /* ------------------------------------------------------------------ */
    /* Back button: route into the game first, exit only on second press   */
    /* ------------------------------------------------------------------ */

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
                "(window.__handleAndroidBack && window.__handleAndroidBack()) ? '1' : '0'",
                new android.webkit.ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        if ("\"1\"".equals(value)) {
                            return; /* consumed by in-game navigation */
                        }
                        long now = System.currentTimeMillis();
                        if (now - lastBackAt < 2200L) {
                            finish();
                        } else {
                            lastBackAt = now;
                            try {
                                Toast.makeText(MainActivity.this,
                                        readAssetText("exit-hint.txt"), Toast.LENGTH_SHORT).show();
                            } catch (Throwable t) {
                                Toast.makeText(MainActivity.this, "Back again to exit", Toast.LENGTH_SHORT).show();
                            }
                        }
                    }
                });
    }

    private String readAssetText(String name) {
        try {
            InputStream in = getAssets().open(name);
            java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
            byte[] b = new byte[2048];
            int n;
            while ((n = in.read(b)) > 0) {
                buf.write(b, 0, n);
            }
            in.close();
            return buf.toString("UTF-8").trim();
        } catch (IOException e) {
            return "";
        }
    }

    /* ------------------------------------------------------------------ */
    /* Local asset serving                                                 */
    /* ------------------------------------------------------------------ */

    private static final Map<String, String> MIME;
    static {
        MIME = new HashMap<>();
        MIME.put("html", "text/html");
        MIME.put("js", "application/javascript");
        MIME.put("mjs", "application/javascript");
        MIME.put("css", "text/css");
        MIME.put("json", "application/json");
        MIME.put("map", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("gif", "image/gif");
        MIME.put("webp", "image/webp");
        MIME.put("svg", "image/svg+xml");
        MIME.put("ico", "image/x-icon");
        MIME.put("txt", "text/plain");
        MIME.put("woff", "font/woff");
        MIME.put("woff2", "font/woff2");
        MIME.put("ttf", "font/ttf");
        MIME.put("otf", "font/otf");
        MIME.put("mp3", "audio/mpeg");
        MIME.put("ogg", "audio/ogg");
        MIME.put("wav", "audio/wav");
        MIME.put("mp4", "video/mp4");
    }

    private WebResourceResponse serveAsset(String rawPath) {
        String path = (rawPath == null || rawPath.isEmpty()) ? "/index.html" : rawPath;
        if (path.equals("/")) {
            path = "/index.html";
        }
        String assetPath = path.substring(1); /* strip leading slash */

        String ext = "";
        int dot = assetPath.lastIndexOf('.');
        if (dot >= 0) {
            ext = assetPath.substring(dot + 1).toLowerCase();
        }
        String mime = MIME.get(ext);
        if (mime == null) {
            mime = "application/octet-stream";
        }
        String encoding = (mime.startsWith("text/") || mime.contains("javascript")
                || mime.contains("json") || mime.contains("svg+xml")) ? "utf-8" : null;

        try {
            InputStream in = getAssets().open(assetPath);
            return new WebResourceResponse(mime, encoding, in);
        } catch (IOException e) {
            /* asset not found — serve an empty 404 */
            try {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                        new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
            } catch (Throwable t) {
                return null;
            }
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
