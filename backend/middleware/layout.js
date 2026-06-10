// Bu dosya layout.ejs kullanımını kolaylaştırmak için res.render override yapar
// server.js içine eklenecek

module.exports = function layoutMiddleware(req, res, next) {
  const originalRender = res.render.bind(res);
  
  res.render = function(view, locals, callback) {
    if (typeof locals === 'function') {
      callback = locals;
      locals = {};
    }
    locals = locals || {};
    
    // İç view'ı render et
    originalRender(view, locals, (err, html) => {
      if (err) return next(err);
      
      // Layout ile wrap et
      originalRender('layout', {
        ...locals,
        body: html,
        title: locals.title || 'Mera Kanunu YS'
      }, callback || ((err2, finalHtml) => {
        if (err2) return next(err2);
        res.send(finalHtml);
      }));
    });
  };
  
  next();
};
