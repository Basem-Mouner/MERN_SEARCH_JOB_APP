import { socketConnections } from "../../../../DB/model/user.model.js";
import { authenticationSocket } from "../../../../middleWare/auth.socket.middleware.js";

export const registerSocket = async (socket) => {
  const { data } = await authenticationSocket({ socket });
  if (!data.valid) {
    return socket.emit("socketErrorResponse", data);
  }

  socketConnections.set(data.user._id.toString(), socket.id);
  console.log(socketConnections);

  return "Done";
};

export const logoutSocket = async (socket) => {
  return socket.on("disconnect", async () => {
    console.log("Disconnected");

    const { data } = await authenticationSocket({ socket });
    if (!data.valid) {
      return socket.emit("socketErrorResponse", data);
    }

    socketConnections.delete(data.user._id.toString());
    console.log(socketConnections);

    return "Done";
  });
};
