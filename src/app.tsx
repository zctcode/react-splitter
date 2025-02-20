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
                    <h1>Basic</h1>
                    <div className="description">You can set different directions.</div>
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
                                    content: <div className="splitter-content">Left</div>
                                },
                                {
                                    content: <div className="splitter-content">Rigth</div>
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
                                    content: <div className="splitter-content">Top</div>
                                },
                                {
                                    content: <div className="splitter-content">Bottom</div>
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
            <div className="demo">
                <div className="demo-header">
                    <h1>Combination</h1>
                    <div className="description">You can use nesting to compose.</div>
                </div>
                <div className="demo-body">
                    <Splitter
                        direction="horizontal"
                        splitbar={{ size: 4 }}
                        style={{ height: 200, border: '1px solid #eee' }}
                        items={[
                            {
                                content: <div className="splitter-content">Left</div>
                            },
                            {
                                content: (
                                    <Splitter
                                        direction="vertical"
                                        splitbar={{ size: 4 }}
                                        style={{ width: '100%' }}
                                        items={[
                                            {
                                                content: (
                                                    <Splitter
                                                        splitbar={{ size: 4 }}
                                                        items={[
                                                            {
                                                                content: <div className="splitter-content">Right Top 1</div>
                                                            },
                                                            {
                                                                content: <div className="splitter-content">Right Top 2</div>
                                                            },
                                                            {
                                                                content: <div className="splitter-content">Right Top 3</div>
                                                            }
                                                        ]}
                                                    />
                                                )
                                            },
                                            {
                                                content: <div className="splitter-content">Right Bottom</div>
                                            }
                                        ]}
                                    />
                                )
                            }
                        ]}
                    />
                </div>
            </div>
            <div className="demo">
                <div className="demo-header">
                    <h1>Init Size/Min/Max</h1>
                    <div className="description">The size of each split bar is subtracted evenly by each item, So the size of each item will be a little smaller than the init size.</div>
                </div>
                <div className="demo-body">
                    <Splitter
                        direction="horizontal"
                        splitbar={{ size: 4 }}
                        style={{ height: 200, border: '1px solid #eee' }}
                        items={[{
                            size: '150px',
                            content: <div className="splitter-content">
                                init size: 150px
                            </div>
                        },
                        {
                            size: '25%',
                            min: '20%',
                            content: <div className="splitter-content">
                                init size: 25%
                                <br />
                                min: 20%
                            </div>
                        },
                        {
                            max: '50%',
                            content: <div className="splitter-content">
                                max: 50%
                            </div>
                        },
                        {
                            min: '20%',
                            max: '50%',
                            content: <div className="splitter-content">
                                min: 20%
                                <br />
                                max: 50%
                            </div>
                        }
                        ]}
                    />
                </div>
            </div>
            <div className="demo">
                <div className="demo-header">
                    <h1>Item Non-resizable</h1>
                    <div className="description">Specifies that some items are non-resizable.</div>
                </div>
                <div className="demo-body">
                    <Splitter
                        direction="horizontal"
                        splitbar={{ size: 4 }}
                        style={{ height: 200, border: '1px solid #eee' }}
                        items={[
                            {
                                content: <div className="splitter-content">resizable item</div>
                            },
                            {
                                content: <div className="splitter-content">resizable item</div>
                            },
                            {
                                size: '20%',
                                resizable: false,
                                content: <div className="splitter-content">non-resizable item</div>
                            },
                            {
                                content: <div className="splitter-content">resizable item</div>
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);