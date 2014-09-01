(function(){

function dsq(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

function hull(vertices, alpha) {
    var tIdxs = Delaunay.triangulate(vertices),
        triangles = [],
        border = [],
        trianglesInEdge = {},
        borderEdges = [],
        alpha = alpha || 50,
        asq = alpha * alpha,
        addKeyToHash = function(key) {
            trianglesInEdge[key] = trianglesInEdge[key] === undefined ? 1 : trianglesInEdge[key] + 1;
        };

    // count how many triangles related with each edge
    for (var i = tIdxs.length; i; ) {
        var tIdx = [];

        --i; tIdx[0] = tIdxs[i];
        --i; tIdx[1] = tIdxs[i];
        --i; tIdx[2] = tIdxs[i];

        if (dsq(vertices[tIdx[0]], vertices[tIdx[1]]) < asq &&
            dsq(vertices[tIdx[0]], vertices[tIdx[2]]) < asq &&
            dsq(vertices[tIdx[1]], vertices[tIdx[2]]) < asq) {

            triangles.push(tIdx);
            addKeyToHash(tIdx[0] + '-' + tIdx[1]);
            addKeyToHash(tIdx[1] + '-' + tIdx[0]);
            addKeyToHash(tIdx[1] + '-' + tIdx[2]);
            addKeyToHash(tIdx[2] + '-' + tIdx[1]);
            addKeyToHash(tIdx[2] + '-' + tIdx[0]);
            addKeyToHash(tIdx[0] + '-' + tIdx[2]);
        }
    }

    // leave only border edges
    for (edge in trianglesInEdge) {
        if (trianglesInEdge[edge] === 1) {
            var pts = edge.split('-');
            delete trianglesInEdge[pts[1] + '-' + pts[0]];
            borderEdges.push([parseInt(pts[0]), parseInt(pts[1])]);

            _drawPx(vertices[pts[0]][0], vertices[pts[0]][1], 'red');
        }
    }

    // sort
    // http://stackoverflow.com/questions/14108553/get-border-edges-of-mesh-in-winding-order#comment19522625_14108553
    // TODO: construct multipolygons before sorting. Think about clusters.
    // TODO: think about O(N^2) optimization
    var checked = {},
        edge = borderEdges[0],
        nextEdge;

    checked[edge[0] + '-' + edge[1]] = true;
    border.push(edge[1]);
    _drawPx(vertices[edge[1]][0], vertices[edge[1]][1], 'blue');
    
    while (border.length !== borderEdges.length) {
        for (var i = 0; i < borderEdges.length; i++) {
            var nextEdge = borderEdges[i],
                k = nextEdge[0] + '-' + nextEdge[1];

            if (checked[k] === true) {
                continue;
            }

            if (nextEdge[0] === edge[1] || nextEdge[1] === edge[1]) {
                if (nextEdge[0] === edge[1]) {
                    border.push(nextEdge[1]);
                    _drawPx(vertices[nextEdge[1]][0], vertices[nextEdge[1]][1], 'blue');
                }
                if (nextEdge[1] === edge[1]) {
                    border.push(nextEdge[0]);
                    _drawPx(vertices[nextEdge[0]][0], vertices[nextEdge[0]][1], 'blue');
                }
                edge = nextEdge;
                checked[k] = true;
                break;
            }
        }
    }

    function _drawPx(x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();
    }

    return triangles;
}

window.hull = hull;

})();