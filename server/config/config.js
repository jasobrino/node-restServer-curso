// ================================
// Puerto
// si no está definido en process
// le ponemos el puerto local 3000
// ================================
process.env.PORT = process.env.PORT || 3000;

//==================================
//Entorno
//==================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==================================
//Base de Datos
//==================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:123cafe@ds119651.mlab.com:19651/cafe';
}
//urlDB = 'mongodb://cafe-user:123cafe@ds119651.mlab.com:19651/cafe';
process.env.URLDB = urlDB;