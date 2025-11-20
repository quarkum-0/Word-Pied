import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    io.on('connection', socket => {
      socket.on('textChange', (data) => {
        socket.broadcast.emit('updateText', data);
      });
      socket.on('disconnect', () => {});
    });
    res.socket.server.io = io;
  } else {
    res.end();
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default SocketHandler;
