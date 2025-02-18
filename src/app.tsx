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
    return (
        <div className="splitter-content">
            <div>
                {`Width： ${props.wSize?.toFixed(1)}px （${(props.wPercent * 100).toFixed(2)}%）`}
                <br />
                {`Height：${props.hSize?.toFixed(1)}px （${(props.hPercent * 100).toFixed(2)}%）`}
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
    const [sizes, setSizes] = useState<number[]>([]);
    const [percents, setPercents] = useState<number[]>([]);
    const [subSizes, setSubSizes] = useState<number[]>([]);
    const [subPercents, setSubPercents] = useState<number[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setSizes([0.2]);
        }, 2 * 1000)
    }, [])

    return (
        <div className="container">
            {/* <Splitter
                splitbar={{ size: 4 }}
                direction="vertical"
                onResize={(sizes, percents) => {
                    setSizes(sizes);
                    setPercents(percents);
                }}
                items={[{
                    minSize: 230,
                    content: <Splitter
                        splitbar={{ size: 4 }}
                        onResize={(sizes, percents) => {
                            setSubSizes(sizes);
                            setSubPercents(percents);
                        }}
                        items={[
                            {
                                defaultSize: '25%',
                                minSize: 230,
                                content: <Panel wSize={subSizes[0] || 0} wPercent={subPercents[0] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                            },
                            {
                                minSize: 230,
                                content: <Panel wSize={subSizes[1] || 0} wPercent={subPercents[1] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                            },
                            {
                                defaultSize: '25%',
                                minSize: 230,
                                content: <Panel wSize={subSizes[2] || 0} wPercent={subPercents[2] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                            }
                        ]}
                    />,
                }, {
                    defaultSize: '30%',
                    minSize: 230,
                    content: <Panel wSize={subSizes.reduce((prev, curr) => prev + curr, 0)} wPercent={1} hSize={sizes[1] || 0} hPercent={percents[1] || 0} />
                }]}
            /> */}

            <Splitter
                splitbar={{ size: 5, color: 'green' }}
                direction="vertical"
                // onResize={(sizes, percents) => {
                //     setSizes(sizes);
                //     setPercents(percents);
                // }}
                items={[{
                    // size: '230px',
                    content: '22',
                    // content: <Splitter
                    //     splitbar={{ size: 4 }}
                    //     // onResize={(sizes, percents) => {
                    //     //     setSubSizes(sizes);
                    //     //     setSubPercents(percents);
                    //     // }}
                    //     items={[
                    //         {
                    //             size: 0.25,
                    //             // max: 0.5,
                    //             content: <Panel wSize={subSizes[0] || 0} wPercent={subPercents[0] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                    //         },
                    //         {
                    //             content: <Panel wSize={subSizes[1] || 0} wPercent={subPercents[1] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                    //         },
                    //         {
                    //             content: <Panel wSize={subSizes[2] || 0} wPercent={subPercents[2] || 0} hSize={sizes[0] || 0} hPercent={percents[0] || 0} />
                    //         }
                    //     ]}
                    // />,
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
                    // resizable: false
                }]}
            />
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);