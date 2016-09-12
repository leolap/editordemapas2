


module.exports = {
    json: function (req, res) {

        console.log(req.get());

        var filename = 'mapa.json';
        var mimetype = 'application/json';

        res.set({
            'Content-Type' : mimetype,
            'Content-disposition': 'attachment; filename='+filename
        })

      return  res.view("index");
    }
};