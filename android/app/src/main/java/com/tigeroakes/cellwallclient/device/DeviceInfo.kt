package com.tigeroakes.cellwallclient.device

import android.os.Build
import android.util.DisplayMetrics
import com.tigeroakes.cellwallclient.model.CellInfo

/**
 * Returns manufacturer name followed by model name.
 *
 * Example results: Samsung GT-S5830L, HTC Wildfire S A510e
 * @see {https://stackoverflow.com/questions/1995439/get-android-phone-model-programmatically}
 */
fun deviceName(): String {
    val manufacturer = Build.MANUFACTURER
    val model = Build.MODEL

    return if (model.startsWith(manufacturer)) {
        model.capitalize()
    } else {
        manufacturer.capitalize() + " " + model.capitalize()
    }
}

fun getCellInfo(metrics: DisplayMetrics): CellInfo {
    return CellInfo(
            deviceName = deviceName(),
            density = metrics.densityDpi,
            widthPixels = metrics.widthPixels,
            heightPixels = metrics.heightPixels
    )
}