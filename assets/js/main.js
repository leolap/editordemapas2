$(document).ready(function(){

    //mostra o spinner quando há um ajax na página.
    $(document).bind("ajaxSend", function() {
        $('#spinner').show();
    }).bind("ajaxStop", function() {
        $('#spinner').hide();
    }).bind("ajaxError", function() {
        $('#spinner').hide();
    });

});


angular
    .module('ddApp', ['ngTouch', 'ngDraggable']) // register the directive with your app module
    .controller('ddController', ['$scope' , function($scope){ // function referenced by the drop target


        // inicializa as células da matriz da tela.
        $scope.cells = [
            []
        ];

        //tamanhos máximo e mínimos de linha e colunas e de cada imagem.
        var maxRow = 5;
        var maxCol = 5;
        var minRow = 3;
        var minCol = 3;

        var imagem = {
            'altura' : 300,
            'largura' : 300
        };


        $scope.sizes = [];

        $scope.length = minRow;
        $scope.width = minCol;

        $scope.imagem = imagem;

        // fim tamanhos

        //verifica se há mudança no número de linhas e colunas
        $scope.$watch('[width,length]', makeMap, true);

        function makeMap() {
            var cols = $scope.width,
                rows = $scope.length;
            $scope.cells = matrix(rows, cols, 0);
        }

        function matrix(rows, cols, defaultValue) {
            var arr = [[]];

            // cria as linhas:
            for (var i = 0; i < rows; i++) {

                //cria uma linha vazia
                arr[i] = [];

                // adiciona coluna nas linhas:
                arr[i] = new Array(cols);

                for (var j = 0; j < cols; j++) {
                    // inicializa:
                    arr[i][j] = defaultValue;
                }
            }

            return arr;
        }

        makeMap();


        //Quando uma seta é clicada na tela
        $scope.sizeChange = function (plus, row){
            var rows = $scope.length;
            var cols = $scope.width;

            //verifica se aumentou linha ou coluna e aumenta caso não esteja no máximo ou o contrário
            if(plus){
                if(row && rows < maxRow)
                    $scope.length++;
                if(!row && cols < maxCol)
                    $scope.width++
            }else{
                if(row && rows > minRow)
                    $scope.length--;
                if(!row && cols > minRow)
                    $scope.width--
            }
        };

        //array das categorias e imagem padrão
        $scope.categorias = [
            {
                'nome' : "fantasia",
                'imgUrl' : "images/fantasia/0.png"
            },
            {
                'nome' : "floresta",
                'imgUrl' : "images/floresta/0.png"
            },
            {
                'nome' : "fazenda",
                'imgUrl' : "images/fazenda/0.png"
            },
            {
                'nome' : "cidade",
                'imgUrl' : "images/cidade/0.png"
            },
            {
                'nome' : "mar",
                'imgUrl' : "images/mar/0.png"
            }
        ];


        var tilesArray = [];

        //preenche o array de tiles com as informações básicas
        function preencheTiles(info){
            tilesArray = [];

            for(var i = 1; i < info.count; i++ ){

                var tile = {
                    "id" : info.idC+"-"+i,
                    "categoria" : info.nomeCategoria,
                    "imgUrl" : "images/"+info.nomeCategoria+"/"+i+".png"
                };

                tilesArray.push(tile);
            }

        }


        $scope.selecionaCategoria = function(nomeCategoria){

            //coloca informações básicas e genérica da tile da mesma categoria

            var info = {
                idC : nomeCategoria.substring(0,3),
                nomeCategoria : nomeCategoria,
                dir : { dir : "images/"+nomeCategoria+"/"}
            };


            //verifica quantas imagens há na pasta da categoria
            $.when($.ajax({
                url: 'fileCount',
                type: "GET",
                data: info.dir,
                success: function(data) {
                    info.count = data.count;
                    preencheTiles(info);
                }
            })).done(function () {
                $scope.tiles = tilesArray;
                $scope.$apply();

            });

        };


        //inicializa qual tile está sendo movimentada
        var drag = undefined;


        $scope.dropped = function(evt) {

            //guarda onde foi dropado a tile
            var dom = $(evt.event.target);

            if(dom.hasClass('rotateImage')){
                dom = dom.closest('div');
            }

            //se a tile movimentada existe
            if(drag) {

                //remove as informações da tile movimentada
                var img = drag.attr('data-img');
                var id = drag.attr('data-id');


                //verifica se é touch
                if(drag[0] === dom[0]){

                    //então se é touch remove as informações do touch
                    if(evt.event.changedTouches) {
                        var changedTouch = evt.event.changedTouches[0];
                        var elem = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);

                        dom = $(elem);
                    }
                }


                //passa as informações para a nova tile
                dom.attr("style","background-image:url("+img+")");
                dom.attr('data-img', img);
                dom.attr('data-id', id);

                //caso foi de uma tile para outra, limpa a tile arrastada
                if(!drag.hasClass('peg')) {
                    drag.attr("style"," ");
                    drag.attr('data-id', 0);
                    drag.attr('data-img', "Null");
                }

            }


        };

        $scope.lixo = function() {

            //limpa a tile que foi arrastada até a lixeira
            if(!drag.hasClass('peg')) {
                drag.attr("style"," ");
                drag.attr('data-id', 0);
                drag.attr('data-img', "Null");
            }


        };

        //guarda as informações da tile arrastada
        $scope.onDragStart=function(data, evt){
            if ((evt.target !== undefined) && (evt.target.parentNode !== undefined)) {
                drag = $(evt.target);
            }
        };


        $("#expJ").click(function(){


            var matrizJ = [];

            var slotsId = [];

            //guarda o ID de cada slot
            $('.slot').each(function () {

                slotsId.push( $(this).attr('data-id')  );

            });

            //transforma em uma matriz
            for (var i = 0; i < $scope.length; i++){
                var linha = [];
                for (var j = 0; j < $scope.width; j++){
                    linha.push(  slotsId.shift()  );
                }
                matrizJ.push(linha);
            }

            //guarda a matriz em um objeto json
            var jsonDownload = {
                "linhas" : matrizJ.length,
                "colunas" : matrizJ[0].length,
                "matriz" : matrizJ
            };

            //baixa o json
            this.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonDownload));
        });

        function idToImageUrl(id){

            if(id == 0){
                return false;
            }

            var chunks = id.split("-");

            var categorias = {
                'fan' : 'fantasia',
                'faz' :  'fazenda',
                'flo' : 'floresta',
                'cid' : 'cidade',
                'mar' : 'mar'
            };

            var arr = [chunks.shift(), chunks.join('-')];

            return "images/"+categorias[arr[0]]+"/"+arr[1]+".png";

        }

//        function degreeToRadians(deg){
//
//            switch(parseInt(deg)){
//                case 0:
//                    return 0;
//                case 90:
//                    return Math.PI/2;
//                case 180:
//                    return  Math.PI;
//                case 270:
//                    return Math.PI*3/2;
//                default :
//                    return 0;
//
//            }
//        }


        $("#impJ").change(function( evt ) {

            var files = evt.target.files; // lista de arquivos no upload

            var f = files[0]; //pega o primeiro arquivo

            var reader = new FileReader(); //inicializa leitor

            reader.onload = (function() {
                return function(e) {

                    var jsonObj = JSON.parse(e.target.result); //lê o arquivo


                    //coloca linha e colunas do tamanho que está no arquivo
                    $scope.length = jsonObj.linhas;
                    $scope.width = jsonObj.colunas;


                    $('.cat:first').trigger('click'); //abre a primeira categoria


                    //transforma a matriz em um array deum nível
                    var ids = [];

                    for (var i = 0; i < jsonObj.linhas; i++){
                        for (var j = 0; j < jsonObj.colunas; j++){
                            ids.push( jsonObj.matriz[i][j]  );
                        }
                    }

                    //coloca as informações em cada slot de tile
                    $('.slot').each(function () {

                        var id = ids.shift();

                        var img = idToImageUrl(id);

                        if(img) {
                            $(this).attr("style","background-image:url("+img+")");
                            $(this).attr('data-img', img);
                        }
                        $(this).attr('data-id', id);

                    });

                };
            })(f);

            //lê o arquivo como texto
            reader.readAsText(f);

        });

        $("#expI").click(function(){


            //seleciona o contexto do canvas
            var canvas = document.getElementById("mapa");
            var ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var slotsImg = [];

            var tamanhoImagem = 400;

            //pega cada imagem que estão nos slots
            $('.slot').each(function () {
                slotsImg.push( { 'imagem' : $(this).attr('data-img'), 'rotacao' : $(this).attr('data-deg') }  );
            });


            //tamanho do canvas é o tamanho da imagem por coluna e linha
           canvas.height = $scope.length * tamanhoImagem;
           canvas.width = $scope.width * tamanhoImagem;


            var TO_RADIANS = Math.PI/180;


            //para cada imagem coloca no canvas, com espaço de uma imagem para cima ou para baixo dependendo da matriz
            for (var i = 0; i < $scope.length; i++){
                for (var j = 0; j < $scope.width; j++){
                    var imageSlot = slotsImg.shift();
                    var imageObj = new Image();
                    imageObj.src = imageSlot.imagem;
                    imageObj.setAtX = j * tamanhoImagem;
                    imageObj.setAtY = i * tamanhoImagem;
                    imageObj.onload = function() {
                        ctx.save();

                        ctx.rotate(imageSlot.rotacao * TO_RADIANS);

                        ctx.drawImage(this, this.setAtX, this.setAtY, tamanhoImagem, tamanhoImagem);

                        ctx.rotate( -1 * (imageSlot.rotacao * TO_RADIANS));

                        ctx.restore();
                    };

                }

            }


            window.open().location = canvas.toDataURL("image/‌​png");
        });


//        function drawRotated(image, context) {
//            context.save();
//            context.translate(100, 100);
//            context.rotate(Math.PI / 4);
//            context.drawImage(image, -image.width / 2, -image.height / 2);
//            context.restore();
//        }



        $('.centro').on('click', '.rotate', function(){

            var $this = $(this).parent();


            var graus = $this.attr('data-deg');

            var grausNovo = 0;
            var classeVelha;
            var classeNova;

            switch(graus){
                case "0":

                    grausNovo = 90;
                    classeNova = "rot90";
                    break;

                case "90":

                    grausNovo = 180;
                    classeVelha = "rot90";
                    classeNova = "rot180";
                    break;

                case "180":
                    grausNovo = 270;
                    classeVelha = "rot180";
                    classeNova = "rot270";
                    break;

                case "270":
                    grausNovo = 0;
                    classeVelha = "rot270";
                    break;
                default :

                    grausNovo = 0;
                    break;

            }

            $this.attr('data-deg', grausNovo);
            if(classeVelha)
                $this.removeClass(classeVelha);
            if(classeNova)
                $this.addClass(classeNova);


        });

        //limpa todos os slots quando clica na lixeira
        $scope.limpaTudo = function (){

            $('.slot').each(function () {

                var $this = $(this);

                $this.attr("style"," ");
                $this.attr('data-id', 0);
                $this.attr('data-img', "Null");

            });

        }


    }]);




