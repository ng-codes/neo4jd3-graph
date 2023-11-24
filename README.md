# neo4jd3-graph

The "neo4jd3-graph" npm package is a tool designed for visualizing Neo4j graph data. This package utilizes the power of D3.js (version 4.2.1) for rendering interactive and dynamic graphs representing relationships within Neo4j databases. The visualization is enhanced with Font Awesome icons (version 4.7.0) to provide a rich and aesthetically pleasing representation.

## Authors

- [@Reddy Bala Subrahmanyam](https://github.com/Bala-Subrahmanyam-Reddy)

## Installation

Install with npm

```bash
  npm i neo4jd3-graph
```

## Usage/Example

- Import the necessary components and styles in your React application:

### js or ts

```bash
import React, { useEffect } from 'react';
import { Neo4jGraph, CreateGraphInterface } from 'neo4jd3-graph';
import './App.css';

```
- Define your Neo4j graph data. The data should follow the format specified in the Neo4j response:

### Neo4j data format
```bash
{
    "results": [
        {
            "columns": ["user", "entity"],
            "data": [
                {
                    "graph": {
                        "nodes": [
                            {
                                "id": "1",
                                "labels": ["User"],
                                "properties": {
                                    "userId": "eisman"
                                }
                            },
                            {
                                "id": "8",
                                "labels": ["Project"],
                                "properties": {
                                    "name": "neo4jd3",
                                    "title": "neo4jd3.js",
                                    "description": "Neo4j graph visualization using D3.js.",
                                    "url": "https://eisman.github.io/neo4jd3"
                                }
                            }
                        ],
                        "relationships": [
                            {
                                "id": "7",
                                "type": "DEVELOPES",
                                "startNode": "1",
                                "endNode": "8",
                                "properties": {
                                    "from": 1470002400000
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "errors": []
}
```

- Create a React functional component and use the Neo4jGraph component:
```
function App() {
  const { renderGraph } = Neo4jGraph();

  useEffect(() => {
    const graphConfig: CreateGraphInterface = {
      parentElement: "#canva",
      options: {
        neo4jData: data as any,
        nodeRadius: 25,
        onNodeClick(d) {
          console.log("Node clicked:", d);
        },
        colors: ["red"],
        onRelationshipDoubleClick(d) {
          console.log("Relationship double-clicked:", d);
        },
        infoPanel: true,
        showIcons: true,
        zoomFit: true
      }
    };
    renderGraph(graphConfig);
  }, []);

  return (
    <div className="App">
      <div id="canva"></div>
    </div>
  );
}

export default App;

```
- Customize the graphConfig object with the desired options for your graph visualization.
- Run your React application, and the Neo4j graph visualization should be displayed in the specified HTML element.

### Options

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| **highlight** | *array* | Highlight several nodes of the graph.<br>Example:<br>`[`<br>&nbsp;&nbsp;&nbsp;&nbsp;`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`class: 'Project',`<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`property: 'name',`<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`value: 'neo4jd3'`<br>&nbsp;&nbsp;&nbsp;&nbsp;`}`<br>`]` |
| **icons** | *object* | Map node labels to [Font Awesome icons](http://fontawesome.io/icons).<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'BirthDate': 'birthday-cake',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Password': 'lock',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Phone': 'phone',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'User': 'user'`<br>`}`. |
| **images** | *object* | Map node labels to SVG images (e.g. using [Twitter Emoji](https://github.com/twitter/twemoji)).<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Address': 'img/twemoji/1f3e0.svg',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'BirthDate': 'img/twemoji/1f382.svg',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Password': 'img/twemoji/1f511.svg',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Project': 'img/twemoji/2198.svg',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Project\|name\|neo4jd3': 'img/twemoji/2196.svg',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'User': 'img/twemoji/1f600.svg'`<br>`}`. |
| **infoPanel** | *boolean* | Show the information panel: `true`, `false`. Default: `true`. |
| **minCollision** | *int* | Minimum distance between nodes. Default: 2 * *nodeRadius*. |
| **neo4jData** | *object* | Graph data in [Neo4j data format](#neo4j-data-format). |
| **neo4jDataUrl** | *string* | URL of the endpoint that serves the graph data in [Neo4j data format](#neo4j-data-format). |
| **nodeRadius** | *int* | Radius of nodes. Default: 25. |
| **onNodeClick** | *function* | Callback function to be executed when the user clicks a node. |
| **onNodeDoubleClick** | *function* | Callback function to be executed when the user double clicks a node. |
| **onNodeDragEnd** | *function* | Callback function to be executed when the user finishes dragging a node. |
| **onNodeDragStart** | *function* | Callback function to be executed when the user starts dragging a node. |
| **onNodeMouseEnter** | *function* | Callback function to be executed when the mouse enters a node. |
| **onNodeMouseLeave** | *function* | Callback function to be executed when the mouse leaves a node. |
| **onRelationshipDoubleClick** | *function* | Callback function to be executed when the user double clicks a relationship. |
| **zoomFit** | *boolean* | Adjust the graph to the container once it has been loaded: `true`, `false`. Default: `false`. |

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.
