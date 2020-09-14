package com.example.mindmap;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import static java.util.Arrays.asList;

public class CustomConstraintLayout extends ConstraintLayout {

    private final int ROOT_NODE = 0;

    private Bitmap bitmap;
    private Canvas canvas;
    public Paint paint;
    private ImageView imageView;

    private View lastNode = null;
    private int lastNodeParentId = 0;

    private int flag = 1, width1, height1;

    private int edgeNumber = -1;
    private int nodeNumber = -1;
    private int parentNode = -1;

    private HashMap<Integer, int[]> nodeLocations = new HashMap<>();
    private HashMap<Integer, Integer> nodeIds = new HashMap<>();

    private HashMap<Integer, int[]> edges = new HashMap<>();

    private ConstraintSet constraintSet = new ConstraintSet();

    private OnClickListener onClickFab = new OnClickListener() {
        @Override
        public void onClick(View view) {
            Toast.makeText(CustomConstraintLayout.this.getContext(), "Add Node Clicked!", Toast.LENGTH_SHORT).show();
            parentNode = Integer.parseInt(view.getTag().toString());
            CustomConstraintLayout.this.addNode();
        }
    };
    private OnTouchListener onTouch = new OnTouchListener() {
        @SuppressLint("ClickableViewAccessibility")
        @Override
        public boolean onTouch(View view, MotionEvent motionEvent) {

            float dx = 0, dy = 0;

            if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                int node = Integer.parseInt(view.getTag().toString());
            }

            if (motionEvent.getAction() == MotionEvent.ACTION_MOVE) {
                float x = motionEvent.getX();
                float y = motionEvent.getY();
                float previousX = motionEvent.getRawX();
                float previousY = motionEvent.getRawY();

                dx = x - previousX;
                dy = y - previousY;

                view.animate()
                        .xBy(motionEvent.getRawX() + dx)
                        .yBy(motionEvent.getRawY() + dy)
                        .setDuration(0)
                        .start();

                view.invalidate();

            } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {

                if (nodeNumber > -1 ) {

                    int[] newLocation = new int[2];
                    int node = Integer.parseInt(view.getTag().toString());

                    newLocation[0] = (int) (motionEvent.getRawX() + dx);
                    newLocation[1] = (int) (motionEvent.getRawY() + dy);

                    nodeLocations.replace(node, newLocation);

                    String dragNodeInfoFinal = nodeIds.get(node) + ", " + Arrays.toString(nodeLocations.get(node)) + ", " + edges.toString();
                    Log.i("Drag Node Info Final", dragNodeInfoFinal);

                    initializeSketchBoard();

                    for(int i=0; i<edges.size(); i++) {
                        int parent = edges.get(i)[0];
                        int child = edges.get(i)[1];

                        drawEdge(nodeLocations.get(parent), nodeLocations.get(child));
                    }
                }
            }
            return true;
        }
    };
    public CustomConstraintLayout(@NonNull Context context) {
        super(context);
    }

    public CustomConstraintLayout(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public CustomConstraintLayout(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }


    public CustomConstraintLayout(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public void addNode() {
        // create new node
        View newNode = createNode();

        newNode.setId(generateViewId());

        newNode.findViewById(R.id.addNodeFab).setOnClickListener(onClickFab);
        newNode.setOnTouchListener(onTouch);

        nodeNumber++;
        newNode.setTag(nodeNumber);
        newNode.findViewById(R.id.addNodeFab).setTag(nodeNumber);

        int[] location1 = new int[2];
        int[] location2 = new int[2];

        if (flag == 0){
            initializeSketchBoard();
            flag =1;
        }

        if (parentNode == -1) {

            addView(newNode);
            constraintSet.clone(this);
            constraintSet.center(newNode.getId(), ConstraintSet.PARENT_ID, ConstraintSet.LEFT, 0, ConstraintSet.PARENT_ID, ConstraintSet.RIGHT, 0, 0.5f);
            constraintSet.applyTo(this);

            newNode.getLocationInWindow(location2);

            nodeIds.put(nodeNumber, newNode.getId());
            nodeLocations.put(nodeNumber, location2);

            flag=0;

        } else {

            edgeNumber++;
            addView(newNode);
            constraintSet.clone(this);
            constraintSet.connect(newNode.getId(), ConstraintSet.BOTTOM, nodeIds.get(parentNode), ConstraintSet.BOTTOM);
            constraintSet.applyTo(this);

            lastNode = newNode;
            lastNodeParentId = parentNode+1;

            View rootNode = this.getChildAt(parentNode+1);
            rootNode.getLocationInWindow(location1);
            nodeLocations.replace(parentNode, location1);

            location1[0] = location1[0] + 80;
            location1[1] = location1[1] - 100;

            nodeIds.put(nodeNumber, newNode.getId());
            newNode.getLocationInWindow(location2);
            nodeLocations.put(nodeNumber, location2);

            int[] edge = new int[2];
            edge[0] = parentNode;
            edge[1] = nodeNumber;
            edges.put(edgeNumber, edge);
            width1 = rootNode.getWidth();
            height1 = rootNode.getHeight();

            drawEdge(location1, location2);

            Log.i("Location1", Arrays.toString(location1));
        }


    }
    private void drawEdge(int [] location1, int [] location2){
        canvas.drawLine(location1[0], location1[1], location2[0] + width1/2, location2[1] - height1, paint);
        imageView.invalidate();
        imageView.setImageBitmap(bitmap);
    }

    private View createNode() {
        return inflate(this.getContext(), R.layout.node, null);
    }

    private void initializeSketchBoard() {
        imageView = this.findViewById(R.id.mImageView);
        bitmap = Bitmap.createBitmap(
                this.getWidth(), // Width
                this.getHeight(), // Height
                Bitmap.Config.ARGB_8888 // Config
        );
        canvas = new Canvas(bitmap);
        canvas.drawColor(Color.LTGRAY);
        paint = new Paint();
        paint.setColor(Color.RED);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(10);
        paint.setAntiAlias(true);
    }

    private void updateLocations(View rootNode, View childNode) {

        int childNodeNo = Integer.parseInt(childNode.getTag().toString());
        int rootNodeNo = Integer.parseInt(rootNode.getTag().toString());

        int[] location1 = new int[2];
        int[] location2 = new int[2];

        rootNode.getLocationInWindow(location1);
        nodeLocations.replace(rootNodeNo, location1);

        childNode.getLocationInWindow(location2);
        if (nodeLocations.containsKey(childNodeNo))
            nodeLocations.replace(childNodeNo, location2);
        else
            nodeLocations.put(childNodeNo, location2);
    }

    public Bitmap getBitmap() {
        return bitmap;
    }

    public void performUndo() {

        initializeSketchBoard();
        this.removeViewAt(lastNode.getId());

        for(int i=0; i<edges.size(); i++) {

            int parent = edges.get(i)[0];
            int child = edges.get(i)[1];

            Log.i("Child node", String.valueOf(child));
            Log.i("Last node", lastNode.getTag().toString());
            if(child != Integer.parseInt(lastNode.getTag().toString()))
                drawEdge(nodeLocations.get(parent), nodeLocations.get(child));
        }
    }

    public void performRedo() {
        addView(lastNode);
        constraintSet.clone(this);
        constraintSet.connect(lastNode.getId(), ConstraintSet.BOTTOM, lastNodeParentId, ConstraintSet.BOTTOM);
        constraintSet.applyTo(this);

        View rootNode = this.getChildAt(lastNodeParentId);
        updateLocations(rootNode, lastNode);

        width1 = lastNode.getWidth();
        height1 = lastNode.getHeight();

        int lastNodeNo = Integer.parseInt(lastNode.getTag().toString());

        initializeSketchBoard();

        for(int i=0; i<edges.size(); i++) {
            int parent = edges.get(i)[0];
            int child = edges.get(i)[1];

            drawEdge(nodeLocations.get(parent), nodeLocations.get(child));
        }
    }
}

