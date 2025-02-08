import * as React from 'react';
import cn from 'classnames';
import Splitbar, { SplitbarProps } from './Splitbar';

export interface SplitterItemProps {
    key?: React.Key;
    defaultSize?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
    content: React.ReactNode;
}

interface SplitterProps {
    bordered?: boolean;
    className?: string;
    style?: React.CSSProperties;
    direction?: 'horizontal' | 'vertical';
    splitbar?: Omit<SplitbarProps, 'direction' | 'onMouseDown'>;
    items: SplitterItemProps[];
    onResize?: (sizes: number[], percents: number[]) => void;
}

interface ItemSizeProps {
    px: number;
    percent: number;
    maxPx: number;
    minPx: number;
    maxPercent: number;
    minPercent: number;
}

const PX_REG = new RegExp('\\d+(px)$');
const PERCENT_REG = new RegExp('\\d+(%)$');
const NUM_REG = new RegExp('\\d+\\.?\\d*');

const Splitter: React.FC<SplitterProps> = (props) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = React.useState(false);
    const [itemSizeList, setItemSizeList] = React.useState<ItemSizeProps[]>([]);

    React.useEffect(() => {
        let noSizeCount = 0;
        let _itemSizes: ItemSizeProps[] = [];
        const barsize = (props.items.length - 1) * (props.splitbar?.size || 1);
        const wrapperSize = (props.direction === "vertical" ? (wrapperRef.current?.clientHeight || 0) : (wrapperRef.current?.clientWidth || 0)) - barsize;

        props.items.forEach((item, index) => {
            const size = calcSize(item.defaultSize || 0, wrapperSize);
            const minSize = calcSize(item.minSize || 0, wrapperSize);
            const maxSize = calcSize(item.maxSize || 0, wrapperSize);
            _itemSizes[index] = {
                px: size,
                minPx: minSize,
                maxPx: maxSize,
                percent: size / wrapperSize,
                minPercent: minSize / wrapperSize,
                maxPercent: maxSize / wrapperSize
            };

            noSizeCount += size > 0 ? 0 : 1;
        });

        const pxSum = _itemSizes.reduce((acc, cur) => acc + cur.px, 0);
        const restSize = wrapperSize - pxSum;

        _itemSizes = _itemSizes.map(item => {
            if (item.px > 0 && item.percent > 0) {
                return item;
            }

            const px = restSize / noSizeCount;

            return {
                ...item,
                px,
                percent: px / wrapperSize,
            }
        });

        setItemSizeList(_itemSizes);
        props.onResize?.(_itemSizes.map(m => m.px), _itemSizes.map(m => m.percent));
    }, [props.direction, wrapperRef.current]);

    React.useEffect(() => {
        const observer = new ResizeObserver((e) => {
            const barsize = (props.items.length - 1) * (props.splitbar?.size || 1);
            const wrapperSize = (props.direction === "vertical" ? (e[0].target?.clientHeight || 0) : (e[0].target?.clientWidth || 0)) - barsize;

            itemSizeList.forEach((item) => {
                item.px = item.percent * wrapperSize;
            });

            props.onResize?.(itemSizeList.map(m => m.px), itemSizeList.map(m => m.percent));
        });

        if (wrapperRef?.current) {
            observer.observe(wrapperRef?.current);
        }

        return () => {
            observer.disconnect();
        }
    }, [itemSizeList, props.direction, wrapperRef?.current]);

    const calcSize = React.useCallback((size: number | string, wrapperSize: number = 0) => {
        if (typeof size === 'number') {
            return Math.abs(size);
        }

        if (typeof size === 'string') {
            if (PX_REG.test(size)) {
                return Math.abs(parseFloat(size.match(NUM_REG)?.[0] || '0'));
            }

            if (PERCENT_REG.test(size)) {
                return Math.abs(parseFloat(size.match(NUM_REG)?.[0] || '0') / 100) * wrapperSize;
            }
        }

        return 0;
    }, [wrapperRef.current]);

    const getItemStyle = React.useCallback((item: SplitterItemProps, index: number) => {
        const size = `${(itemSizeList[index]?.percent || 0) * 100}%`;
        const hSize = props.direction !== 'vertical' ? size : undefined;
        const hSizeMax = props.direction !== 'vertical' ? item.maxSize : undefined;
        const hSizeMin = props.direction !== 'vertical' ? item.minSize : undefined;
        const vSize = props.direction === 'vertical' ? size : undefined;
        const vSizeMax = props.direction === 'vertical' ? item.maxSize : undefined;
        const vSizeMin = props.direction === 'vertical' ? item.minSize : undefined;

        return {
            width: hSize,
            maxWidth: hSizeMax,
            minWidth: hSizeMin,
            height: vSize,
            maxHeight: vSizeMax,
            minHeight: vSizeMin,
        };
    }, [props.direction, itemSizeList]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.persist();
        const px1 = itemSizeList[index].px;
        const px2 = itemSizeList[index + 1].px;
        const item1 = itemSizeList[index];
        const item2 = itemSizeList[index + 1];
        const barsize = (props.items.length - 1) * (props.splitbar?.size || 1);
        const wrapperSize = (props.direction === "vertical" ? (wrapperRef.current?.clientHeight || 0) : (wrapperRef.current?.clientWidth || 0)) - barsize;

        const calcFunc = (offset: number) => {
            const _px1 = px1 + offset;
            const _px2 = px2 - offset;
            const isMin1 = _px1 <= item1.minPx && item1.minPx > 0;
            const isMin2 = _px2 <= item2.minPx && item2.minPx > 0;
            const isMax1 = _px1 >= item1.maxPx && item1.maxPx > 0;
            const isMax2 = _px2 >= item2.maxPx && item2.maxPx > 0;

            if (_px1 >= 0 && _px2 >= 0 && !isMin1 && !isMin2 && !isMax1 && !isMax2) {
                item1.px = _px1;
                item1.percent = _px1 / wrapperSize;
                item2.px = _px2;
                item2.percent = _px2 / wrapperSize;
                setItemSizeList([...itemSizeList]);
                props.onResize?.(itemSizeList.map(m => m.px), itemSizeList.map(m => m.percent));
            }
        };

        const onMouseMove = (mEvent: MouseEvent) => {
            mEvent.preventDefault();
            mEvent.stopPropagation();

            if (props.direction !== 'vertical') {
                const offsetX = mEvent.clientX - e.clientX;
                calcFunc(offsetX);
            }

            if (props.direction === 'vertical') {
                const offsetY = mEvent.clientY - e.clientY;
                calcFunc(offsetY);
            }

            setIsResizing(true);
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document?.removeEventListener('mouseup', onMouseUp, false);
            document?.removeEventListener('mousemove', onMouseMove, false);
        };

        document?.addEventListener('mouseup', onMouseUp, false);
        document?.addEventListener('mousemove', onMouseMove, false);
    };

    const classes = cn('ihc-splitter-wrapper', {
        'ihc-splitter-bordered': props.bordered,
        'ihc-splitter-vertical': props.direction === 'vertical',
        'ihc-splitter-horizontal': props.direction === 'horizontal',
        'ihc-splitter-resizing': isResizing,
    }, props.className);

    return (
        <div ref={wrapperRef} className={classes} style={props.style}>
            {props.items.map((item, index) => {
                return (<React.Fragment key={`splititem_${item.key || index}`}>
                    <div
                        key={`splititem_${item.key || index}`}
                        className={cn("ihc-splitter-item")}
                        style={getItemStyle(item, index)}
                    >
                        {item.content}
                    </div>
                    {index < props.items.length - 1 && <Splitbar
                        {...props.splitbar}
                        key={`splitbar_${item.key || index}`}
                        direction={props.direction}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                    />}
                </React.Fragment>);
            })}
        </div>
    );
}

export default Splitter;