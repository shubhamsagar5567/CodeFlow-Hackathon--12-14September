package com.example.mindmap;

import android.app.Activity;
import android.content.res.Resources;
import android.graphics.Color;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;

import com.google.android.material.card.MaterialCardView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;

public class CustomAdapter extends ArrayAdapter<String> {

    private int count = 1;

    CustomAdapter(Activity context, ArrayList<String> data) {
        super(context, 0, data);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        View listItemView = convertView;

        if (listItemView == null)
            listItemView = LayoutInflater.from(getContext()).inflate(R.layout.namecard, parent, false);


        ((TextView)listItemView.findViewById(R.id.titleTV)).setText(getItem(position));
        ((TextView)listItemView.findViewById(R.id.teamName)).setText("Project " + count);

        return listItemView;
    }

    private void showFullCards() {
        int totalItems = getCount();
    }
}
