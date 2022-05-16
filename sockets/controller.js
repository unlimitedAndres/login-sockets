const { Socket } = require('socket.io');
const { comprobarJWT } = require('../helpers');
const { ChatMensajes } = require('../models');

const chatMensaje = new ChatMensajes();

const socketController = async (socket = new Socket(), io) => {
    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);

    if (!usuario) {
        return socket.disconnect();
    }

    chatMensaje.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMensaje.usuariosArr);
    socket.emit('recibir-mensaje', chatMensaje.ultimosDiez);

    // Conectar a una sala en especifico
    socket.join(usuario.id);

    // Usuarios desconectados
    socket.on('disconnect', () => {
        chatMensaje.desconetarUsuario(usuario.id);

        io.emit('usuarios-activos', chatMensaje.usuariosArr);
    });

    socket.on('enviar-mensaje', ({ uid, mensaje }) => {
        if( uid ){
            socket.to( uid ).emit('mensaje-privado', {de: usuario.nombre, mensaje});

        }else{
            chatMensaje.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensaje', chatMensaje.ultimosDiez);
        }
    });
};

module.exports = { socketController };
