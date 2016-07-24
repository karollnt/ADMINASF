var waoo = (function () {
  var usuario = null,
    waooserver = 'http://waoo.herokuapp.com';
  var $body;

  function init() {
    $body = $('body');
    usuario = window.localStorage.getItem('usuario');
    $body.on('submit','.js-login-form',login);
    if(usuario==null || usuario=='' || usuario=='null'){
      if(location.pathname.split("/").slice(-1)[0] != 'sign-in.html')
        window.location.href = 'sign-in.html';
    }
    $body.on('submit','.js-crear-usuario',crearUsuario);
    $body.on('submit','.js-crear-materia',ingresarMateria);
    $body.on('click','.js-logout',logout);
    $body.on('click','.js-borrar-materia',borrarMateria);
  }

  function login(e) {
    e.preventDefault();
    var usr = document.querySelector('.js-usuario').value;
    if(usr!=''){
      var clave = document.querySelector('.js-clave').value;
      clave = md5(clave);
      var ajx = $.ajax({
        type: 'post',
        url: waooserver+'/sesiones/loginAdmin',
        dataType: 'json',
        data: {nickname:usr,clave:clave}
      });
      ajx.done(function(resp) {
        if(resp.msg == 'ok'){
          window.localStorage.setItem('usuario',usr);
          usuario = usr;
          document.querySelector('.js-login-form').reset();
          window.location.href = 'index.html';
        }
        else alert(resp.msg);
      })
      .fail(function(e) {
        alert('Error: ' + e.message);
      });
    }
  }

  function listarUsuarios() {
    var $tabla = $('.js-listar-usuarios tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/buscarUsuarios',
      dataType: 'json',
      data: {col:'estado',val:1}
    });
    ajx.done(function(resp) {
      var html  = '';
      $.each(resp.usuarios,function(i,v){
        html = '<tr>'
          +'<td>'+(i+1)+'</td>'
          +'<td>'+v.nickname+'</td>'
          +'<td>'+v.email+'</td>'
          +'<td>'+v.tipo+'</td>'
          +'<td><a href="#" class="btn btn-default">Edit</a></td>'
          +'<td><a href="#" class="btn btn-link">Delete</a></td>'
        +'</tr>';
        $tabla.append(html);
      });
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function crearUsuario(e) {
    e.preventDefault();
    var $form = $(".js-crear-usuario");
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/crearUsuario',
      dataType: 'json',
      data: datos
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      $form[0].reset();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function listarMaterias() {
    var $tabla = $('.js-listar-materias tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/materias/listarMaterias',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      $.each(resp.materias,function(i,v){
        html = '<tr>'
          +'<td>'+(i+1)+'</td>'
          +'<td>'+v.nombre+'</td>'
          +'<td><a href="#" class="btn btn-default">Edit</a></td>'
          +'<td><a href="#" class="btn btn-link js-borrar-materia" data-id="'+v.id+'">Delete</a></td>'
        +'</tr>';
        $tabla.append(html);
      });
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function ingresarMateria(e) {
    e.preventDefault();
    var $form = $(".js-crear-materia");
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/materias/ingresarMateria',
      dataType: 'json',
      data: datos
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      $form[0].reset();
      listarMaterias();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function borrarMateria(e) {
    var id = $(e.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/materias/borrarMateria',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      listarMaterias();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function logout() {
    usuario = '';
    window.localStorage.setItem('usuario',null);
    window.location.href = 'sign-in.html';
  }

  return {
    init: init,
    listarUsuarios: listarUsuarios,
    listarMaterias: listarMaterias
  };
})();
