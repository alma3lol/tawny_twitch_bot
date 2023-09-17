import logo from './logo.svg';
import './App.css';
import { useTitle } from 'react-use';
import { useAppSelector } from './redux';

function App() {
  useTitle('Tawny Twitch Bot - Login');
  const isBotConnected = useAppSelector(state => state.BOT.connected);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div data-connected={`${isBotConnected}`} className="data-[connected=false]:bg-red-500 data-[connected=true]:bg-green-500 rounded-lg px-2 text-white">{`Bot connected: ${isBotConnected}`}</div>
      </header>
    </div>
  );
}

export default App;
