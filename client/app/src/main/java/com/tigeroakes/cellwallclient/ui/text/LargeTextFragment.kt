package com.tigeroakes.cellwallclient.ui.text

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.tigeroakes.cellwallclient.R
import kotlinx.android.synthetic.main.large_text_fragment.*

class LargeTextFragment : Fragment(), Observer<String> {

    companion object {
        private const val ARG_TEXT = "text"

        fun newInstance(text: String) = LargeTextFragment().apply {
            arguments = Bundle().apply { putString(ARG_TEXT, text) }
        }
    }

    private lateinit var viewModel: LargeTextViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.large_text_fragment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(LargeTextViewModel::class.java)

        arguments?.run {
            getString(ARG_TEXT)?.let { viewModel.setText(it) }
        }

        viewModel.getText().observe(this, this)
    }

    override fun onChanged(text: String?) {
        large_text.text = text
    }
}
