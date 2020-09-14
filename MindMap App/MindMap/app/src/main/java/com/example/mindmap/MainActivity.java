package com.example.mindmap;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.recyclerview.widget.DefaultItemAnimator;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Map;

import static java.util.Arrays.asList;

public class MainActivity extends AppCompatActivity {


    private ListView listView;
    private ArrayList<String> data;
    private CustomAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        listView = findViewById(R.id.listView);
        data = new ArrayList<>();

        adapter = new CustomAdapter(this, data);
        listView.setAdapter(adapter);

        final EditText input = new EditText(MainActivity.this);
        ConstraintLayout.LayoutParams lp = new ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(10, 10, 10,10);
        input.setLayoutParams(lp);
        input.setPadding(10, 20, 10, 20);
        AlertDialog.Builder alertDialog = new AlertDialog.Builder(MainActivity.this)
                .setTitle("Project Title")
                .setMessage("Enter team name for mind-map")
                .setView(input)
                .setIcon(android.R.drawable.ic_input_get)
                .setPositiveButton("Done",
                        new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                if (input.getText() != null && !input.getText().toString().isEmpty()) {
                                    String title = input.getText().toString();
                                    input.setText("");
                                    func(title);
                                }
                            }
                        })
                .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        input.setText("");
                        dialogInterface.cancel();
                    }
                });

        final AlertDialog alertDialog1 = alertDialog.create();

        findViewById(R.id.fab).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                alertDialog1.show();

            }
        });
    }

    private void func(String title) {
        data.add("ABC");
        adapter.notifyDataSetChanged();
        startActivity(new Intent(MainActivity.this, MapActivity.class).putExtra("title", title));
    }

}