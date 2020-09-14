package com.example.mindmap;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;
import android.widget.Toolbar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.core.content.ContextCompat;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.WatchEvent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

public class MapActivity extends AppCompatActivity {

    private ScaleGestureDetector scaleGestureDetector;
    private float scaleFactor = 1.0f;
    private CustomConstraintLayout constraintLayout;
    private View v;

    private ActionBar toolbar;

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(MapActivity.this, "Permission Granted", Toast.LENGTH_SHORT).show();
            takeScreenshot(constraintLayout.getBitmap());
        }
    }


    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        scaleGestureDetector = new ScaleGestureDetector(this, new ScaleListener());
        constraintLayout = findViewById(R.id.constraintLayout);

        constraintLayout.addNode();

        String title = getIntent().getStringExtra("title");
        toolbar = getSupportActionBar();
        toolbar.setTitle(title);
        BottomNavigationView navigation = findViewById(R.id.nav_view);
        navigation.setOnNavigationItemSelectedListener(mOnNavigationItemSelectedListener);

    }

    private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener
            = new BottomNavigationView.OnNavigationItemSelectedListener() {

        @Override
        public boolean onNavigationItemSelected(@NonNull MenuItem item) {
            switch (item.getItemId()) {
                case R.id.Undo:
                    constraintLayout.performUndo();
                    return true;
                case R.id.Save:
                    if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
                        Toast.makeText(MapActivity.this, "Permission Granted", Toast.LENGTH_SHORT).show();
                        takeScreenshot(constraintLayout.getBitmap());
                    }
                    else {
                        requestPermissions(new String[] {Manifest.permission.WRITE_EXTERNAL_STORAGE}, 0);
                    }
                    return true;
                case R.id.Redo:
                    constraintLayout.performRedo();
                    return true;
            }
            return false;
        }
    };


    public void takeScreenshot(Bitmap bitmap) {

        String state = Environment.getExternalStorageState();
        if (!Environment.MEDIA_MOUNTED.equals(state))
            return;

        File file = new File(getExternalFilesDir(null), "screenshot.png");

        try {
            FileOutputStream fos;
            fos = new FileOutputStream(file, true);
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.flush();
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }


    }
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        scaleGestureDetector.onTouchEvent(event);
        return true;
    }

    private class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
        @Override
        public boolean onScale(ScaleGestureDetector scaleGestureDetector) {
            scaleFactor *= scaleGestureDetector.getScaleFactor();
            scaleFactor = Math.max(0.1f, Math.min(scaleFactor, 10.0f));
            constraintLayout.setScaleX(scaleFactor);
            constraintLayout.setScaleY(scaleFactor);
            return true;
        }
    }
}