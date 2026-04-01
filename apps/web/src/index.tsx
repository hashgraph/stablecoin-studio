/* istanbul ignore file */
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';

// This next line will fix the Error: setImmediate is not defined
window.setImmediate = window.setTimeout as unknown as typeof setImmediate;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
