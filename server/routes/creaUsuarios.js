const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

let creaNuevoUsu = async(i) => {
    return new Promise((resolve, reject) => {
        let usuario = new Usuario({
            nombre: `Usuario numero ${ i }`,
            email: `test${i}@gmail.com`,
            password: bcrypt.hashSync('123456', 10)
        });
        //buscamos el usuario para borrarlo si existe
        Usuario.findOneAndRemove({ 'email': usuario.email }, (err, usuBorrado) => {
            if (err) throw new Error(`Error findOneAndRemove: ${err}`);
            if (usuBorrado) console.log(`borrado: ${usuBorrado.nombre}`);
            //ahora creamos el nuevo usuario
            usuario.save((err, usuarioDB) => {
                if (err) reject(`El usuario ${usuario} no ha podido insertarse en BD`);
                console.log(` usuario creado: ${ usuarioDB.nombre } [${i}]`);
                resolve(usuarioDB);
            });
        })
    });
}

let creausus = async(cantidad) => {
    let creados = [];
    console.log(`Creando ${cantidad} usuarios...`);
    for (let i = 1; i <= cantidad; i++) {
        await creaNuevoUsu(i)
            .then(resp => {
                //console.log(resp);
                creados.push({ indice: i, nombre: resp.nombre });
            })
            .catch(e => console.log('Error:', e));
    }
    console.log(creados);
}

module.exports = {
    creausus
}