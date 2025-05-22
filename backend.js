/* Noah Levine 
 * Mr. Menezes
 * AT Algorithms
 * 4/28/25
*/

const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json());

class TSPSolver {
    static calculateTour(points) {
        if (!points || !Array.isArray(points)) {
            throw new Error("Please input an array of points");
        }
        if (points.length < 2) {
            throw new Error("Input at least 2 points minimum");
        }

        //creating a distance matrix (sort of like a adjacency matrix, but each index has a distance)
        const n = points.length;
        const distMatrix = Array.from({ length: n }, () => new Array(n).fill(0));
        //the distance matrix is also a complete graph matrix (where all nodes are connected to eachother)
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    distMatrix[i][j] = Math.sqrt(
                        Math.pow(points[i].x - points[j].x, 2) + 
                        Math.pow(points[i].y - points[j].y, 2)
                    );
                }
            }
        }


        const { parent } = this.primMST(distMatrix); //algorith m steps
        const oddVertices = this.findOddDegreeVertices(parent, n);
        const matching = this.minWeightPerfectMatching(oddVertices, distMatrix);
        const multigraph = this.combineGraphs(parent, matching, n);
        const eulerian = this.findEulerianCircuit(multigraph);

        return this.makeHamiltonian(eulerian, points, distMatrix);
    } //TODO : update: click on map to specify points

    static primMST(distMatrix) { //prims algorithm
        const n = distMatrix.length;
        const parent = new Array(n).fill(-1);
        const key = new Array(n).fill(Infinity);
        const inMST = new Array(n).fill(false);
        key[0] = 0;

        for (let count = 0; count < n - 1; count++) {
            const u = this.minKey(key, inMST);
            inMST[u] = true;

            for (let v = 0; v < n; v++) {
                if (distMatrix[u][v] > 0 && !inMST[v] && distMatrix[u][v] < key[v]) {
                    parent[v] = u;
                    key[v] = distMatrix[u][v];
                }
            }
        }
        return { parent }; //return parent array
    }

    static minKey(key, inMST) { //helper for prims (min key value not present in mst)
        let min = Infinity, minIndex = -1;
        for (let v = 0; v < key.length; v++) {
            if (!inMST[v] && key[v] < min) { 
                min = key[v];
                minIndex = v;
            }
        }
        return minIndex;
    }

    static findOddDegreeVertices(parent, n) { //finding odd degree vertices in the MST
        const degree = new Array(n).fill(0);
        for (let i = 1; i < n; i++) {
            degree[i]++;
            degree[parent[i]]++; //counting the degrees
        }
        return degree.map((d, i) => d % 2 === 1 ? i : -1).filter(v => v !== -1); //filter out the even ones
    }

    static minWeightPerfectMatching(vertices, distMatrix) { //greedy algorithm
        const matching = [];
        const matched = new Array(distMatrix.length).fill(false);
        
        const edges = []; //generate all possible edges between vertices (complete graph)
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                edges.push({
                    u: vertices[i],
                    v: vertices[j],
                    weight: distMatrix[vertices[i]][vertices[j]]
                });
            }
        }
        edges.sort((a, b) => a.weight - b.weight); //sort edges by weight (done in place)

        //use a greedy algoirthm to select edges
        for (const edge of edges) {
            if (!matched[edge.u] && !matched[edge.v]) {
                matching.push([edge.u, edge.v]);
                matched[edge.u] = matched[edge.v] = true;
            }
        }
        return matching;
    }

    static combineGraphs(mstParent, matching, n) {
        const adj = Array.from({ length: n }, () => []);
        
        //add mst edges
        for (let i = 1; i < n; i++) {
            adj[i].push(mstParent[i]);
            adj[mstParent[i]].push(i);
        }
        
        //add mathcing edges
        for (const [u, v] of matching) {
            adj[u].push(v);
            adj[v].push(u);
        }
        
        return adj;
    }

    static findEulerianCircuit(adj) { //hierholzer's algorithm
        const circuit = [];
        const stack = [0]; //starting at the 0 vertex
        const currentPath = [];
        
        while (stack.length) { 
            const u = stack[stack.length - 1];
            if (adj[u].length) {
                const v = adj[u].pop(); //remove edge 
                stack.push(v); //keep moving
            } else {
                currentPath.push(stack.pop()); //add to circuit when no edges left
            }
        }
        return currentPath.reverse(); //this returns correct order
    }

    static makeHamiltonian(eulerian, points, distMatrix) { //converting eulerian circuit to hamiltonian 
        const visited = new Set();                         //cycle by skipping previosuly visited nodes
        const tour = [];                                   //shortcut to new nodes using edges
        let distance = 0;
        
        for (const v of eulerian) {
            const point = points[v];
            const key = `${point.x},${point.y}`; //identifier for coordinates
            
            if (!visited.has(key)) { //checking if it has been visited
                visited.add(key); 
                if (tour.length) {
                    distance += distMatrix[tour[tour.length - 1].index][v]; //adding distance from the preivous node
                }
                tour.push({ ...point, index: v }); //add value to tour list (cloned version as to not modify the original)
            }
        }
        
        //return back to the start
        if (tour.length > 1) {
            distance += distMatrix[tour[tour.length - 1].index][tour[0].index];
            tour.push({...tour[0]});
        }
        
        return {
            tour: tour.map(p => ({ x: p.x, y: p.y })), //return a new array to frontend where every index has a point object
            totalDistance: distance
        };
    }
}

app.post('/calculate-tour', (req, res) => {
    try {
        const points = req.body.points;
        if (!Array.isArray(points)) {
            throw new Error("Points must be in array form");
        }
        
        points.forEach((p, i) => {
            if (typeof p.x !== 'number' || typeof p.y !== 'number' || isNaN(p.x) || isNaN(p.y)) {
                throw new Error(`Invalid coordinates at position ${i}: ${JSON.stringify(p)}`); //invalid position handling
            }
        });
        
        const result = TSPSolver.calculateTour(points);
        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});