


module.exports = {

    count: function (req, res) {

        var fs = require('fs');


       var query = req.query;

       var dir = "assets/"+query.dir;

       var files = fs.readdirSync(dir);

       var count = files.length;

      return  res.ok({
          count: count-2
      });
    }
};