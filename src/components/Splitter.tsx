import * as React from 'react';
import cn from 'classnames';
import Splitbar, { SplitbarProps } from './Splitbar';

export interface SplitterItemProps {
    key?: React.Key;
    size?: number | string;
    min?: number | string;
    max?: number | string;
    resizable?: boolean;
    content: React.ReactNode;
}

export interface SplitterProps {
    className?: string;
    style?: React.CSSProperties;
    direction?: 'horizontal' | 'vertical';
    splitbar?: Omit<SplitbarProps, 'direction' | 'onMouseDown'>;
    items: SplitterItemProps[];
}

interface ItemSizeProps {
    px: number;
    percent: number;
    min: number;
    minPercent: number;
    max: number;
    maxPercent: number;
}

const PX_REG = new RegExp('\\d+(px)$');
const NUM_REG = new RegExp('\\d+\\.?\\d*');

const Splitter: React.FC<SplitterProps> = (props) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
    const itemsSizeRef = React.useRef<ItemSizeProps[]>([]);
    const [isResizing, setIsResizing] = React.useState(false);

    React.useEffect(() => {
        if (wrapperRef.current) {
            const wrapperSize = getWrapperSize();
            const sizes = props.items.map((item) => {
                return calcItemSize(item, wrapperSize);
            });
            const noSizeCount = sizes.filter(item => !item.px).length;
            const pxSum = sizes.reduce((sum, item) => sum + (item.px || 0), 0);
            const restItemSizes = distributeNumber(wrapperSize - pxSum, noSizeCount);
            const barSizeSum = (props.splitbar?.size || 1) * (sizes.length - 1);
            const minusNums = distributeNumber(barSizeSum, props.items.length);

            sizes.forEach((item, index) => {
                if (!item.px) {
                    item.px = restItemSizes.pop() || 0;
                    item.percent = item.px / wrapperSize;
                }

                itemsSizeRef.current[index] = item;
                const size = isPercent(props.items[index].size || 0) ? `calc(${item.percent * 100}% - ${minusNums[index]}px)` : `${item.px - minusNums[index]}px`;
                itemsRef.current[index]?.setAttribute('style', `flex-basis: ${size}`);
            });
        }
    }, [props.direction, props.items.length, wrapperRef.current, itemsRef.current]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.persist();
        const wrapperSize = getWrapperSize();
        const isPrevUsePercent = isPercent(props.items[index].size || 0);
        const isNextUsePercent = isPercent(props.items[index + 1].size || 0);
        const prevSize = itemsSizeRef.current[index].px;
        const nextSize = itemsSizeRef.current[index + 1].px;
        const barSizeSum = (props.splitbar?.size || 1) * (props.items.length - 1);
        const minusNums = distributeNumber(barSizeSum, props.items.length);

        const calcFunc = (offset: number) => {
            const prevItem = itemsSizeRef.current[index];
            const nextItem = itemsSizeRef.current[index + 1];
            const _prevSize = prevSize + offset;
            const _nextSize = nextSize - offset;
            const isPrevMin = _prevSize <= prevItem.min && prevItem.min > 0;
            const isNextMin = _nextSize <= nextItem.min && nextItem.min > 0;
            const isPrevMax = _prevSize >= prevItem.max && prevItem.max > 0;
            const isNextMax = _nextSize >= nextItem.max && nextItem.max > 0;

            if (_prevSize >= minusNums[index] && _nextSize >= minusNums[index + 1] && !isPrevMin && !isNextMin && !isPrevMax && !isNextMax) {
                prevItem.px = _prevSize;
                prevItem.percent = _prevSize / wrapperSize;
                nextItem.px = _nextSize;
                nextItem.percent = _nextSize / wrapperSize;
                const size1 = isPrevUsePercent ? `calc(${prevItem.percent * 100}% - ${minusNums[index]}px)` : `${prevItem.px - minusNums[index]}px`;
                const size2 = isNextUsePercent ? `calc(${nextItem.percent * 100}% - ${minusNums[index + 1]}px)` : `${nextItem.px - minusNums[index + 1]}px`;
                itemsRef.current[index]?.setAttribute('style', `flex-basis:${size1}`);
                itemsRef.current[index + 1]?.setAttribute('style', `flex-basis:${size2}`);
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
            window?.removeEventListener('mouseup', onMouseUp, false);
            window?.removeEventListener('mousemove', onMouseMove, false);
        };

        window?.addEventListener('mouseup', onMouseUp, false);
        window?.addEventListener('mousemove', onMouseMove, false);
    };

    const calcItemSize = React.useCallback((item: SplitterItemProps, wrapperSize: number) => {
        const itemSize: ItemSizeProps = {
            px: 0,
            percent: 0,
            min: 0,
            minPercent: 0,
            max: 0,
            maxPercent: 0,
        };

        const calc = (size: string | number, pxKey: keyof ItemSizeProps, percentKey: keyof ItemSizeProps) => {
            if (isPercent(size)) {
                itemSize[percentKey] = size as number;
                itemSize[pxKey] = Math.round(itemSize[percentKey] * wrapperSize);
            } else if (PX_REG.test(size?.toString() || '')) {
                const px = parseFloat(size?.toString().match(NUM_REG)?.[0] || '0');

                if (px > 0) {
                    itemSize[pxKey] = Math.round(px);
                    itemSize[percentKey] = itemSize[pxKey] / wrapperSize;
                }
            }
        };

        calc(item.size || 0, 'px', 'percent');
        calc(item.min || 0, 'min', 'minPercent');
        calc(item.max || 0, 'max', 'maxPercent');

        return itemSize;
    }, [wrapperRef.current]);

    const distributeNumber = React.useCallback((total: number, parts: number) => {
        const base = Math.floor(total / parts);
        const remainder = total % parts;
        return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
    }, []);

    const isPercent = React.useCallback((size: number | string) => {
        return typeof size === 'number' && size >= 0 && size <= 1;
    }, []);

    const getWrapperSize = React.useCallback(() => {
        return props.direction === 'vertical' ? (wrapperRef.current?.clientHeight || 0) : (wrapperRef.current?.clientWidth || 0);
    }, [props.direction, wrapperRef.current]);

    const classes = cn(`ihc-splitter-wrapper`, {
        'ihc-splitter-vertical': props.direction === 'vertical',
        'ihc-splitter-horizontal': props.direction !== 'vertical',
        'ihc-splitter-resizing': isResizing,
    }, props.className);

    return (
        <div ref={wrapperRef} className={classes} style={props.style}>
            {props.items.map((item, index) => {
                const key = `split_item_${item.key || index}`;

                return (<React.Fragment key={key}>
                    <div
                        key={key}
                        className={cn("ihc-splitter-item")}
                        ref={ref => itemsRef.current[index] = ref}
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
    )
}

export default Splitter;