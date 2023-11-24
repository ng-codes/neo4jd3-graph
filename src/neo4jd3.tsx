// @ts-ignore
import * as d3 from 'd3';

import { Neo4jD3Options, colors, fontAwesomeIcons } from './interface';

function Neo4jD3() {
  let container: any,
    info: any,
    node: any,
    nodes: any,
    relationship: any,
    relationshipOutline: any,
    relationshipOverlay: any,
    relationshipText: any,
    relationships: any,
    selector: any,
    simulation: any,
    svg: any,
    svgNodes: any,
    svgRelationships: any,
    svgScale: any,
    svgTranslate: any,
    classes2colors: any = {},
    justLoaded: boolean = false,
    numClasses: number = 0,
    options: Neo4jD3Options = {
      arrowSize: 4,
      colors,
      highlight: undefined,
      iconMap: fontAwesomeIcons,
      icons: undefined,
      imageMap: {},
      images: undefined,
      infoPanel: true,
      minCollision: undefined,
      neo4jData: undefined,
      neo4jDataUrl: undefined,
      nodeOutlineFillColor: undefined,
      nodeRadius: 25,
      relationshipColor: '#a5abb6',
      zoomFit: false,
    },
    VERSION = '1.0.1';
  function appendGraph(container: any) {
    svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'neo4jd3-graph')
      .call(
        d3.zoom().on('zoom', function () {
          let scale = d3.event.transform.k,
            translate = [d3.event.transform.x, d3.event.transform.y];
          if (svgTranslate) {
            translate[0] += svgTranslate[0];
            translate[1] += svgTranslate[1];
          }
          if (svgScale) {
            scale *= svgScale;
          }
          svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
        }),
      )
      .on('dblclick.zoom', null)
      .append('g')
      .attr('width', '100%')
      .attr('height', '100%');
    svgRelationships = svg.append('g').attr('class', 'relationships');
    svgNodes = svg.append('g').attr('class', 'nodes');
  }
  function appendImageToNode(node: any) {
    return node
      .append('image')
      .attr('height', function (d) {
        return icon(d) ? '24px' : '30px';
      })
      .attr('x', function (d) {
        return icon(d) ? '5px' : '-15px';
      })
      .attr('xlink:href', function (d) {
        return image(d);
      })
      .attr('y', function (d) {
        return icon(d) ? '5px' : '-16px';
      })
      .attr('width', function (d) {
        return icon(d) ? '24px' : '30px';
      });
  }
  function appendInfoPanel(container) {
    return container.append('div').attr('class', 'neo4jd3-info');
  }
  function appendInfoElement(cls?: any, isNode?: any, property?: any, value?: any) {
    let elem = info.append('a');
    elem
      .attr('href', '#')
      .attr('class', cls)
      .html('<strong>' + property + '</strong>' + (value ? ': ' + value : ''));
    if (!value) {
      elem
        .style('background-color', function (d) {
          return options.nodeOutlineFillColor
            ? options.nodeOutlineFillColor
            : isNode
            ? class2color(property)
            : defaultColor();
        })
        .style('border-color', function (d) {
          return options.nodeOutlineFillColor
            ? class2darkenColor(options.nodeOutlineFillColor)
            : isNode
            ? class2darkenColor(property)
            : defaultDarkenColor();
        })
        .style('color', function (d) {
          return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : '#fff';
        });
    }
  }
  function appendInfoElementClass(cls, node) {
    appendInfoElement(cls, true, node);
  }
  function appendInfoElementProperty(cls, property, value) {
    appendInfoElement(cls, false, property, value);
  }
  function appendInfoElementRelationship(cls, relationship) {
    appendInfoElement(cls, false, relationship);
  }
  function appendNode() {
    return node
      .enter()
      .append('g')
      .attr('class', function (d) {
        let highlight,
          i,
          classes = 'node',
          label = d.labels[0];
        if (icon(d)) {
          classes += ' node-icon';
        }
        if (image(d)) {
          classes += ' node-image';
        }
        if (options.highlight) {
          for (i = 0; i < options.highlight.length; i++) {
            highlight = options.highlight[i];
            if (d.labels[0] === highlight.class && d.properties[highlight.property] === highlight.value) {
              classes += ' node-highlighted';
              break;
            }
          }
        }
        return classes;
      })
      .on('click', function (d) {
        d.fx = d.fy = null;
        if (typeof options.onNodeClick === 'function') {
          options.onNodeClick(d);
        }
      })
      .on('dblclick', function (d) {
        stickNode(d);
        if (typeof options.onNodeDoubleClick === 'function') {
          options.onNodeDoubleClick(d);
        }
      })
      .on('mouseenter', function (d) {
        if (info) {
          updateInfo(d);
        }
        if (typeof options.onNodeMouseEnter === 'function') {
          options.onNodeMouseEnter(d);
        }
      })
      .on('mouseleave', function (d) {
        if (info) {
          clearInfo(d);
        }
        if (typeof options.onNodeMouseLeave === 'function') {
          options.onNodeMouseLeave(d);
        }
      })
      .call(d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded));
  }
  function appendNodeToGraph() {
    let n = appendNode();
    appendRingToNode(n);
    appendOutlineToNode(n);
    if (options.icons) {
      appendTextToNode(n);
    }
    if (options.images) {
      appendImageToNode(n);
    }
    return n;
  }
  function appendOutlineToNode(node) {
    return node
      .append('circle')
      .attr('class', 'outline')
      .attr('r', options.nodeRadius)
      .style('fill', function (d) {
        return options.nodeOutlineFillColor ? options.nodeOutlineFillColor : class2color(d.labels[0]);
      })
      .style('stroke', function (d) {
        return options.nodeOutlineFillColor
          ? class2darkenColor(options.nodeOutlineFillColor)
          : class2darkenColor(d.labels[0]);
      })
      .append('title')
      .text(function (d) {
        return toString(d);
      });
  }
  function appendRingToNode(node) {
    return node
      .append('circle')
      .attr('class', 'ring')
      .attr('r', options.nodeRadius * 1.16)
      .append('title')
      .text(function (d) {
        return toString(d);
      });
  }
  function appendTextToNode(node) {
    return node
      .append('text')
      .attr('class', function (d) {
        return 'text' + (icon(d) ? ' icon' : '');
      })
      .attr('fill', '#ffffff')
      .attr('font-size', function (d) {
        return icon(d) ? options.nodeRadius + 'px' : '10px';
      })
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('y', function (d: any) {
        return icon(d) ? parseInt(Math.round(options.nodeRadius * 0.32).toString()) + 'px' : '4px';
      })
      .html(function (d) {
        let _icon = icon(d);
        return _icon ? '&#x' + _icon : d.id;
      });
  }
  function appendRandomDataToNode(d, maxNodesToGenerate) {
    let data = randomD3Data(d, maxNodesToGenerate);
    updateWithNeo4jData(data);
  }
  function appendRelationship() {
    return relationship
      .enter()
      .append('g')
      .attr('class', 'relationship')
      .on('dblclick', function (d) {
        if (typeof options.onRelationshipDoubleClick === 'function') {
          options.onRelationshipDoubleClick(d);
        }
      })
      .on('mouseenter', function (d) {
        if (info) {
          updateInfo(d);
        }
      });
  }
  function appendOutlineToRelationship(r) {
    return r.append('path').attr('class', 'outline').attr('fill', '#a5abb6').attr('stroke', 'none');
  }
  function appendOverlayToRelationship(r) {
    return r.append('path').attr('class', 'overlay');
  }
  function appendTextToRelationship(r) {
    return r
      .append('text')
      .attr('class', 'text')
      .attr('fill', '#000000')
      .attr('font-size', '8px')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return d.type;
      });
  }
  function appendRelationshipToGraph() {
    let relationship = appendRelationship(),
      text = appendTextToRelationship(relationship),
      outline = appendOutlineToRelationship(relationship),
      overlay = appendOverlayToRelationship(relationship);
    return {
      outline,
      overlay,
      relationship,
      text,
    };
  }
  function class2color(cls) {
    let color = classes2colors[cls];
    if (!color) {
      //            color = options.colors[Math.min(numClasses, options.colors.length - 1)];
      color = options.colors[numClasses % options.colors.length];
      classes2colors[cls] = color;
      numClasses++;
    }
    return color;
  }
  function class2darkenColor(cls) {
    return d3.rgb(class2color(cls)).darker(1);
  }
  function clearInfo(d?: any) {
    info.html('');
  }
  function color() {
    return options.colors[(options.colors.length * Math.random()) << 0];
  }

  function contains(array, id) {
    let filter = array.filter(function (elem) {
      return elem.id === id;
    });
    return filter.length > 0;
  }
  function defaultColor() {
    return options.relationshipColor;
  }
  function defaultDarkenColor() {
    return d3.rgb(options.colors[options.colors.length - 1]).darker(1);
  }
  function dragEnded(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    if (typeof options.onNodeDragEnd === 'function') {
      options.onNodeDragEnd(d);
    }
  }
  function dragged(d) {
    stickNode(d);
  }
  function dragStarted(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
    if (typeof options.onNodeDragStart === 'function') {
      options.onNodeDragStart(d);
    }
  }
  function extend(obj1, obj2) {
    let obj = {};
    merge(obj, obj1);
    merge(obj, obj2);
    return obj;
  }

  function icon(d) {
    let code;
    if (options.iconMap && options.showIcons && options.icons) {
      if (options.icons[d.labels[0]] && options.iconMap[options.icons[d.labels[0]]]) {
        code = options.iconMap[options.icons[d.labels[0]]];
      } else if (options.iconMap[d.labels[0]]) {
        code = options.iconMap[d.labels[0]];
      } else if (options.icons[d.labels[0]]) {
        code = options.icons[d.labels[0]];
      }
    }
    return code;
  }
  function image(d) {
    let i, imagesForLabel, img, imgLevel, label, labelPropertyValue, property, value;
    if (options.images) {
      imagesForLabel = options.imageMap[d.labels[0]];
      if (imagesForLabel) {
        imgLevel = 0;
        for (i = 0; i < imagesForLabel.length; i++) {
          labelPropertyValue = imagesForLabel[i].split('|');
          switch (labelPropertyValue.length) {
            case 3:
              value = labelPropertyValue[2];
            /* falls through */
            case 2:
              property = labelPropertyValue[1];
            /* falls through */
            case 1:
              label = labelPropertyValue[0];
          }
          if (
            d.labels[0] === label &&
            (!property || d.properties[property] !== undefined) &&
            (!value || d.properties[property] === value)
          ) {
            if (labelPropertyValue.length > imgLevel) {
              img = options.images[imagesForLabel[i]];
              imgLevel = labelPropertyValue.length;
            }
          }
        }
      }
    }
    return img;
  }
  function createGraph(_selector, _options) {
    initIconMap();
    merge(options, _options);
    if (options.icons) {
      options.showIcons = true;
    }
    if (!options.minCollision) {
      options.minCollision = options.nodeRadius * 2;
    }
    initImageMap();
    selector = _selector;
    container = d3.select(selector);
    container.attr('class', 'neo4jd3').html('');
    if (options.infoPanel) {
      info = appendInfoPanel(container);
    }
    appendGraph(container);
    simulation = initSimulation();
    if (options.neo4jData) {
      loadNeo4jData();
    } else if (options.neo4jDataUrl) {
      loadNeo4jDataFromUrl(options.neo4jDataUrl);
    } else {
      console.error('Error: both neo4jData and neo4jDataUrl are empty!');
    }
  }
  function initIconMap() {
    Object.keys(options.iconMap).forEach(function (key, index) {
      let keys = key.split(','),
        value = options.iconMap[key];
      keys.forEach(function (key) {
        options.iconMap[key] = value;
      });
    });
  }
  function initImageMap() {
    let key, keys, selector;
    for (key in options.images) {
      if (options.images.hasOwnProperty(key)) {
        keys = key.split('|');
        if (!options.imageMap[keys[0]]) {
          options.imageMap[keys[0]] = [key];
        } else {
          options.imageMap[keys[0]].push(key);
        }
      }
    }
  }
  function initSimulation() {
    let simulation = d3.forceSimulation().velocityDecay(0.8);
    simulation
      //   .force('x', 0.00111)
      //   .force('y', 0.000000001)
      .force(
        'collide',
        d3
          .forceCollide()
          .radius(function (d) {
            return options.minCollision;
          })
          .iterations(2),
      )
      .force('charge', d3.forceManyBody())
      .force(
        'link',
        d3.forceLink().id(function (d: any) {
          return d.id;
        }),
      )
      .force(
        'center',
        d3.forceCenter(
          svg.node().parentElement.parentElement.clientWidth / 2,
          svg.node().parentElement.parentElement.clientHeight / 2,
        ),
      )
      .on('tick', function () {
        tick();
      })
      .on('end', function () {
        if (options.zoomFit && !justLoaded) {
          justLoaded = true;
          zoomFit(2);
        }
      });
    return simulation;
  }
  function loadNeo4jData() {
    nodes = [];
    relationships = [];
    updateWithNeo4jData(options.neo4jData);
  }
  function loadNeo4jDataFromUrl(neo4jDataUrl) {
    nodes = [];
    relationships = [];
    d3.json(neo4jDataUrl, function (error, data) {
      if (error) {
        throw error;
      }
      updateWithNeo4jData(data);
    });
  }
  function merge(target, source) {
    Object.keys(source).forEach(function (property) {
      target[property] = source[property];
    });
  }
  function neo4jDataToD3Data(data) {
    let graph = {
      nodes: [],
      relationships: [],
    };
    data.results.forEach(function (result) {
      result.data.forEach(function (data) {
        data.graph.nodes.forEach(function (node) {
          if (!contains(graph.nodes, node.id)) {
            graph.nodes.push(node);
          }
        });
        data.graph.relationships.forEach(function (relationship) {
          relationship.source = relationship.startNode;
          relationship.target = relationship.endNode;
          graph.relationships.push(relationship);
        });
        data.graph.relationships.sort(function (a, b) {
          if (a.source > b.source) {
            return 1;
          } else if (a.source < b.source) {
            return -1;
          } else {
            if (a.target > b.target) {
              return 1;
            }
            if (a.target < b.target) {
              return -1;
            } else {
              return 0;
            }
          }
        });
        for (let i = 0; i < data.graph.relationships.length; i++) {
          if (
            i !== 0 &&
            data.graph.relationships[i].source === data.graph.relationships[i - 1].source &&
            data.graph.relationships[i].target === data.graph.relationships[i - 1].target
          ) {
            data.graph.relationships[i].linknum = data.graph.relationships[i - 1].linknum + 1;
          } else {
            data.graph.relationships[i].linknum = 1;
          }
        }
      });
    });
    return graph;
  }
  function randomD3Data(d, maxNodesToGenerate) {
    let data = {
        nodes: [],
        relationships: [],
      },
      i,
      label,
      node,
      numNodes = ((maxNodesToGenerate * Math.random()) << 0) + 1,
      relationship,
      s = size();
    for (i = 0; i < numNodes; i++) {
      label = randomLabel();
      node = {
        id: s.nodes + 1 + i,
        labels: [label],
        properties: {
          random: label,
        },
        x: d.x,
        y: d.y,
      };
      data.nodes[data.nodes.length] = node;
      relationship = {
        id: s.relationships + 1 + i,
        type: label.toUpperCase(),
        startNode: d.id,
        endNode: s.nodes + 1 + i,
        properties: {
          from: Date.now(),
        },
        source: d.id,
        target: s.nodes + 1 + i,
        linknum: s.relationships + 1 + i,
      };
      data.relationships[data.relationships.length] = relationship;
    }
    return data;
  }
  function randomLabel() {
    let icons = Object.keys(options.iconMap);
    return icons[(icons.length * Math.random()) << 0];
  }
  function rotate(cx, cy, x, y, angle) {
    let radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) + sin * (y - cy) + cx,
      ny = cos * (y - cy) - sin * (x - cx) + cy;
    return { x: nx, y: ny };
  }
  function rotatePoint(c, p, angle) {
    return rotate(c.x, c.y, p.x, p.y, angle);
  }
  function rotation(source, target) {
    return (Math.atan2(target.y - source.y, target.x - source.x) * 180) / Math.PI;
  }
  function size() {
    return {
      nodes: nodes.length,
      relationships: relationships.length,
    };
  }

  function stickNode(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function tick() {
    tickNodes();
    tickRelationships();
  }
  function tickNodes() {
    if (node) {
      node.attr('transform', function (d) {
        return 'translate(' + d.x + ', ' + d.y + ')';
      });
    }
  }
  function tickRelationships() {
    if (relationship) {
      relationship.attr('transform', function (d) {
        let angle = rotation(d.source, d.target);
        return 'translate(' + d.source.x + ', ' + d.source.y + ') rotate(' + angle + ')';
      });
      tickRelationshipsTexts();
      tickRelationshipsOutlines();
      tickRelationshipsOverlays();
    }
  }
  function tickRelationshipsOutlines() {
    relationship.each(function (relationship) {
      let rel = d3.select(this),
        outline = rel.select('.outline'),
        text: any = rel.select('.text'),
        bbox = text.node().getBBox(),
        padding = 3;
      outline.attr('d', function (d: any) {
        let center = { x: 0, y: 0 },
          angle = rotation(d.source, d.target),
          textBoundingBox = text.node().getBBox(),
          textPadding = 5,
          u = unitaryVector(d.source, d.target),
          textMargin = {
            x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
            y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5,
          },
          n = unitaryNormalVector(d.source, d.target),
          rotatedPointA1 = rotatePoint(
            center,
            { x: 0 + (options.nodeRadius + 1) * u.x - n.x, y: 0 + (options.nodeRadius + 1) * u.y - n.y },
            angle,
          ),
          rotatedPointB1 = rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle),
          rotatedPointC1 = rotatePoint(center, { x: textMargin.x, y: textMargin.y }, angle),
          rotatedPointD1 = rotatePoint(
            center,
            { x: 0 + (options.nodeRadius + 1) * u.x, y: 0 + (options.nodeRadius + 1) * u.y },
            angle,
          ),
          rotatedPointA2 = rotatePoint(
            center,
            { x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y },
            angle,
          ),
          rotatedPointB2 = rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize,
              y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize,
            },
            angle,
          ),
          rotatedPointC2 = rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * options.arrowSize,
              y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * options.arrowSize,
            },
            angle,
          ),
          rotatedPointD2 = rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x,
              y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y,
            },
            angle,
          ),
          rotatedPointE2 = rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x + (-n.x - u.x) * options.arrowSize,
              y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y + (-n.y - u.y) * options.arrowSize,
            },
            angle,
          ),
          rotatedPointF2 = rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - u.x * options.arrowSize,
              y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - u.y * options.arrowSize,
            },
            angle,
          ),
          rotatedPointG2 = rotatePoint(
            center,
            { x: d.target.x - d.source.x - textMargin.x, y: d.target.y - d.source.y - textMargin.y },
            angle,
          );
        return (
          'M ' +
          rotatedPointA1.x +
          ' ' +
          rotatedPointA1.y +
          ' L ' +
          rotatedPointB1.x +
          ' ' +
          rotatedPointB1.y +
          ' L ' +
          rotatedPointC1.x +
          ' ' +
          rotatedPointC1.y +
          ' L ' +
          rotatedPointD1.x +
          ' ' +
          rotatedPointD1.y +
          ' Z M ' +
          rotatedPointA2.x +
          ' ' +
          rotatedPointA2.y +
          ' L ' +
          rotatedPointB2.x +
          ' ' +
          rotatedPointB2.y +
          ' L ' +
          rotatedPointC2.x +
          ' ' +
          rotatedPointC2.y +
          ' L ' +
          rotatedPointD2.x +
          ' ' +
          rotatedPointD2.y +
          ' L ' +
          rotatedPointE2.x +
          ' ' +
          rotatedPointE2.y +
          ' L ' +
          rotatedPointF2.x +
          ' ' +
          rotatedPointF2.y +
          ' L ' +
          rotatedPointG2.x +
          ' ' +
          rotatedPointG2.y +
          ' Z'
        );
      });
    });
  }

  function tickRelationshipsOverlays() {
    relationshipOverlay.attr('d', function (d) {
      let center = { x: 0, y: 0 },
        angle = rotation(d.source, d.target),
        n1 = unitaryNormalVector(d.source, d.target),
        n = unitaryNormalVector(d.source, d.target, 50),
        rotatedPointA = rotatePoint(center, { x: 0 - n.x, y: 0 - n.y }, angle),
        rotatedPointB = rotatePoint(
          center,
          { x: d.target.x - d.source.x - n.x, y: d.target.y - d.source.y - n.y },
          angle,
        ),
        rotatedPointC = rotatePoint(
          center,
          { x: d.target.x - d.source.x + n.x - n1.x, y: d.target.y - d.source.y + n.y - n1.y },
          angle,
        ),
        rotatedPointD = rotatePoint(center, { x: 0 + n.x - n1.x, y: 0 + n.y - n1.y }, angle);
      return (
        'M ' +
        rotatedPointA.x +
        ' ' +
        rotatedPointA.y +
        ' L ' +
        rotatedPointB.x +
        ' ' +
        rotatedPointB.y +
        ' L ' +
        rotatedPointC.x +
        ' ' +
        rotatedPointC.y +
        ' L ' +
        rotatedPointD.x +
        ' ' +
        rotatedPointD.y +
        ' Z'
      );
    });
  }

  function tickRelationshipsTexts() {
    relationshipText.attr('transform', function (d) {
      let angle = (rotation(d.source, d.target) + 360) % 360,
        mirror = angle > 90 && angle < 270,
        center = { x: 0, y: 0 },
        n = unitaryNormalVector(d.source, d.target),
        nWeight = mirror ? 2 : -3,
        point = {
          x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
          y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight,
        },
        rotatedPoint = rotatePoint(center, point, angle);
      return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
    });
  }
  function toString(d) {
    let s = d.labels ? d.labels[0] : d.type;
    s += ' (<id>: ' + d.id;
    Object.keys(d.properties).forEach(function (property) {
      s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
    });
    s += ')';
    return s;
  }
  // function unitaryNormalVector(source?: any, target?: any, newLength?: any) {
  //     var center = { x: 0, y: 0 },
  //         vector = unitaryVector(source, target, newLength);
  //     return rotatePoint(center, vector, 90);
  // }
  // function unitaryVector(source?: any, target?: any, newLength?: any) {
  //     var length =
  //         Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);
  //     return {
  //         x: (target.x - source.x) / length,
  //         y: (target.y - source.y) / length,
  //     };
  // }

  function unitaryNormalVector(source: any, target: any, newLength?: any) {
    const center = { x: 0, y: 0 };
    const vector = unitaryVector(source, target, newLength);
    return rotatePoint(center, vector, 90);
  }

  function unitaryVector(source: any, target: any, newLength?: any) {
    const length =
      Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

    return {
      x: (target.x - source.x) / length,
      y: (target.y - source.y) / length,
    };
  }

  function updateWithD3Data(d3Data) {
    updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
  }
  function updateWithNeo4jData(neo4jData) {
    let d3Data = neo4jDataToD3Data(neo4jData);
    updateWithD3Data(d3Data);
  }
  function updateInfo(d) {
    clearInfo();
    if (d.labels) {
      appendInfoElementClass('class', d.labels[0]);
    } else {
      appendInfoElementRelationship('class', d.type);
    }
    appendInfoElementProperty('property', '&lt;id&gt;', d.id);
    Object.keys(d.properties).forEach(function (property) {
      appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
    });
  }
  function updateNodes(n) {
    Array.prototype.push.apply(nodes, n);
    node = svgNodes.selectAll('.node').data(nodes, function (d) {
      return d.id;
    });
    let nodeEnter = appendNodeToGraph();
    node = nodeEnter.merge(node);
  }
  function updateNodesAndRelationships(n, r) {
    updateRelationships(r);
    updateNodes(n);
    simulation.nodes(nodes);
    simulation.force('link').links(relationships);
  }
  function updateRelationships(r) {
    Array.prototype.push.apply(relationships, r);
    relationship = svgRelationships.selectAll('.relationship').data(relationships, function (d) {
      return d.id;
    });
    let relationshipEnter = appendRelationshipToGraph();
    relationship = relationshipEnter.relationship.merge(relationship);
    relationshipOutline = svg.selectAll('.relationship .outline');
    relationshipOutline = relationshipEnter.outline.merge(relationshipOutline);
    relationshipOverlay = svg.selectAll('.relationship .overlay');
    relationshipOverlay = relationshipEnter.overlay.merge(relationshipOverlay);
    relationshipText = svg.selectAll('.relationship .text');
    relationshipText = relationshipEnter.text.merge(relationshipText);
  }
  function version() {
    return VERSION;
  }
  function zoomFit(transitionDuration) {
    let bounds = svg.node().getBBox(),
      parent = svg.node().parentElement.parentElement,
      fullWidth = parent && parent.clientWidth ? parent.clientWidth : '100vw',
      fullHeight = parent && parent.clientHeight ? parent.clientHeight : '100vh',
      width = bounds.width,
      height = bounds.height,
      midX = bounds.x + width / 2,
      midY = bounds.y + height / 2;
    // console.log(fullWidth, fullHeight)
    if (width === 0 || height === 0) {
      return; // nothing to fit
    }
    svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    svgTranslate = [fullWidth / 2 - svgScale * midX, fullHeight / 2 - svgScale * midY];
    svg.attr('transform', 'translate(' + svgTranslate[0] + ', ' + svgTranslate[1] + ') scale(' + svgScale + ')');
    //        smoothTransform(svgTranslate, svgScale);
  }
  // init(_selector, _options);
  return {
    appendRandomDataToNode,
    neo4jDataToD3Data,
    randomD3Data,
    size,
    updateWithD3Data,
    updateWithNeo4jData,
    version,
    createGraph,
  };
}
export default Neo4jD3();
