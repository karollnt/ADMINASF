var waoo = (function () {
  var usuario = null,
    waooserver = 'https://tu-eco-back.herokuapp.com';
  var $body;
  let recicladores = [];

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
    $body.on('submit','.js-crear-banco',crearBanco);
    $body.on('submit','.js-filtrar-aceptadas',filtrarAceptadas);
    $body.on('submit', '.js-assign-to', asignarRuta);
    $body.on('submit', '.js-crear-ruta', crearRuta);
    $body.on('click','.js-logout',logout);
    $body.on('click','.js-borrar-materia',borrar_categoria);
    $body.on('click','.js-borrar-banco',borrarBanco);
    $body.on('click','.js-borrar-usuario',borrarUsuario);
    $body.on('click','.js-asignar',reasignar);
    $body.on('click','.js-aprobar-soporte',aprobarSoporte);
    $body.on('keyup','.js-filter-users',filtrarTabla);
  }

  function login(e) {
    e.preventDefault();
    var usr = document.querySelector('.js-usuario').value;
    if(usr!=''){
      var clave = document.querySelector('.js-clave').value;
      // clave = md5(clave);
      var ajx = $.ajax({
        type: 'post',
        url: waooserver+'/user/login',
        dataType: 'json',
        data: {correo:usr, clave:clave, tipo: 4}
      });
      ajx.done(function(resp) {
        if(resp.valid){
          let request = $.ajax({
            type: 'GET',
            url: waooserver + '/user/get_user_data',
            dataType: 'json',
            data: {id: resp.id}
          });
          request.done(function (data) {
            let userString = JSON.stringify(data);
            let usr = JSON.parse(userString);
            window.localStorage.setItem('usuario', usr);
            usuario = usr;
            document.querySelector('.js-login-form').reset();
            window.location.href = 'index.html';
          });
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
      url: waooserver+'/user/list_users',
      dataType: 'json'
    });
    ajx.done(function(resp) {
      var html  = '';
      if(resp.users) {
        $.each(resp.users,function(i,v){
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.identificacion+'</td>'
            +'<td>'+(v.nombre + ' ' + v.apellido)+'</td>'
            +'<td>'+v.correo+'</td>'
            +'<td>'+v.direccion+'</td>'
            +'<td><a href="#" class="btn btn-link js-borrar-usuario" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="6">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function datosSelectAsistentes(clase) {
    var selectAsistentes = '<select class="'+clase+'">';
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/listarAsistentes',
      dataType: 'json',
      data: {col:'estado',val:1}
    });
    ajx.done(function(resp) {
      $.each(resp.usuarios,function(i,v){
        selectAsistentes += '<option value="'+v.id+'">'+v.nickname+'</option>';
      });
      selectAsistentes += '</select>';
      $('.js-asistente-container').html(selectAsistentes);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function crearUsuario(e) {
    if(e) e.preventDefault();
    var $form = $(".js-crear-usuario");
    var datos = new FormData($form[0]);
    var ajx = $.ajax({
      url: waooserver + '/user/create_user',
      method: 'POST',
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      data: datos
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      $form[0].reset();
      listarUsuarios();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function borrarUsuario(e) {
    if(e) e.preventDefault();
    var id = $(e.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/usuarios/borrarUsuario',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      listarUsuarios();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function listarMedidas() {
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/category/get_measurements',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      const html = resp.reduce(function (carry, item) {
        return carry + '<option value="' + item.id + '">' + item.nombre + '</option>';
      }, '');
      $('.js-medidas-select').html(html);
    });
  }

  function listarTiposCategoria() {
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/category/get_category_types',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      const html = resp.reduce(function (carry, item) {
        return carry + '<option value="' + item.id + '">' + item.nombre + '</option>';
      }, '');
      $('.js-types-select').html(html);
    });
  }

  function listarMaterias() {
    var $tabla = $('.js-listar-materias tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver +'/category/get_categories',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      if(resp.length) {
        $.each(resp, function(i,v){
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nombre+'</td>'
            + '<td>' + v.precio + '</td>'
            + '<td>' + v.medida + '</td>'
            + '<td>' + v.tipo + '</td>'
            +'<td><a href="#" class="btn btn-link js-borrar-materia" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="3">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function ingresarMateria(e) {
    if(e) e.preventDefault();
    var $form = $(".js-crear-materia");
    var datos = new FormData($form[0]);
    var ajx = $.ajax({
      url: waooserver+'/category/create_category',
      method: 'POST',
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      data: datos
    });
    ajx.done(function(resp) {
      const msg = resp.valid ? 'Categoria creada' : 'No se pudo crear';
      alert(msg);
      $form[0].reset();
      listarMaterias();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function borrar_categoria(e) {
    if(e) e.preventDefault();
    var id = $(e.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/categoria/borrar_categoria',
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

  function trabajosRealizadosSemana() {
    var $tabla = $('.js-listar-trabajos-sem tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/trabajosRealizadosSemana',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      if(resp.trabajos){
        $.each(resp.trabajos,function(i,v){
          html += '<tr'+(v.numcomprobante.indexOf('PT-') ? ' class="first-work"':'')+'>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nombreasistente+'</td>'
            +'<td>'+v.numerocuenta+'</td>'
            +'<td>'+v.banco+'</td>'
            +'<td>'+v.tokens+'</td>'
            +'<td>'+v.numcomprobante+'</td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="5">No hay resultados</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function cargarSelectAsistentes() {
    datosSelectAsistentes('form-control js-asistente');
  }

  function filtrarAceptadas(e) {
    if(e) e.preventDefault();
    var $tabla = $('.js-listar-aceptadas tbody');
    $tabla.html('');
    var $form = $(".js-filtrar-aceptadas");
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/ofertasAceptadasSemana',
      dataType: 'json',
      data: datos
    });
    ajx.done(function(resp) {
      var html='', btn='';
      if(resp.trabajos){
        $.each(resp.trabajos,function(i,v){
          btn = '<button class="btn btn-primary form-control js-asignar" data-id="'+v.id+'">Asignar</button>';
          html += '<tr'+(v.numcomprobante.indexOf('PT-') ? ' class="first-work"':'')+'>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.usuario+'</td>'
            +'<td>'+v.nickname+'</td>'
            +'<td>'+v.titulo+'</td>'
            +'<td>'+v.tokens+'</td>'
            +'<td>'+v.numcomprobante+'</td>'
            +'<td>'+btn+'</td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="5">No hay resultados</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function reasignar(e) {
    if(e) e.preventDefault();
    var idtrabajo = $(e.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/solicitudes/reasignarAsistenteTrabajo',
      dataType: 'json',
      data: {idasistente: $('.js-asistente option:selected').val(), idtrabajo: idtrabajo}
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      filtrarAceptadas();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function listarBancos() {
    var $tabla = $('.js-listar-bancos tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/bancos/listaBancos',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      if(resp.bancos){
        $.each(resp.bancos,function(i,v){
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nombre+'</td>'
            +'<td><a href="#" class="btn btn-link js-borrar-banco" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="3">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function crearBanco(e) {
    if(e) e.preventDefault();
    var $form = $(".js-crear-banco");
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/bancos/crearBanco',
      dataType: 'json',
      data: datos
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      $form[0].reset();
      listarBancos();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function borrarBanco(e) {
    if(e) e.preventDefault();
    var id = $(e.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/bancos/borrarBanco',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      listarBancos();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }
  function rankCalificacion() {
    var $tabla = $('.js-ranking-calificacion tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/rankingAsistentesCalificacion',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      if (resp.usuarios) {
        var calificacion = 0;
        $.each(resp.usuarios,function(i,v){
          calificacion = parseFloat(v.calificacion).toFixed(2);
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nickname+'</td>'
            +'<td><span class="stars" title="'+calificacion+'">'+calificacion+'</span></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="4">No hay registros</td></tr>';
      }
      $tabla.append(html);
      if(resp.usuarios) $('.stars').stars();
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

  function filtrarTabla(e) {
    var element = $(e.target);
    var $searchable = $('.searchable');
    var rex = new RegExp(element.val(), 'i');
    if($searchable.length > 0){
      var filas = $searchable.find('tr');
      filas.hide();
      filas.filter(function () {
        return rex.test($(this).text());
      }).show();
    }
  }

  function soportesSinAprobar() {
    var $tabla = $('.js-lista-soportes tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/solicitudes/soportesSinAprobar',
      dataType: 'json',
      data: ''
    });
    ajx.done(function(resp) {
      var html  = '';
      if (resp.msg) {
        var soportes = JSON.parse(resp.msg);
        $.each(soportes,function(i,v){
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nickname+'</td>'
            +'<td>'+v.tokens+'</td>'
            +'<td><a href="'+v.consignacion+'" target="_blank">Ver</a></td>'
            +'<td><a href="#" class="btn btn-link js-aprobar-soporte" data-id="'+v.id+'"><span class="fa fa-check"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="4">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }

  function aprobarSoporte(ev) {
    ev.preventDefault();
    var elem = ev.currentTarget;
    console.log(elem);
    var id = elem.dataset.id;
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/solicitudes/aprobarSoporte',
      dataType: 'json',
      data: {id:id, fuente:usuario}
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      soportesSinAprobar();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  }
  
  const checkEditPhoto = function (ev) {
    ev.preventDefault();
    let messageContainer = $('.js-update-photo-message');
    messageContainer.html('...');
    const formData = new FormData(ev.target);
    let request = $.ajax({
      async: false,
      cache: false,
      contentType: false,
      url: Variables.backendURL + 'user/update_image',
      method: 'POST',
      processData: false,
      data: formData
    });
    request.done(function (data) {
      if (data.valid == true) {
        location.reload();
        return;
      }
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    }).fail(function () {
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    });
  };

  const listarSolicitudesSinAsignar = function () {
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/order/get_unassigned_orders',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      var html = '';
      if (resp.length) {
        $.each(resp, function (i, solicitud) {
          html += '<li>' +
            '<input type="checkbox" name="solicitudes[]" value="' + solicitud.id + '"> ' +
            '<label for="sol_' + solicitud.id + '">' + solicitud.direccion + '</label> - ' +
            '<span>' + solicitud.ciudad + ', ' + solicitud.departamento + ' ( creado: ' + solicitud.fecha + ' )</span>' +
          '</li>';
        });
      }
      else {
        html = '<tr><td colspan="3">No hay registros</td></tr>';
      }
      $('.js-solicitudes').html(html);
    })
      .fail(function (e) {
        alert('Error: ' + e.message);
      });
  };

  const listarRutas = function () {
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/route/get_all_routes',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      var html = '';
      if (resp.routes) {
        if (recicladores.length < 1) {
          listarRutas();
          return;
        }
        const recicladoresOptions = generarSelectRecicladores();
        $.each(resp.routes, function (i, ruta) {
          let assignTo = ruta.nombre + ' ' + ruta.apellido;
          if (['Recogido', 'Asignado'].indexOf(ruta.estado) < 0) {
            assignTo = '<form class="js-assign-to">' +
              '<input type="hidden" name="idruta" value="' + ruta.id + '">' +
              '<select name="idreciclador">' + recicladoresOptions + '</select><br>' +
              '<button>Asignar</button>' +
            '</form>';
          };
          html += '<tr>' +
              '<td>' + ruta.id + '</td>' +
              '<td>' + ruta.fecha_creacion + '</td>' +
              '<td>' + ruta.comentario + '</td>' +
              '<td>' + ruta.estado + '</td>' +
              '<td>' + assignTo + '</td>' +
            '</tr>';
        });
      }
      else {
        html = '<tr><td colspan="5">No hay registros</td></tr>';
      }
      $('.js-listar-rutas').append(html);
    })
      .fail(function (e) {
        alert('Error: ' + e.message);
      });
  };

  const obtenerRecicladores = function () {
    var ajx = $.ajax({
      type: 'post',
      url: waooserver + '/user/list_users_by_type',
      dataType: 'json',
      data: {type: 3}
    });
    ajx.done(function (resp) {
      recicladores = JSON.parse(JSON.stringify(resp.users));
    });
  };

  const generarSelectRecicladores = function () {
    return recicladores.reduce(function (carry, reciclador) {
      return carry + '<option value="' + reciclador.id + '">' + (reciclador.nombre + ' ' + reciclador.apellido) + '</option>'
    }, '');
  };

  const asignarRuta = function (ev) {
    ev.preventDefault();
    const form = $(ev.target);
    let ajx = $.ajax({
      type: 'post',
      url: waooserver + '/route/assign_route',
      dataType: 'json',
      data: form.serialize()
    });
    ajx.done(function (resp) {
      if (resp.valid) {
        location.reload();
        return;
      }
      alert('No se pudo asignar');
    });
  };

  const crearRuta = function (ev) {
    ev.preventDefault();
    const form = $(ev.target);
    let ajx = $.ajax({
      type: 'post',
      url: waooserver + '/route/create_route',
      dataType: 'json',
      data: form.serialize()
    });
    ajx.done(function (resp) {
      if (resp.valid) {
        location.reload();
        return;
      }
      alert('No se pudo asignar');
    });
  };

  return {
    init: init,
    listarUsuarios: listarUsuarios,
    listarMaterias: listarMaterias,
    listarBancos: listarBancos,
    trabajosRealizadosSemana: trabajosRealizadosSemana,
    cargarSelectAsistentes: cargarSelectAsistentes,
    filtrarAceptadas: filtrarAceptadas,
    rankCalificacion: rankCalificacion,
    soportesSinAprobar: soportesSinAprobar,
    listarMedidas: listarMedidas,
    listarTiposCategoria: listarTiposCategoria,
    listarSolicitudesSinAsignar: listarSolicitudesSinAsignar,
    listarRutas: listarRutas,
    obtenerRecicladores: obtenerRecicladores
  };
})();
