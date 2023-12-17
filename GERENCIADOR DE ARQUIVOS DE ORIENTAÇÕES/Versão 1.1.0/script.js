   // Variáveis globais
   var db;
   // Abrir ou criar o banco de dados
   var request = indexedDB.open("bancoImagens", 1);
   request.onupgradeneeded = function(event) {
     db = event.target.result;

     if (!db.objectStoreNames.contains("imagens")) {
       var imagensStore = db.createObjectStore("imagens", { keyPath: "id", autoIncrement: true });
       imagensStore.createIndex("nome", "nome", { unique: false });
       imagensStore.createIndex("descricao", "descricao", { unique: false });
       imagensStore.createIndex("url", "url", { unique: true });
     }
   };
   request.onsuccess = function(event) {
     db = event.target.result;

     // Carregar as imagens do IndexedDB
     carregarImagens();
   };
   // Função para adicionar uma nova imagem
   function addImage() {
     var fileInput = document.getElementById("image-upload");
     var imageNameInput = document.getElementById("image-name");
     var imageDescriptionInput = document.getElementById("image-description");
     var imageContainer = document.getElementById("image-container");

     var file = fileInput.files[0];
     var imageName = imageNameInput.value;
     var imageDescription = imageDescriptionInput.value;

     // Armazenar a imagem no IndexedDB
     var reader = new FileReader();
     reader.onload = function(e) {
       var imageUrl = e.target.result;

       var transaction = db.transaction(["imagens"], "readwrite");
       var imagensStore = transaction.objectStore("imagens");

       var novaImagem = {
         url: imageUrl,
         nome: imageName,
         descricao: imageDescription
       };

       var request = imagensStore.add(novaImagem);

       request.onsuccess = function(event) {
         console.log("Imagem adicionada com sucesso ao IndexedDB!");
         carregarImagens(); // Atualizar a exibição das imagens
       };

       request.onerror = function(event) {
         console.error("Erro ao adicionar imagem ao IndexedDB:", event.target.error);
       };

       // Limpar os campos de entrada
       fileInput.value = "";
       imageNameInput.value = "";
       imageDescriptionInput.value = "";
     };

     reader.readAsDataURL(file);
   }
   // Função para remover uma imagem
   function removeImage(imageCard, imageUrl) {
     var transaction = db.transaction(["imagens"], "readwrite");
     var imagensStore = transaction.objectStore("imagens");

     var request = imagensStore.index("url").get(imageUrl);

     request.onsuccess = function(event) {
       var imagem = event.target.result;

       if (imagem) {
         var confirmation = confirm("Tem certeza de que deseja remover esta imagem?");
         
         if (confirmation) {
           var deleteRequest = imagensStore.delete(imagem.id);

           deleteRequest.onsuccess = function() {
             console.log("Imagem removida do IndexedDB!");
             carregarImagens(); // Atualizar a exibição das imagens
           };

           deleteRequest.onerror = function(event) {
             console.error("Erro ao remover imagem do IndexedDB:", event.target.error);
           };
         }
       }
     };
     // Impedir a propagação do evento de clique para o elemento pai
     event.stopPropagation();
   }
   // Função para copiar a imagem para a área de transferência
   function copyImage(imageUrl) {
       var imageElement = new Image();
       imageElement.onload = function() {
         var canvas = document.createElement("canvas");
         canvas.width = imageElement.width;
         canvas.height = imageElement.height;
         var ctx = canvas.getContext("2d");
         ctx.drawImage(imageElement, 0, 0);

         if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
           canvas.toBlob(function(blob) {
             var item = new ClipboardItem({ "image/png": blob });
             navigator.clipboard.write([item]).then(function() {
               alert("Imagem copiada para a área de transferência!");
             }, function(error) {
               console.error("Erro ao copiar imagem:", error);
             });
           });
         } else {
           console.error("A cópia de imagem não é suportada neste navegador.");
         }
       };
       imageElement.src = imageUrl;
     }
   // Função para criar um botão "Copiar Imagem" em cada cartão de imagem
   function createCopyButton(imageUrl) {
     var copyButton = document.createElement("button");
     copyButton.textContent = "Copiar";
     copyButton.addEventListener("click", function(event) {
       event.stopPropagation();
       copyImage(imageUrl);
     });
     return copyButton;
   }
   // Função para exibir uma imagem em tamanho original
   function showOriginalImage(imageUrl) {
     var originalImage = document.createElement("img");
     originalImage.src = imageUrl;
     originalImage.style.maxWidth = "30%"; // Defina o tamanho desejado

     var overlay = document.createElement("div");
     overlay.style.position = "fixed";
     overlay.style.top = "0";
     overlay.style.left = "0";
     overlay.style.width = "100%";
     overlay.style.height = "100%";
     overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
     overlay.style.display = "flex";
     overlay.style.alignItems = "center";
     overlay.style.justifyContent = "center";
     overlay.style.zIndex = "9999";

     overlay.appendChild(originalImage);

     overlay.addEventListener("click", function() {
       document.body.removeChild(overlay);
     });

     document.body.appendChild(overlay);
   }
   // Função para filtrar imagens por nome e descrição
   function filterImagesByNameOrDescription(searchText) {
     var imageContainer = document.getElementById("image-container");
     imageContainer.innerHTML = "";

     var transaction = db.transaction(["imagens"], "readonly");
     var imagensStore = transaction.objectStore("imagens");
     var index = imagensStore.index("nome");

     var request = index.openCursor();

     request.onsuccess = function (event) {
       var cursor = event.target.result;

       if (cursor) {
         var imagem = cursor.value;

         var nomeLowerCase = imagem.nome.toLowerCase();
         var descricaoLowerCase = imagem.descricao.toLowerCase();
         var searchTextLowerCase = searchText.toLowerCase();

         if (
           searchTextLowerCase === "" ||
           nomeLowerCase.includes(searchTextLowerCase) ||
           descricaoLowerCase.includes(searchTextLowerCase)
         ) {
           var imageCard = document.createElement("div");
           imageCard.className = "image-card";

           var imageElement = document.createElement("img");
           imageElement.src = imagem.url;
           imageCard.appendChild(imageElement);

           var nameElement = document.createElement("h3");
           nameElement.textContent = imagem.nome;
           imageCard.appendChild(nameElement);

           var descriptionElement = document.createElement("p");
           descriptionElement.textContent = imagem.descricao;
           imageCard.appendChild(descriptionElement);

           var removeButton = document.createElement("button");
           removeButton.textContent = "Remover";
           removeButton.addEventListener("click", function () {
             removeImage(imageCard, imagem.url);
           });
           imageCard.appendChild(createCopyButton(imagem.url));
           imageCard.appendChild(removeButton);

           imageCard.addEventListener("click", function () {
             showOriginalImage(imagem.url);
           });

           imageContainer.appendChild(imageCard);
         }

         cursor.continue();
       }
     };
   }
   // Função para carregar as imagens do IndexedDB
   function carregarImagens() {
     var imageContainer = document.getElementById("image-container");
     imageContainer.innerHTML = "";

     var transaction = db.transaction(["imagens"], "readonly");
     var imagensStore = transaction.objectStore("imagens");

     var request = imagensStore.openCursor();

     request.onsuccess = function(event) {
       var cursor = event.target.result;

       if (cursor) {
         var imagem = cursor.value;

         var imageCard = document.createElement("div");
         imageCard.className = "image-card";

         var imageElement = document.createElement("img");
         imageElement.src = imagem.url;
         imageCard.appendChild(imageElement);

         var nameElement = document.createElement("h3");
         nameElement.textContent = imagem.nome;
         imageCard.appendChild(nameElement);

         var descriptionElement = document.createElement("p");
         descriptionElement.textContent = imagem.descricao;
         imageCard.appendChild(descriptionElement);

         var removeButton = document.createElement("button");
         removeButton.textContent = "Remover";
         removeButton.addEventListener("click", function() {
           removeImage(imageCard, imagem.url);
         });
         imageCard.appendChild(createCopyButton(imagem.url)); // Adicionar o botão "Copiar Imagem" ao cartão de imagem
         imageCard.appendChild(removeButton);
         

         imageCard.addEventListener("click", function() {
           showOriginalImage(imagem.url);
         });

         imageContainer.appendChild(imageCard);

         cursor.continue();
       }
     };
   }
   // Adicionar um listener de evento ao botão para chamar a função addImage()
   var addButton = document.getElementById("add-image-button");
   addButton.addEventListener("click", addImage);
   // Adicionar um listener de evento ao campo de busca para filtrar as imagens
   var addButton = document.getElementById("add-image-button");
   addButton.addEventListener("click", addImage);
   var addButton = document.getElementById("add-image-button");
   addButton.addEventListener("click", addImage);
   var searchInput = document.getElementById("search-input");
   searchInput.addEventListener("input", function() {
     clearTimeout(this.timer);
     this.timer = setTimeout(function() {
       filterImagesByNameOrDescription(searchInput.value);
     }, 300);
   });