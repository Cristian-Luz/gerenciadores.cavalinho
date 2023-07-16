document.addEventListener("DOMContentLoaded", function() {
    const routesTableBody = document.getElementById("routesTableBody");
    
    const exportButton = document.getElementById("exportButton");
    
    const importInput = document.getElementById("importInput");
    
    const addRouteForm = document.getElementById("addRouteForm");
    
    const searchForm = document.getElementById("searchForm");
    
    const routesTable = document.getElementById("routesTable");

    let savedRoutes = JSON.parse(localStorage.getItem("routes")) || [];

    function displaySavedRoutes() {
        routesTableBody.innerHTML = "";

        for (const route of savedRoutes) {
            const newRow = document.createElement("tr");
            const coletaCell = document.createElement("td");
            const entregaCell = document.createElement("td");
            const destinoCell = document.createElement("td");
            const actionsCell = document.createElement("td");

            coletaCell.textContent = route.coleta;
            entregaCell.textContent = route.entrega;
            destinoCell.textContent = route.destino;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.classList.add("deleteButton");
            deleteButton.addEventListener("click", function() {
                deleteRoute(route);
            });

            const copyLinkButton = document.createElement("button");
            copyLinkButton.textContent = "Copiar Link";
            copyLinkButton.dataset.link = route.link;
            copyLinkButton.classList.add("copyLinkButton");
            copyLinkButton.addEventListener("click", function() {
                copyLink(copyLinkButton);
            });

            const showRouteButton = document.createElement("button");
            showRouteButton.textContent = "Mostrar Rota";
            showRouteButton.classList.add("showRouteButton")
            showRouteButton.addEventListener("click", function() {
                showRoute(route.link);
            });

            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(copyLinkButton);
            actionsCell.appendChild(showRouteButton);

            newRow.appendChild(coletaCell);
            newRow.appendChild(entregaCell);
            newRow.appendChild(destinoCell);
            newRow.appendChild(actionsCell);

            routesTableBody.appendChild(newRow);
        }
    }

    displaySavedRoutes();

    function addRoute(event) {
        event.preventDefault();

        const coletaInput = document.getElementById("coleta");
        const entregaInput = document.getElementById("entrega");
        const destinoInput = document.getElementById("destino");
        const linkInput = document.getElementById("link");

        const newRoute = {
            coleta: coletaInput.value,
            entrega: entregaInput.value,
            destino: destinoInput.value,
            link: linkInput.value
        };

        savedRoutes.push(newRoute);
        localStorage.setItem("routes", JSON.stringify(savedRoutes));

        displaySavedRoutes();

        coletaInput.value = "";
        entregaInput.value = "";
        destinoInput.value = "";
        linkInput.value = "";
    }

    addRouteForm.addEventListener("submit", addRoute);

    function deleteRoute(route) {
        const routeIndex = savedRoutes.indexOf(route);
        savedRoutes.splice(routeIndex, 1);
        localStorage.setItem("routes", JSON.stringify(savedRoutes));
        displaySavedRoutes();
    }

    function copyLink(copyLinkButton) {
        const link = copyLinkButton.dataset.link;
        const tempInput = document.createElement("input");
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("Link copiado para a área de transferência!");
    }

    function showRoute(link) {
        window.open(link, "_blank");

        const routeDetails = document.getElementById("routeDetails");
        routeDetails.innerHTML = "";

        const p = document.createElement("p");
        p.textContent = "Link da Rota: " + link;

        routeDetails.appendChild(p);
    }

    function filterRoutes(event) {
        event.preventDefault();

        const searchInput = document.getElementById("searchBusca");
        const searchTerm = searchInput.value.toLowerCase();

        const filteredRoutes = savedRoutes.filter(function(route) {
            const searchTerms = searchTerm.split("+").map(term => term.trim());

            return searchTerms.every(function(searchTerm) {
                return (
                    route.coleta.toLowerCase().includes(searchTerm) ||
                    route.entrega.toLowerCase().includes(searchTerm) ||
                    route.destino.toLowerCase().includes(searchTerm)
                );
            });
    });

        displayFilteredRoutes(filteredRoutes);
    }
    
    function displayFilteredRoutes(filteredRoutes) {
        routesTableBody.innerHTML = "";

        for (const route of filteredRoutes) {
            const newRow = document.createElement("tr");
            const coletaCell = document.createElement("td");
            const entregaCell = document.createElement("td");
            const destinoCell = document.createElement("td");
            const actionsCell = document.createElement("td");

            coletaCell.textContent = route.coleta;
            entregaCell.textContent = route.entrega;
            destinoCell.textContent = route.destino;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.addEventListener("click", function() {
                deleteRoute(route);
            });
            deleteButton.classList.add("deleteButton");

            const copyLinkButton = document.createElement("button");
            copyLinkButton.textContent = "Copiar Link";
            copyLinkButton.dataset.link = route.link;
            copyLinkButton.addEventListener("click", function() {
                copyLink(copyLinkButton);
            });
            copyLinkButton.classList.add("copyLinkButton");

            const showRouteButton = document.createElement("button");
            showRouteButton.textContent = "Mostrar Rota";
            showRouteButton.addEventListener("click", function() {
                showRoute(route.link);
            });
            showRouteButton.classList.add("showRouteButton"); 

            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(copyLinkButton);
            actionsCell.appendChild(showRouteButton);

            newRow.appendChild(coletaCell);
            newRow.appendChild(entregaCell);
            newRow.appendChild(destinoCell);
            newRow.appendChild(actionsCell);

            routesTableBody.appendChild(newRow);
        }
    }
    
    searchForm.addEventListener("submit", filterRoutes);
    
    function sortRoutes(event) {
        const column = event.target.textContent.toLowerCase();
        let sortOrder = 1;

        if (event.target.dataset.order === "asc") {
            event.target.dataset.order = "desc";
            sortOrder = -1;
        } else {
            event.target.dataset.order = "asc";
        }

        savedRoutes.sort(function(a, b) {
            const valueA = a[column].toLowerCase();
            const valueB = b[column].toLowerCase();

            if (valueA < valueB) {
                return -1 * sortOrder;
            } else if (valueA > valueB) {
                return 1 * sortOrder;
            } else {
                return 0;
            }
        });

        displaySavedRoutes();
    }
    
    const tableHeaders = document.querySelectorAll("#routesTable th");
    
    tableHeaders.forEach(function(header) {
        header.addEventListener("click", sortRoutes);
    });  
    
    // Evento de clique do botão de exportação
    exportButton.addEventListener("click", function() {
        exportTableToExcel();
    });

    // Função para exportar a tabela para o formato do Excel
    function exportTableToExcel() {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.table_to_sheet(routesTable);

        // Obtém as células de entrada do link da rota
        const linkInputs = document.querySelectorAll(".copyLinkButton");

        // Cria um array para armazenar os dados a serem exportados
        const exportData = [];

        // Adiciona as colunas de cabeçalho
        const headers = ["Coleta", "Entrega", "Destino", "Link da Rota"];
        exportData.push(headers);

        // Itera sobre cada linha da tabela
        for (let i = 0; i < linkInputs.length; i++) {
            const linkInput = linkInputs[i];
            const coletaCell = linkInput.parentNode.parentNode.cells[0].textContent;
            const entregaCell = linkInput.parentNode.parentNode.cells[1].textContent;
            const destinoCell = linkInput.parentNode.parentNode.cells[2].textContent;
            const linkCell = linkInput.dataset.link;

            const row = [coletaCell, entregaCell, destinoCell, linkCell];
            exportData.push(row);
        }

        // Converte o array de dados para uma planilha do Excel
        const excelData = XLSX.utils.aoa_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, excelData, "Rotas");

        // Salva o arquivo Excel
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveExcelFile(excelBuffer, "rotas.xlsx");
    }

    // Função para salvar o arquivo Excel
    function saveExcelFile(buffer, fileName) {
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        link.click();

        URL.revokeObjectURL(url);
    }

    // Função para importar a tabela a partir de um arquivo Excel
    function importTableFromExcel() {
        const file = importInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Atualizar a tabela com os dados importados
            updateTableWithImportedData(jsonData);
        };

        reader.readAsArrayBuffer(file);
    }

    // Função para atualizar a tabela com os dados importados
    function updateTableWithImportedData(jsonData) {
        savedRoutes = jsonData.slice(1).map(function (row) { // Inicia do índice 1 para ignorar o cabeçalho da tabela
            return {
                coleta: row[0],
                entrega: row[1],
                destino: row[2],
                link: row[3]
            };
        });

        localStorage.setItem("routes", JSON.stringify(savedRoutes));
        displaySavedRoutes();
    }

    // Evento de mudança do input de importação
    importInput.addEventListener("change", function () {
        importTableFromExcel();
    });

    const limparTabelaButton = document.querySelector("button:nth-of-type(3)");

    limparTabelaButton.addEventListener("click", function() {
        savedRoutes = [];
        localStorage.removeItem("routes");
        displaySavedRoutes();
    });

    // Função para exibir a janela suspensa
    function showPopup() {
      var popup = document.querySelector('.popup');
      popup.style.display = 'block';
    }

    // Função para fechar a janela suspensa
    function closePopup() {
      var popup = document.querySelector('.popup');
      popup.style.display = 'none';
    }

    // Associar evento de clique ao botão de ajuda
    var helpButton = document.querySelector('.help-button');
    helpButton.addEventListener('click', showPopup);

    // Associar evento de clique ao botão "Fechar"
    var closeButton = document.querySelector('.popup button');
    closeButton.addEventListener('click', closePopup);

});