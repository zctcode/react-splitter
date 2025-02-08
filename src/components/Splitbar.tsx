import * as React from 'react';
import cn from 'classnames';

export interface SplitbarProps {
    size?: number;
    color?: string;
    direction?: 'horizontal' | 'vertical';
    onMouseDown?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const Splitbar = (props: SplitbarProps) => {
    const classes = cn('ihc-splitbar', {
        'ihc-splitbar-horizontal': props.direction !== 'vertical',
        'ihc-splitbar-vertical': props.direction === 'vertical'
    });

    const verticalSize = props.direction === 'vertical' && props.size && props.size > 0 ? props.size : undefined;
    const horizontalSize = props.direction !== 'vertical' && props.size && props.size > 0 ? props.size : undefined;

    return (
        <div
            style={{
                width: horizontalSize,
                minWidth: horizontalSize,
                height: verticalSize,
                minHeight: verticalSize,
                backgroundColor: props.color
            }}
            className={classes}
            onMouseDown={props.onMouseDown}
        />
    );
}

export default Splitbar;