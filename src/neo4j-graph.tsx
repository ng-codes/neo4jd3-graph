// @ts-ignore
import { CreateGraphInterface, Neo4jD3Options } from './interfaces/interface';
import neo4jd3 from './neo4jd3';

export function Neo4jGraph() {
  const { appendRandomDataToNode, neo4jDataToD3Data, randomD3Data } = neo4jd3;

  function renderGraph(createGraphObject: CreateGraphInterface) {
    return neo4jd3.createGraph(createGraphObject.parentElement, createGraphObject.options);
  }

  return {
    renderGraph,
    appendRandomDataToNode,
    neo4jDataToD3Data,
    randomD3Data,
  };
}
