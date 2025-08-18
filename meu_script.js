document.addEventListener('DOMContentLoaded', function() {
    // Carregar os dados do grafo a partir do arquivo JSON
    d3.json("grafo_relacionamentos.json").then(function(graph) {

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Seleciona o contêiner e anexa o SVG
        const svg = d3.select("#visualizacao")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", function (event) {
                g.attr("transform", event.transform)
            }));

        const g = svg.append("g");

        // Tooltip
        const tooltip = d3.select(".tooltip");

        // Mapeamento de cores para os relacionamentos
        const relacaoCores = {
            "aliada": "#06b6d4",      // Ciano
            "subordinada": "#eab308", // Amarelo
            "inimiga": "#ef4444"      // Vermelho
        };
        
        const statusCores = {
            "Atual": "#22c55e", // Verde
            "Antes": "#6b7280"  // Cinza
        };

        // Configurar a simulação de força
        const simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(20));

        // Desenhar as arestas (links)
        const link = g.append("g")
            .attr("stroke-opacity", 0.7)
            .selectAll("line")
            .data(graph.links)
            .join("line")
            .style("stroke", d => {
                if (d.relacao) return relacaoCores[d.relacao] || "#6b7280";
                return statusCores[d.status] || "#6b7280";
            })
            .style("stroke-dasharray", d => d.status === "Antes" ? "5,5" : "none")
            .attr("stroke-width", 2.5);

        // Desenhar os nós (nodes)
        const node = g.append("g")
            .selectAll("g")
            .data(graph.nodes)
            .join("g")
            .call(drag(simulation));

        // Círculos para personagens
        node.filter(d => d.tipo === 'personagem')
            .append("circle")
            .attr("r", 12)
            .attr("fill", "#4f46e5") // Roxo
            .attr("stroke", "#e0e7ff")
            .attr("stroke-width", 2);

        // Retângulos para facções
        node.filter(d => d.tipo === 'faccao')
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("x", -10)
            .attr("y", -10)
            .attr("fill", "#db2777") // Rosa
            .attr("stroke", "#fce7f3")
            .attr("stroke-width", 2);

        // Adicionar legendas (nomes) aos nós
        const labels = node.append("text")
            .text(d => d.id)
            .attr("x", 18)
            .attr("y", 5)
            .style("font-size", "14px")
            .style("font-weight", "500")
            .attr("fill", "white")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.5)");
        
        // Lógica para indexar as conexões para o efeito de highlight
        const linkedByIndex = {};
        graph.links.forEach(d => {
            // CORREÇÃO: Após a simulação ser iniciada, d.source e d.target
            // se tornam objetos. Precisamos usar seus IDs para criar a chave do índice.
            linkedByIndex[`${d.source.id},${d.target.id}`] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[`${a.id},${b.id}`] || linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
        }

        // Eventos de mouse para o tooltip
        node.on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.id}</strong><br/><span class="capitalize">${d.tipo}</span>`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            // Destacar nó e vizinhos
            link.style('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2);
            node.style('opacity', n => isConnected(d, n) ? 1 : 0.3);

        }).on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
            // Resetar destaque
            link.style('stroke-opacity', 0.7);
            node.style('opacity', 1);
        });

        // Atualiza a posição dos elementos a cada "tick" da simulação
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Funções para arrastar os nós
        function drag(simulation) {
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

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    });
});