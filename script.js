let blocks = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist;
let edges = [];

let alerted = localStorage.getItem("alerted") || "";
if (alerted !== "yes") {
  alert(
    "Read instructions before proceeding by clicking i-icon in the top-right corner"
  );
  localStorage.setItem("alerted", "yes");
}

// It is called when user starts adding edges by clicking on button given
const addEdges = () => {
  if (cnt < 2) {
    alert("Create atleast two nodes to add an edge");
    return;
  }

  addEdge = true;
  document.getElementById("add-edge-enable").disabled = true;
  const items = document.getElementsByClassName("run-btn");
  for (let i = 0; i < items.length; i++) {
    items[i].disabled = false;
  }
  // Initializing array for adjacency matrix representation
  dist = new Array(cnt + 1)
    .fill(Infinity)
    .map(() => new Array(cnt + 1).fill(Infinity));
};

// Temporary array to store clicked elements to make an edge between the(max size =2)
let arr = [];

const appendBlock = (x, y) => {
  document.querySelector(".reset-btn").disabled = false;
  document.querySelector(".click-instruction").style.display = "none";
  // Creating a node
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.top = `${y}px`;
  block.style.left = `${x}px`;
  block.style.transform = `translate(-50%,-50%)`;
  block.id = cnt;

  block.innerText = cnt++;

  // Click event for node
  block.addEventListener("click", (e) => {
    // Prevent node upon node
    e.stopPropagation() || (window.event.cancelBubble = "true");

    // If state variable addEdge is false, can't start adding edges
    if (!addEdge) return;

    block.style.backgroundColor = "coral";
    arr.push(block.id);

    // When two elements are push, draw a edge and empty the array
    if (arr.length === 2) {
      drawUsingId(arr);
      arr = [];
    }
  });
  blocks.appendChild(block);
};

// Allow creating nodes on screen by clicking
blocks.addEventListener("click", (e) => {
  if (addEdge) return;
  if (cnt > 12) {
    alert("cannot add more than 12 vertices");
    return;
  }
  console.log(e.x, e.y);
  appendBlock(e.x, e.y);
});

// Function to draw a line between nodes
const drawLine = (x1, y1, x2, y2, ar) => {
  const [a, b] = ar.map(Number);
  // prevent multiple edges for same couple of nodes
  if (a === b || dist[a][b] !== Infinity) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    document.getElementById(arr[1]).style.backgroundColor = "#333";
    return;
  }

  console.log(ar);
  // Length of line
  const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  const slope = x2 - x1 ? (y2 - y1) / (x2 - x1) : y2 > y1 ? 90 : -90;

  const confirm = prompt("Enter edge weight");
  console.log({ confirm });
  let value = 0;
  if (!confirm) {
    value = Math.round(len / 10);
  } else {
    value = confirm * 1;
  }

  // Adding length to distance array
  dist[a][b] = value;
  dist[b][a] = value;
  edges.push([value, a, b]);

  // Drawing line
  const line = document.createElement("div");
  line.id = a < b ? `line-${a}-${b}` : `line-${b}-${a}`;
  line.classList.add("line");
  line.style.width = `${len}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;

  // Edge weight
  let p = document.createElement("p");
  p.classList.add("edge-weight");

  p.innerText = value;

  p.contentEditable = "true";
  p.inputMode = "numeric";
  p.addEventListener("blur", (e) => {
    if (isNaN(Number(e.target.innerText))) {
      alert("Enter valid edge weight");
      return;
    }
    n1 = Number(p.closest(".line").id.split("-")[1]);
    n2 = Number(p.closest(".line").id.split("-")[2]);
    console.log(p.closest(".line"), e.target.innerText, n1, n2);
    dist[n1][n2] = Number(e.target.innerText);
    dist[n2][n1] = Number(e.target.innerText);
  });
  line.style.transform = `rotate(${
    x1 > x2 ? Math.PI + Math.atan(slope) : Math.atan(slope)
  }rad)`;

  p.style.transform = `rotate(${
    x1 > x2 ? (Math.PI + Math.atan(slope)) * -1 : Math.atan(slope) * -1
  }rad)`;

  line.append(p);
  blocks.appendChild(line);
  document.getElementById(arr[0]).style.backgroundColor = "#333";
  document.getElementById(arr[1]).style.backgroundColor = "#333";
};

// Function to get (x, y) coordinates of clicked node
const drawUsingId = (ar) => {
  if (ar[0] === ar[1]) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    arr = [];
    return;
  }
  x1 = Number(document.getElementById(ar[0]).style.left.slice(0, -2));
  y1 = Number(document.getElementById(ar[0]).style.top.slice(0, -2));
  x2 = Number(document.getElementById(ar[1]).style.left.slice(0, -2));
  y2 = Number(document.getElementById(ar[1]).style.top.slice(0, -2));
  drawLine(x1, y1, x2, y2, ar);
};

const runPrims = async () => {
  clearScreen();
  let visited = Array(cnt).fill(false);
  visited[0] = true;
  let mstCost = 0;
  let result = [];

  while (result.length < cnt - 1) {
    let minEdge = [Infinity, -1, -1];
    for (let i = 0; i < cnt; i++) {
      if (visited[i]) {
        for (let j = 0; j < cnt; j++) {
          if (!visited[j] && dist[i][j] < minEdge[0]) {
            minEdge = [dist[i][j], i, j];
          }
        }
      }
    }
    result.push(minEdge);
    visited[minEdge[2]] = true;
    console.log(minEdge);
    mstCost += minEdge[0];
    let el = document.getElementById(
      `line-${Math.min(minEdge[1], minEdge[2])}-${Math.max(
        minEdge[1],
        minEdge[2]
      )}`
    );
    await indicateEdge(el);
  }
  alert("Prim's MST Cost: " + mstCost);
};

const runKruskals = async () => {
  clearScreen();
  edges.sort((a, b) => a[0] - b[0]);
  let parent = Array(cnt)
    .fill()
    .map((_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let mstCost = 0;
  let edgeCount = 0;

  for (const [w, u, v] of edges) {
    let pu = find(u),
      pv = find(v);
    if (pu !== pv) {
      parent[pu] = pv;
      mstCost += w;
      edgeCount++;
      let el = document.getElementById(
        `line-${Math.min(u, v)}-${Math.max(u, v)}`
      );
      if (el) await indicateEdge(el);
      if (edgeCount === cnt - 1) break;
    }
  }
  alert("Kruskal's MST Cost: " + mstCost);
};

// Function to find shortest path from given source to all other nodes
const findShortestPath = (el) => {
  let visited = [];
  let unvisited = [];
  clearScreen();

  let source = Number(el.previousElementSibling.value);
  if (source >= cnt || isNaN(source)) {
    alert("Invalid source");
    return;
  }
  document.getElementById(source).style.backgroundColor = "grey";
  // console.log(source);
  let parent = [];
  parent[source] = -1;
  visited = [];
  for (i = 0; i < cnt; i++) unvisited.push(i);

  // Array containing cost of reaching i(th) node from source
  let cost = [];
  for (i = 0; i < cnt; i++) {
    i === source
      ? null
      : dist[source][i]
      ? (cost[i] = dist[source][i])
      : (cost[i] = Infinity);
  }
  cost[source] = 0;

  // Array which will contain final minimum cost
  let minCost = [];
  minCost[source] = 0;

  // Repeating until all edges are visited
  while (unvisited.length) {
    let mini = cost.indexOf(Math.min(...cost));
    // console.log("draw", visited[visited.length-1],mini);
    visited.push(mini);
    unvisited.splice(unvisited.indexOf(mini), 1);

    for (j of unvisited) {
      if (j === mini) continue;
      // console.log(mini, j);
      if (cost[j] > dist[mini][j] + cost[mini]) {
        minCost[j] = dist[mini][j] + cost[mini];
        cost[j] = dist[mini][j] + cost[mini];
        parent[j] = mini;
      } else {
        minCost[j] = cost[j];
        // parent[j] = source;
      }
    }
    cost[mini] = Infinity;
  }
  console.log("Minimum Cost", minCost);
  for (i = 0; i < cnt; i++)
    parent[i] === undefined ? (parent[i] = source) : null;
  // console.log(parent);
  indicatePath(parent, source);
};

const indicatePath = async (parentArr, src) => {
  document.getElementsByClassName("path")[0].innerHTML = "";
  for (i = 0; i < cnt; i++) {
    let p = document.createElement("p");
    p.innerText = "Node " + i + " --> " + src;
    await printPath(parentArr, i, p);
  }
};

const indicateEdge = async (el) => {
  if (el && el.style.backgroundColor !== "aqua") {
    await wait(500);
    el.style.backgroundColor = "aqua";
    el.style.height = "8px";
  }
};

const printPath = async (parent, j, el_p) => {
  if (parent[j] === -1) return;
  await printPath(parent, parent[j], el_p);
  el_p.innerText = el_p.innerText + " " + j;

  document.getElementsByClassName("path")[0].style.padding = "1rem";
  document.getElementsByClassName("path")[0].appendChild(el_p);

  // console.log(j,parent[j]);

  if (j < parent[j]) {
    let tmp = document.getElementById(`line-${j}-${parent[j]}`);
    await colorEdge(tmp);
  } else {
    let tmp = document.getElementById(`line-${parent[j]}-${j}`);
    await colorEdge(tmp);
  }
};

const colorEdge = async (el) => {
  if (el.style.backgroundColor !== "aqua") {
    await wait(1000);
    el.style.backgroundColor = "aqua";
    el.style.height = "8px";
  }
};

const clearScreen = () => {
  document.getElementsByClassName("path")[0].innerHTML = "";
  let lines = document.getElementsByClassName("line");
  for (line of lines) {
    line.style.backgroundColor = "#EEE";
    line.style.height = "5px";
  }
};

const resetDrawingArea = () => {
  blocks.innerHTML = "";

  const p = document.createElement("p");
  p.classList.add("click-instruction");
  p.innerHTML = "Click to create node";

  blocks.appendChild(p);
  document.getElementById("add-edge-enable").disabled = false;
  document.querySelector(".reset-btn").disabled = true;
  document.getElementsByClassName("path")[0].innerHTML = "";

  cnt = 0;
  dist = [];
  edges = [];
  addEdge = false;
};

const wait = async (t) => {
  let pr = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done!");
    }, t);
  });
  res = await pr;
};
