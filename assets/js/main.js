$(document).ready(function(){

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

        //tamanhos
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


        $scope.$watch('[width,length]', makeMap, true);

        function makeMap() {
            var cols = $scope.width,
                rows = $scope.length;
            $scope.cells = matrix(rows, cols, 0);
        }

        function matrix(rows, cols, defaultValue) {
            var arr = [[]];

            // Creates all lines:
            for (var i = 0; i < rows; i++) {

                // Creates an empty line
                arr[i] = [];

                // Adds cols to the empty line:
                arr[i] = new Array(cols);

                for (var j = 0; j < cols; j++) {
                    // Initializes:
                    arr[i][j] = defaultValue;
                }
            }

            return arr;
        }

        makeMap();

        $scope.sizeChange = function (plus, row){
            var rows = $scope.length;
            var cols = $scope.width;

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

            return true;
        }

        //array das categorias
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

            var info = {
                idC : nomeCategoria.substring(0,3),
                nomeCategoria : nomeCategoria,
                dir : { dir : "images/"+nomeCategoria+"/"},
                count: 5

            }

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



        var drag = undefined;


        $scope.dropped = function(evt) {


            var dom = $(evt.event.target);

            if(dom.hasClass('rotateImage')){
                dom = dom.closest('div');
            }

            if(drag) {

                var img = drag.attr('data-img');
                var id = drag.attr('data-id');

                if(drag[0] === dom[0]){

                    if(evt.event.changedTouches) {
                        var changedTouch = evt.event.changedTouches[0];
                        var elem = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);

                        dom = $(elem);
                    }
                }

                dom.attr("style","background-image:url("+img+")");
                dom.attr('data-img', img);
                dom.attr('data-id', id);

                if(!drag.hasClass('peg')) {
                    drag.attr("style"," ");
                    drag.attr('data-id', 0);
                    drag.attr('data-img', "Null");
                }

            }


        }

        $scope.lixo = function(evt) {

            if(!drag.hasClass('peg')) {
                drag.attr("style"," ");
                drag.attr('data-id', 0);
                drag.attr('data-img', "Null");
            }


        }

        $scope.onDragStart=function(data, evt){
            if ((evt.target !== undefined) && (evt.target.parentNode !== undefined)) {
                var dom = $(evt.target);

                drag = dom;

            }
        };


        $("#expJ").click(function(){


            var matrizJ = [];

            var slotsId = new Array();


            $('.slot').each(function (key) {

                slotsId.push( $(this).attr('data-id')  );

            });


            for (var i = 0; i < $scope.length; i++){
                var linha = new Array();
                for (var j = 0; j < $scope.width; j++){
                    linha.push(  slotsId.shift()  );
                }
                matrizJ.push(linha);
            }

            var jsonDownload = {
                "linhas" : matrizJ.length,
                "colunas" : matrizJ[0].length,
                "matriz" : matrizJ
            }

            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonDownload));

            this.href = dataStr;
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
            }

            var arr = [chunks.shift(), chunks.join('-')];

            return "images/"+categorias[arr[0]]+"/"+arr[1]+".png";

        }

        function degreeToRadians(deg){

            switch(parseInt(deg)){
                case 0:
                    return 0;
                case 90:
                    return Math.PI/2;
                case 180:
                    return  Math.PI;
                case 270:
                    return Math.PI*3/2;
                default :
                    return 0;

            }
        }


        $("#impJ").change(function( evt ) {

            var files = evt.target.files; // FileList object

            var f = files[0];

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    var jsonObj = JSON.parse(e.target.result);

                    $scope.length = jsonObj.linhas;
                    $scope.width = jsonObj.colunas;


                    $('.cat:first').trigger('click');

                    var ids = new Array();

                    for (var i = 0; i < jsonObj.linhas; i++){
                        for (var j = 0; j < jsonObj.colunas; j++){
                            ids.push( jsonObj.matriz[i][j]  );
                        }
                    }


                    $('.slot').each(function (key) {

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

            // Read in the image file as a data URL.
            reader.readAsText(f);

        });

        $("#expI").click(function(){

            var canvas = document.getElementById("mapa");
            var ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var slotsImg = new Array();

            var tamanhoImagem = 400;


            $('.slot').each(function (key) {
                slotsImg.push( { 'imagem' : $(this).attr('data-img'), 'rotacao' : $(this).attr('data-deg') }  );
            });

           canvas.height = $scope.length * tamanhoImagem;
           canvas.width = $scope.width * tamanhoImagem;


            var TO_RADIANS = Math.PI/180;

            for (var i = 0; i < $scope.length; i++){
                for (var j = 0; j < $scope.width; j++){
                    var imageSlot = slotsImg.shift();
                    var rotacao = imageSlot.rotacao;
                    var imageObj = new Image();
                    imageObj.src = imageSlot.imagem;
                    imageObj.setAtX = j * tamanhoImagem;
                    imageObj.setAtY = i * tamanhoImagem;
                    imageObj.onload = function() {
                        ctx.save();

                        ctx.rotate(rotacao * TO_RADIANS);

                        ctx.drawImage(this, this.setAtX, this.setAtY, tamanhoImagem, tamanhoImagem);

                        ctx.rotate( -1 * (rotacao * TO_RADIANS));

                        ctx.restore();
                    };

                }

            }


            window.open().location = canvas.toDataURL("image/‌​png");
        });


        function drawRotated(image, context) {
            context.save();
            context.translate(100, 100);
            context.rotate(Math.PI / 4);
            context.drawImage(image, -image.width / 2, -image.height / 2);
            context.restore();
        }



        $('.centro').on('click', '.rotate', function(){

            $this = $(this).parent();


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


        $scope.limpaTudo = function (){

            $('.slot').each(function (key) {

                var $this = $(this);

                $this.attr("style"," ");
                $this.attr('data-id', 0);
                $this.attr('data-img', "Null");

            });

        }


    }]);




