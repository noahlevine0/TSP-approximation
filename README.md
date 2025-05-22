# TSP-approximation
Christofides Algorithm (1.5x Approximation of TSP)

0. create a folder containing index.html and backend.js (and this file if you'd like)

1. navigate to this folder that has frontend (index.html) and backend (backend.js) via the shell

2. type in 'npm install express cors' into the terminal (this installs the dependencies)

3. type in 'node backend.js' into the terminal. this will run the server on localhost 3000

4. now, you can open up the frontend (index.html) which will direct you to the UI

5. in the textbox, input points like: (1,2), (3,4), or click on the graph to add points

  - NOTE: you can combine clicking with typing, and the graph only works with integers!!
  - NOTE: the blue dot in the graph represents the origin. it will not be included in the tour. 
          unless you explicitly add / click on it

6. if you use a small cluster of points or wide spread points, you can click on the + or - 
   zoom button to be able to view all points. this will zoom in or out (from the origin)

  - NOTE: the first point inputted / clicked will also be the last point in the tour. this may 
          affect the distance of the entire tour

7. have fun with the website! The algorithm I used (Christofides) runs in around O(n^3) runtime
   where n is the number of nodes / points on the plot. Christofides has an error bound of 1.5*
   at most, meaning the distance generated using my server will be at most 1.5 times worse than
   the optimal tour. However, this is only for large n's and one rare type of graph. in reality,
   my tsp will probably generate a tour that is 1 to 1.3 times worse than the optimal tour. 
