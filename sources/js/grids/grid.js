var ResponsiveGrids = (function(){
        var grids = document.createElement("div"),
            gv = document.createElement("div"),
            gh = document.createElement("div"),
            maxCols = 24,
            maxRows = 1000;
        grids.id = "grid";

        gv.className = "vert-container";
        for (var i = 0; i < maxCols; i++) {
                var gvi = document.createElement("div");
                gvi.className = "vert cols" + parseInt(i+1, null);
                if(i===0) gvi.className += " first-line";

                gv.appendChild(gvi);
        }
        grids.appendChild(gv);

        gh.className = "horiz-container";
        for (var j = 0; j < maxRows; j++) {
                var ghi = document.createElement("div");
                ghi.className = "horiz";
                if(j===0) ghi.className += " first-line";
                if(j%2) ghi.className += " odd";

                gh.appendChild(ghi);
        }
        grids.appendChild(gh);

        document.body.insertBefore(grids, document.body.childNodes[0]);
})();