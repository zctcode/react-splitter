import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Splitter from './components';
import Splitter1 from './components/Splitter';
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

function App() {
    const [sizes, setSizes] = useState<number[]>([]);
    const [percents, setPercents] = useState<number[]>([]);
    const [subSizes, setSubSizes] = useState<number[]>([]);
    const [subPercents, setSubPercents] = useState<number[]>([]);

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

            <Splitter1
                splitbar={{ size: 5 }}
                // direction="vertical"
                // onResize={(sizes, percents) => {
                //     setSizes(sizes);
                //     setPercents(percents);
                // }}
                items={[{
                    // size: '230px',
                    content: '22'
                    // content: <Splitter1
                    //     splitbar={{ size: 4 }}
                    //     // onResize={(sizes, percents) => {
                    //     //     setSubSizes(sizes);
                    //     //     setSubPercents(percents);
                    //     // }}
                    //     items={[
                    //         {
                    //             size: 0.25,
                    //             min: 0.5,
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
                    // size: '200px',
                    // min: '100px',
                    // max: '300px',
                    content: <Panel wSize={subSizes.reduce((prev, curr) => prev + curr, 0)} wPercent={1} hSize={sizes[1] || 0} hPercent={percents[1] || 0} />
                }, {
                    // size: '100px',
                    content: 'mmm'
                }, {
                    // size: '100px',
                    content: 'mmm'
                }]}
            />
        </div>
    );
}

const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);