import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Splitter from './components';
import './components/style.css';
import './index.scss';

interface PanelProps {
    wSize: number;
    wPercent: number;
    hSize: number;
    hPercent: number;
}

const Panel = (props: PanelProps) => {
    useEffect(() => {
        console.log('Panel render');
    }, [])
    return (
        <div className="splitter-content">
            <div>
                {`Width： ${props.wSize}px （${(props.wPercent * 100).toFixed(2)}%）`}
                <br />
                {`Height：${props.hSize}px （${(props.hPercent * 100).toFixed(2)}%）`}
            </div>
        </div>
    );
};

const T = () => {
    useEffect(() => {
        console.log('render');
    }, [])
    return Array.from({ length: 100 }).map((_, index) => (
        <div key={index}>
            {Array.from({ length: 10 }).map((__, index2) => <span style={{ display: 'inline-block', width: 100, height: 50 }} key={`${index}_${index2}`}>{`${index}_${index2}`}</span>)}
        </div>
    ));
};

const N = React.memo(T);

function App() {
    const [sizes, setSizes] = useState<{ px: number, percent: number }[]>([]);
    const [subSizes, setSubSizes] = useState<{ px: number, percent: number }[]>([]);
    const [change, setChange] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setChange(true);
        }, 3000)
    }, [])

    return (
        <div className="container">
            <Splitter
                splitbar={{ size: 5 }}
                direction="vertical"
                onResize={(sizes) => {
                    setSizes(sizes);
                }}
                items={[{
                    size: '230px',
                    // content: '22',
                    resizable: false,
                    content: <Splitter
                        splitbar={{ size: 4 }}
                        onResize={(sizes) => {
                            setSubSizes(sizes);
                        }}
                        items={[
                            {
                                size: '200px',
                                // max: 0.5,
                                content: <N />
                            },
                            {
                                content: 'mm'
                            },
                            {
                                content: <Panel wSize={subSizes[2]?.px || 0} wPercent={subSizes[2]?.percent || 0} hSize={sizes[0]?.px || 0} hPercent={sizes[0]?.percent || 0} />
                            }
                        ].concat(change ? [{
                            content: <div>ddd</div>
                        }] : [])}
                    />,
                }, {
                    size: '200px',
                    // min: '100px',
                    // max: '300px',
                    content: 'aaa',
                    // resizable: false
                }, {
                    // size: sizes[0] || 0,
                    // min: '100px',
                    // max: '300px',
                    content: 'bbb',
                    // resizable: false
                }, {
                    // size: sizes[0] || 0,
                    // min: '100px',
                    // max: '300px',
                    content: 'ccc',
                    resizable: false
                }, {
                    // size: sizes[0] || 0,
                    // min: '100px',
                    // max: '300px',
                    content: 'ddd',
                    // resizable: false
                }].slice(0, change ? 4 : 5)}
            />
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);