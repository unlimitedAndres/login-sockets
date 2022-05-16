const url = window.location.hostname.includes('localhost')
    ? 'http://localhost:8080/api/auth/'
    : 'https://restserver-curso-fher.herokuapp.com/api/auth/';

let usuario = null;
let socket = null;

const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');

const validarJWT = async () => {
    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch(url, {
        headers: { 'x-token': token }
    });

    const { usuario: usuarioDB, token: tokenDB } = await resp.json();

    localStorage.setItem('token', tokenDB);
    usuario = usuarioDB;
    document.title = usuario.nombre;

    await conectarSocket();
};

const conectarSocket = async () => {
    socket = io({
        extraHeaders: {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('sockets online');
    });

    socket.on('disconnect', () => {
        console.log('sockets offline');
    });

    socket.on('recibir-mensaje', dibujarMensajes);

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado', (payload) => {
        console.log( 'Privado:', payload );
    });
};

const dibujarUsuarios = (usuarios = []) => {
    let userHtml = '';
    usuarios.forEach(({ nombre, uid }) => {
        userHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre} </h5>
                    <span class="fs-6 text-muted"> ${uid} </span>
                </p>
            </li>
        `;
    });

    ulUsuarios.innerHTML = userHtml;
};

const dibujarMensajes = (mensajes = []) => {
    let messageHtml = '';
    mensajes.forEach(({ nombre, mensaje }) => {
        messageHtml += `
            <li>
                <p>
                <span class="fs-6 text-primary"> ${nombre}: </span>
                <span> ${mensaje} </h5>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = messageHtml;
};

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;    

    if (keyCode !== 13 || mensaje.length === 0) return;

    socket.emit('enviar-mensaje', {mensaje, uid});
    txtMensaje.value = '';
});

const main = async () => {
    await validarJWT();
};

main();

// const socket = io();
