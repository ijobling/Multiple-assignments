const turtle = new Turtle();

// BEGIN HOUSE-DRAWING CODE

// Draw a square for the base
turtle.pendown();
turtle.right(90);
turtle.forward(50);
turtle.right(90);
turtle.forward(50);
turtle.right(90);
turtle.forward(50);
turtle.right(90);
turtle.forward(50);

// Draw a triangle roof
turtle.left(90);
turtle.forward(10);
turtle.right(135);
turtle.forward(50);
turtle.right(90);
turtle.forward(50);
turtle.right(135);
turtle.forward(70);

// Go to the starting point
turtle.penup();
turtle.backward(10);
turtle.right(90);
turtle.backward(50);

// END HOUSE-DRAWING CODE

// Draw four different houses
drawHouse();
turtle.goto(100, 100);
drawHouse();
turtle.goto(200, 0);
drawHouse();
turtle.goto(100, -100);
drawHouse();