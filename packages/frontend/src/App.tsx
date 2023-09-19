import "./App.css";
import { useTitle } from "react-use";
import { FormEvent, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import {
  useAppDispatch,
  useAppSelector,
  BOT_JOINED,
  BOT_LEFT,
  BOT_MOD,
  CHAT_MESSAGE,
  TOGGLE_BOT_CONNECTED,
  USER_JOINED,
  USER_LEFT,
  SET_SUBMITTING,
  SET_INFO,
} from "./redux";
import { ChatUserstate } from "tmi.js";
import { ChannelComponent } from "./components";
import {
  Button,
  DarkThemeToggle,
  Flowbite,
  Label,
  Modal,
  Spinner,
  TextInput,
} from "flowbite-react";
import { FaCrown, FaTwitch } from "react-icons/fa6";
import { useSnackbar } from "notistack";

function App() {
  useTitle("Tawny Twitch Bot");
  const dispatch = useAppDispatch();
  const isBotConnected = useAppSelector((state) => state.BOT.connected);
  const channels = useAppSelector((state) => state.CHANNELS);
  const { success: isSuccess, successMessage, error: isError, errorMessage, info: isInfo, infoMessage, submitting: isSubmitting } = useAppSelector((state) => state.APP);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    const client = io(`ws://localhost:4000/`);
    client.on("isBotConnected", (connected) => {
      dispatch(SET_INFO(`Bot ${ connected ? 'connected': 'disconnected' }`));
      dispatch(TOGGLE_BOT_CONNECTED(connected));
    });
    client.on(
      "chat",
      ({
        channel,
        message,
        user,
      }: {
        channel: string;
        message: string;
        user: ChatUserstate;
      }) => {
        dispatch(CHAT_MESSAGE({ channel, user, message }));
      }
    );
    client.on("USER_JOINED", ({ channel, username }) => {
      dispatch(USER_JOINED([channel, username]));
    });
    client.on("USER_LEFT", ({ channel, username }) => {
      dispatch(USER_LEFT([channel, username]));
    });
    client.on("BOT_JOINED", (channel) => {
      dispatch(SET_INFO(`Bot joined channel ${channel}`));
      dispatch(BOT_JOINED(channel));
      if (chosenChannel === "") setChosenChannel(channel);
    });
    client.on("BOT_LEFT", (channel) => {
      dispatch(SET_INFO(`Bot left channel ${channel}`));
      dispatch(BOT_LEFT(channel));
      if (chosenChannel === channel) setChosenChannel("");
    });
    client.on("BOT_MOD", (channel: string, mod: boolean) => {
      dispatch(BOT_MOD([channel, mod]));
    });
    client.on("disconnect", () => {
      dispatch(SET_INFO(`Bot disconnected`));
      channels.forEach((channel) => {
        dispatch(BOT_LEFT(channel.channel));
      });
    });
    setSocket(client);
  }, []);
  useEffect(() => {
    if (socket === null) return;
    if (!isBotConnected) {
      const interval = setInterval(() => {
        socket.emit("isBotConnected");
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isBotConnected, socket]);
  useEffect(() => {
    if (!isSuccess) return;
    enqueueSnackbar({ message: successMessage, variant: "success" });
  }, [isSuccess, successMessage]);
  useEffect(() => {
    if (!isError) return;
    enqueueSnackbar({ message: errorMessage, variant: "error" });
  }, [isError, errorMessage]);
  useEffect(() => {
    if (!isInfo) return;
    enqueueSnackbar({ message: infoMessage, variant: "info" });
  }, [isInfo, infoMessage]);
  const [showJoinChannel, setShowJoinChannel] = useState(false);
  const [channelInput, setChannelInput] = useState("");
  const [channelInputValid, setChannelInputValid] = useState(true);
  const handleOnJoinAnotherRoomClose = () => {
    setShowJoinChannel(false);
    setChannelInput("");
  };
  const handleOnJoinAnotherRoom = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!channelInputValid) return;
    if (socket === null) return;
    dispatch(SET_SUBMITTING(true));
    socket
      .emitWithAck("cmd", { cmd: "join", args: [channelInput] })
      .then((joined: boolean) => {
        dispatch(SET_SUBMITTING(false));
        setChannelInputValid(joined);
        if (!joined) return;
        handleOnJoinAnotherRoomClose();
      });
  };
  useEffect(() => {
    setChannelInputValid(/^\S*$/.test(channelInput));
  }, [channelInput]);
  const [chosenChannel, setChosenChannel] = useState("");
  return (
    <div className="dark:bg-gray-900 h-full flex flex-col gap-2 p-2 relative overflow-hidden">
      <Flowbite>
        <div className="flex gap-2">
          <DarkThemeToggle />
          <div
            data-connected={`${isBotConnected}`}
            className="text-center data-[connected=false]:bg-red-500 data-[connected=true]:bg-green-500 rounded-lg py-2 px-4 text-white"
          >{`Bot ${isBotConnected ? "connected" : "disconnected"}`}</div>
          {!isBotConnected ? (
            <a
              href="http://localhost:4000/"
              className="bg-purple-500 text-white rounded-lg px-4 py-2"
            >
              Connect to Twitch
            </a>
          ) : (
            <div className="flex gap-2 grow">
              <div className="dark:text-white py-2 px-4 font-bold grow">{`Channels joined: ${
                channels.filter((ch) => ch.joined).length
              }`}</div>
              <Button
                onClick={() => setShowJoinChannel(true)}
                gradientDuoTone="pinkToOrange"
              >
                Join another channel...
              </Button>
            </div>
          )}
        </div>
        {isBotConnected && socket && (
          <div className="flex flex-col gap-2 h-full w-full">
            <div className="flex gap-2 py-2 flex-wrap">
              {channels
                .filter((channel) => channel.joined)
                .map((channel) => (
                  <Button
                    key={channel.channel}
                    color="purple"
                    disabled={channel.channel === chosenChannel}
                    onClick={() => setChosenChannel(channel.channel)}
                  >
                    <FaTwitch className="my-auto mr-2" /> {channel.channel}{" "}
                    {channel.mod && (
                      <FaCrown color="orange" className="my-auto ml-2" />
                    )}
                  </Button>
                ))}
            </div>
            <div className="grow flex h-full">
              {channels.map((channel) => (
                <ChannelComponent
                  key={channel.channel}
                  socket={socket}
                  chosen={channel.channel === chosenChannel}
                  {...channel}
                />
              ))}
            </div>
          </div>
        )}
        <Modal
          dismissible
          show={showJoinChannel}
          onClose={handleOnJoinAnotherRoomClose}
        >
          <Modal.Header>Join another room...</Modal.Header>
          <Modal.Body>
            <form
              onSubmit={handleOnJoinAnotherRoom}
              className="flex flex-col gap-4"
            >
              <div className="mb-2 block">
                <div className="mb-2 block">
                  <Label
                    htmlFor="channel"
                    className="font-bold text-lg"
                    value="Channel name"
                  />
                </div>
                <TextInput
                  id="channel"
                  color={channelInputValid ? "gray" : "failure"}
                  required
                  type="text"
                  onChange={(e) => setChannelInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  gradientDuoTone="pinkToOrange"
                >
                  {isSubmitting ? <Spinner /> : "Join"}
                </Button>
                <Button
                  color="gray"
                  disabled={isSubmitting}
                  onClick={handleOnJoinAnotherRoomClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </Flowbite>
    </div>
  );
}

export default App;
