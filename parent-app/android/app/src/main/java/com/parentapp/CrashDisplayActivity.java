package com.parentapp;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

public class CrashDisplayActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String error = getIntent().getStringExtra("error");
        if (error == null || error.isEmpty()) {
            error = "Unknown error occurred.";
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(40, 60, 40, 40);
        root.setBackgroundColor(0xFF0F172A); // Dark slate

        TextView title = new TextView(this);
        title.setText("⚠️ Application Diagnostic Error");
        title.setTextSize(18);
        title.setTextColor(0xFFEF4444); // Red
        title.setPadding(0, 0, 0, 20);
        root.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("Please copy and share this error message:");
        subtitle.setTextSize(13);
        subtitle.setTextColor(0xFF94A3B8);
        subtitle.setPadding(0, 0, 0, 20);
        root.addView(subtitle);

        Button copyButton = new Button(this);
        copyButton.setText("📋 Copy Error Details");
        final String finalError = error;
        copyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("ParentApp Crash Log", finalError);
                if (clipboard != null) {
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(CrashDisplayActivity.this, "Copied to clipboard!", Toast.LENGTH_SHORT).show();
                }
            }
        });
        root.addView(copyButton);

        ScrollView scrollView = new ScrollView(this);
        scrollView.setPadding(0, 20, 0, 0);

        TextView errorText = new TextView(this);
        errorText.setText(error);
        errorText.setTextColor(0xFFF1F5F9);
        errorText.setTextSize(12);
        errorText.setTextIsSelectable(true);
        scrollView.addView(errorText);

        root.addView(scrollView);

        setContentView(root);
    }
}
