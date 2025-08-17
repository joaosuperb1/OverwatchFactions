// Carregar os dados do grafo
d3.json("grafo_relacionamentos.json").then(function(graph) {

    // Pegar as dimensões da janela do navegador
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Seleciona o div e anexa o SVG, definindo as dimensões dinamicamente
    const svg = d3.select("#visualizacao")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Configurar a simulação de força para posicionar os nós
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-150))
        // Centralizar a simulação no meio da tela
        .force("center", d3.forceCenter(width / 2, height / 2));

    // O restante do código permanece o mesmo...

    // Estilizar as arestas com base no status
    const link = svg.append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(graph.links)
        .join("line")
        .style("stroke", d => d.status === "Atual" ? "green" : "gray")
        .style("stroke-dasharray", d => d.status === "Antes" ? "5,5" : "none")
        .attr("stroke-width", 2);

    // Estilizar os nós (personagens e facções)
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(graph.nodes)
        .join("circle")
        .attr("r", 10)
        .style("fill", d => d.tipo === "personagem" ? "blue" : "orange");

    // Adicionar legendas (nomes) aos nós
    const labels = svg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .join("text")
        .text(d => d.id)
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("font-family", "sans-serif");
    
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});