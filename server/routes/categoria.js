const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//===============================
//mostrar todas las categorias
//===============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') //relaciona las colecciones
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Categoria.count({}, (err, conteo) => {

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            })
        })

});

//===============================
//mostrar una categoria por ID
//===============================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se a localizado la categoria'
                }
            });
        }
        res.json({
            ok: true,
            categoria
        });
    });
});

//===============================
//crear nueva categoria 
//===============================
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoría
    //req.usuario._id ->id de usuario
    let idUsuario = req.usuario._id;
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: idUsuario
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ //posiblemente algún erron en B.D.
                ok: false,
                err
            });
        }
        if (!categoriaDB) { //no se creó la categoría
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })

});

//===============================
//actualizar descripcion categoria 
//===============================
app.put('/categoria/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    let descCategoria = {
        descripcion: req.body.descripcion
    };
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontró la categoría"
                }
            })
        }
        res.json({
            ok: true,
            usuario: categoriaDB
        });
    });

});


//===============================
//borrar categoria 
//===============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo un adm puede borrar
    //Categoria.findByIdAndRemove()
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontró la categoría"
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoría borrada'

        });

    });
});



module.exports = app;