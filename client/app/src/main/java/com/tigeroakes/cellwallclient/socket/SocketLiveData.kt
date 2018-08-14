package com.tigeroakes.cellwallclient.socket

import android.os.Handler
import android.os.Looper
import androidx.lifecycle.LiveData
import io.socket.emitter.Emitter

/**
 * LiveData class that can be used as a listener for a {@link Socket}.
 * When the server sends over data, the arguments are set as the new live data value.
 */
class SocketLiveData : LiveData<Array<out Any?>>(), Emitter.Listener {
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun call(vararg args: Any?) {
        mainHandler.post {
            value = args
        }
    }
}