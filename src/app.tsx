import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import './components/style.scss';

function App() {
    return (
        <div className="container">
            
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);