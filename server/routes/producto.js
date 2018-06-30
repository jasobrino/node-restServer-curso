const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');



// ========================
// Obtener productos
// ========================
app.get('/productos', verificaToken, (req, res) => {
    //trae todos los productos
    //populate: usuario, categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Producto.find({ disponible: true }, 'nombre precioUni descripcion')
        .sort('categoria nombre')
        .limit(limite)
        .skip(desde)
        .populate('usuario', 'nombre email') //relaciona las colecciones
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });

        })

});

// ========================
// Obtener producto por ID
// ========================
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, 'nombre disponible precioUni descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB || !productoDB.disponible) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se a localizado el producto'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ========================
// Buscar productos
// ========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    //busqueda con expresión no sensible a mayúsculas
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        });


})

// ========================
// Crear un nuevo producto
// ========================
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado
    let idUsuario = req.usuario._id;
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: idUsuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // if (!productoDB) { //no se creó el producto
        //     return res.status(400).json({
        //         ok: false,
        //         err
        //     });
        // }
        res.status(201).json({ //(201 -> created)
            ok: true,
            categoria: productoDB
        });
    })

});

// ========================
// Actualizar un producto
// ========================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    body = req.body;

    let productoAct = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id //asi actualizamos el usuario que actualizo el registro
    };

    Producto.findByIdAndUpdate(id, productoAct, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontró el producto"
                }
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });



});


// ========================
// Borrar un producto
// ========================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //marcar disponible a false
    let id = req.params.id;
    //con new:false el find nos devuelve el registro antes del cambio
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontró el producto"
                }
            })
        }

        // if (!productoDB.disponible) {
        //     return res.status(400).json({
        //         ok: false,
        //         err: {
        //             message: "El producto ya está borrado"
        //         }
        //     })
        //}
        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado'
        });
    });


});

module.exports = app;