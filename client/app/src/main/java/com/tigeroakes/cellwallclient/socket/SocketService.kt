package com.tigeroakes.cellwallclient.socket

import android.content.res.Resources
import android.net.Uri
import com.tigeroakes.cellwallclient.data.CellState
import com.tigeroakes.cellwallclient.socket.ServerUris.withSocketNamespace
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.util.concurrent.TimeoutException

/**
 * Service layer that connects/disconnects to the server and
 * sends and receives events too.
 */
object SocketService {
    private const val EVENT_CELL_UPDATE = "cell-update"

    private var serverAddress: Uri? = null
    private var socket: Socket? = null
    private var socketListener: SocketListener? = null

    /**
     * Connects the socket to the given server address, removing and old socket if there was any.
     * @param address URL to the server. Expected to have a http:// or https:// scheme.
     * @param id Unique identifier for this client. Should always be the same per-client.
     */
    fun connect(address: Uri, id: String) {
        // Remove old socket, if any
        if (serverAddress != address) {
            socket?.apply {
                disconnect()
                off()
                Unit
            }

            // Create new socket and attach listeners
            socket = IO.socket(withSocketNamespace(address).toString(), buildOptions(id))
            socketListener?.let { addListeners() }
            serverAddress = address
        }

        // Connect to server
        socket?.apply {
            if (!connected()) {
                socketListener?.onConnecting()
                connect()
            }
        }
    }

    /**
     * Disconnects the socket from the server.
     * No-op if connect was not called yet.
     */
    fun disconnect() {
        socket?.disconnect()
    }

    /**
     * Sets the listener for this socket. The listener is expected to implement functions to handle
     * all important events for the socket.
     */
    fun setListener(listener: SocketListener?) {
        socketListener = listener
        if (listener != null) {
            addListeners()
        } else {
            socket?.apply { off() }
        }
    }

    /**
     * Creates a socket.io options object with a query string that includes the device screen size
     * and client ID.
     * @param id Unique identifier for this client. Should always be the same per-client.
     */
    private fun buildOptions(id: String) = IO.Options().apply {
        val display = Resources.getSystem().displayMetrics

        query = Uri.Builder()
                .appendQueryParameter("cellId", id)
                .appendQueryParameter("width", display.widthPixels.toString())
                .appendQueryParameter("height", display.heightPixels.toString())
                .build()
                .query
    }

    private fun addListeners() {
        socket?.apply {
            on(Socket.EVENT_CONNECT, onConnect)
            on(Socket.EVENT_DISCONNECT, onDisconnect)
            on(Socket.EVENT_CONNECT_ERROR, onConnectError)
            on(Socket.EVENT_CONNECT_TIMEOUT, onConnectTimeout)
            on(EVENT_CELL_UPDATE, onCellUpdate)
        }
    }

    private val onConnect = Emitter.Listener {
        socketListener?.onConnect()
    }

    private val onDisconnect = Emitter.Listener {
        socketListener?.onDisconnect()
    }

    private val onConnectError = Emitter.Listener {
        socketListener?.onConnectError(it[0] as Throwable)
    }

    private val onConnectTimeout = Emitter.Listener {
        socketListener?.onConnectError(TimeoutException())
    }

    private val onCellUpdate = Emitter.Listener {
        socketListener?.onCellUpdate(CellState.from(it[0] as String, it[1] as JSONObject))
    }
}