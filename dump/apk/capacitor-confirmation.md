# HEXscout Android APK — confirmation that it's Capacitor

Source: HEX.apk pulled from /data/app/dev.cardio.hexscout by user, 2026-05-15.

## AndroidManifest.xml — key strings

```
android
android.intent.action.MAIN
android.permission.INTERNET
androidx.startup
com.android.stamp.source
com.android.stamp.type
com.android.vending.splits
dev.cardio.hexscout
https://play.google.com/store
```

## Verified Capacitor markers

| File | Purpose |
|---|---|
| `assets/capacitor.config.json` | Capacitor app config |
| `assets/capacitor.plugins.json` | Plugin registration |
| `assets/native-bridge.js` | JS-side Capacitor bridge (begins with `/*! Capacitor: https://capacitorjs.com/ - MIT License */`) |
| `assets/public/` | The web bundle |
| `assets/public/_next/...` | Next.js `out/` directory (next export) |
| `assets/dexopt/` | Capacitor dexopt cache |
| `classes.dex` contains `com/getcapacitor/...` classes | Native bridge implementation |

## capacitor.config.json (verbatim)
```json
{
	"appId": "com.hexscout",
	"appName": "HEXscout",
	"webDir": "out",
	"bundledWebRuntime": false
}
```

## capacitor.plugins.json (verbatim)
```json
[
	{
		"pkg": "@capacitor/app",
		"classpath": "com.capacitorjs.plugins.app.AppPlugin"
	},
	{
		"pkg": "@capacitor/preferences",
		"classpath": "com.capacitorjs.plugins.preferences.PreferencesPlugin"
	}
]
```

## Capacitor classes present in classes.dex
```
com/getcapacitor/AndroidProtocolHandler
com/getcapacitor/App
com/getcapacitor/AppUUID
com/getcapacitor/Bridge
com/getcapacitor/BridgeActivity
com/getcapacitor/BridgeFragment
com/getcapacitor/BridgeWebChromeClient
com/getcapacitor/BridgeWebViewClient
com/getcapacitor/CapConfig
com/getcapacitor/CapacitorWebView
com/getcapacitor/FileUtils
com/getcapacitor/InvalidPluginException
com/getcapacitor/InvalidPluginMethodException
com/getcapacitor/JSArray
com/getcapacitor/JSExport
com/getcapacitor/JSExportException
com/getcapacitor/JSInjector
com/getcapacitor/JSObject
com/getcapacitor/JSValue
com/getcapacitor/Logger
com/getcapacitor/MessageHandler
com/getcapacitor/NativePlugin
com/getcapacitor/PermissionState
com/getcapacitor/Plugin
com/getcapacitor/PluginCall
com/getcapacitor/PluginConfig
com/getcapacitor/PluginHandle
com/getcapacitor/PluginInvocationException
com/getcapacitor/PluginLoadException
com/getcapacitor/PluginManager
com/getcapacitor/PluginMethod
com/getcapacitor/PluginMethodHandle
com/getcapacitor/PluginResult
com/getcapacitor/ProcessedRoute
com/getcapacitor/RouteProcessor
com/getcapacitor/ServerPath
com/getcapacitor/UriMatcher
com/getcapacitor/WebViewListener
com/getcapacitor/WebViewLocalServer
com/getcapacitor/android/BuildConfig
com/getcapacitor/android/R
com/getcapacitor/annotation/ActivityCallback
com/getcapacitor/annotation/CapacitorPlugin
com/getcapacitor/annotation/Permission
com/getcapacitor/annotation/PermissionCallback
com/getcapacitor/cordova/CapacitorCordovaCookieManager
com/getcapacitor/cordova/MockCordovaInterfaceImpl
com/getcapacitor/cordova/MockCordovaWebViewImpl
com/getcapacitor/plugin/CapacitorCookieManager
com/getcapacitor/plugin/CapacitorCookies
com/getcapacitor/plugin/CapacitorHttp
com/getcapacitor/plugin/WebView
com/getcapacitor/plugin/util/AssetUtil
com/getcapacitor/plugin/util/CapacitorHttpUrlConnection
com/getcapacitor/plugin/util/HttpRequestHandler
com/getcapacitor/plugin/util/ICapacitorHttpUrlConnection
com/getcapacitor/plugin/util/MimeType
com/getcapacitor/util/HostMask
com/getcapacitor/util/InternalUtils
com/getcapacitor/util/JSONUtils
com/getcapacitor/util/PermissionHelper
com/getcapacitor/util/WebColor
```

## Capacitor official plugins included
```
com/capacitorjs/plugins/app
com/capacitorjs/plugins/preferences
```

## Cordova compat layer

9Apache Cordova native platform version 10.1.1 is starting
