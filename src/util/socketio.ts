import io from 'socket.io-client';

export const sio = io(`${process.env.REACT_APP_SOCKET_URL}`, { transports: ['websocket'] });