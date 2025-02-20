import React from 'react';
import { createRoot } from 'react-dom/client';
import Splitter from './components';
import './components/style.css';
import './index.css';

function App() {
    return (
        <div className="container">
            <div className="demo basic">
                <div className="demo-header">
                    <h2>Basic</h2>
                    <div className="description">描述</div>
                </div>
                <div className="demo-body">
                    <div className="basic-demo">
                        <h4>Horizontal</h4>
                        <Splitter
                            direction="horizontal"
                            splitbar={{ size: 4 }}
                            style={{ height: 200, border: '1px solid #eee' }}
                            items={[
                                {
                                    content: <div className="splitter-content">Left Pane</div>
                                },
                                {
                                    content: <div className="splitter-content">Rigth Pane</div>
                                }
                            ]}
                        />
                    </div>
                    <div className="basic-demo">
                        <h4>Vertical</h4>
                        <Splitter
                            direction="vertical"
                            splitbar={{ size: 4 }}
                            style={{ height: 200, border: '1px solid #eee' }}
                            items={[
                                {
                                    content: <div className="splitter-content">Top Pane</div>
                                },
                                {
                                    content: <div className="splitter-content">Bottom Pane</div>
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);