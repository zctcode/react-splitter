import * as React from 'react';
import cn from 'classnames';

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
    splitbar?: SplitbarProps;
    items: SplitterItemProps[];
    onResize?: (sizes: { px: number, percent: number }[]) => void;
}

interface SplitbarProps {
    size?: number;
    color?: string;
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

function debounce<T extends (...args: any[]) => any>(func: T, wait: number = 100): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null;
    return function (...args: Parameters<T>): void {
        clearTimeout(timeout as ReturnType<typeof setTimeout>);
        //@ts-ignore
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const Splitter: React.FC<SplitterProps> = (props) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const lastWrapperSize = React.useRef({ width: 0, height: 0 });
    const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
    const direction = props.direction === 'vertical' ? 'vertical' : 'horizontal';
    const itemsSizeRef = React.useRef<ItemSizeProps[]>([]);
    const [isResizing, setIsResizing] = React.useState(false);

    React.useEffect(() => {
        initSplitbar();
    }, []);

    React.useEffect(() => {
        if (!wrapperRef.current) return;
        initItemsSize();
        lastWrapperSize.current = { width: wrapperRef.current.offsetWidth, height: wrapperRef.current.offsetHeight };

        const observer = new ResizeObserver(debounce((entries) => {
            if (!entries.length) return;
            const { offsetWidth, offsetHeight } = entries[0].target;
            const widthChanged = direction === 'horizontal' && offsetWidth !== lastWrapperSize.current.width;
            const heightChanged = direction === 'vertical' && offsetHeight !== lastWrapperSize.current.height;

            if (widthChanged || heightChanged) {
                initItemsSize();
                props.onResize?.(itemsSizeRef.current.map(({ px, percent }) => ({ px, percent })));
            }

            lastWrapperSize.current = { width: offsetWidth, height: offsetHeight };
        }));

        observer.observe(wrapperRef.current);

        return () => {
            wrapperRef.current && observer.unobserve(wrapperRef.current);
            observer.disconnect();
        }
    }, [direction, wrapperRef.current]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.persist();
        const prevIdx = props.items.findLastIndex((item, idx) => idx <= index && item.resizable !== false);
        const nextIdx = props.items.findIndex((item, idx) => idx > index && item.resizable !== false);
        if (prevIdx === -1 || nextIdx === -1) return;

        const barSizeSum = (props.splitbar?.size || 1) * (props.items.length - 1);
        const minusSizes = distributeNumber(barSizeSum, props.items.length);
        const wrapperSize = getWrapperSize();
        const prevItemSize = itemsSizeRef.current[prevIdx].px;
        const nextItemSize = itemsSizeRef.current[nextIdx].px;

        const updateItem = (size: number, idx: number) => {
            const item = itemsSizeRef.current[idx];
            item.px = size;
            item.percent = size / wrapperSize;
            const style = isPercent(props.items[idx].size || 0)
                ? `calc(${item.percent * 100}% - ${minusSizes[idx]}px)`
                : `${item.px - minusSizes[idx]}px`;
            itemsRef.current[idx]?.setAttribute('style', `flex-basis:${style}`);
        };

        const isRational = (size: number, idx: number) => {
            const item = itemsSizeRef.current[idx];
            const outMin = item.min > 0 && size <= item.min;
            const outMax = item.max > 0 && size >= item.max;
            return !outMin && !outMax && size >= minusSizes[idx];
        }

        const calcFunc = (offset: number) => {
            const prevSize = prevItemSize + offset;
            const nextSize = nextItemSize - offset;

            // 在限制范围内可以改变
            if (isRational(prevSize, prevIdx) && isRational(nextSize, nextIdx)) {
                updateItem(prevSize, prevIdx);
                updateItem(nextSize, nextIdx);
                props.onResize?.(itemsSizeRef.current.map(({ px, percent }) => ({ px, percent })));
            }
        };

        const onMouseMove = (mEvent: MouseEvent) => {
            mEvent.preventDefault();
            mEvent.stopPropagation();

            if (direction === 'horizontal') {
                const offsetX = mEvent.clientX - e.clientX;
                calcFunc(offsetX);
            }

            if (direction === 'vertical') {
                const offsetY = mEvent.clientY - e.clientY;
                calcFunc(offsetY);
            }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window?.removeEventListener('mouseup', onMouseUp, false);
            window?.removeEventListener('mousemove', onMouseMove, false);
        };

        setIsResizing(true);
        window?.addEventListener('mouseup', onMouseUp, false);
        window?.addEventListener('mousemove', onMouseMove, false);
    };

    const initSplitbar = () => {
        if ((props.splitbar?.size || 0) > 0) {
            wrapperRef.current?.style.setProperty('--ihc-splitter-size', `${props.splitbar?.size}px`);
        }

        if (props.splitbar?.color) {
            wrapperRef.current?.style.setProperty('--ihc-splitter-color', `${props.splitbar.color}`);
        }
    }

    const initItemsSize = () => {
        const barSizeSum = (props.splitbar?.size || 1) * (props.items.length - 1);
        const minusSizes = distributeNumber(barSizeSum, props.items.length)
        const wrapperSize = getWrapperSize();

        const sizes = props.items.map((item) => {
            return calcItemInitSize(item, wrapperSize);
        });
        const noSizeCount = sizes.filter(item => !item.px).length;
        const pxSum = sizes.reduce((sum, item) => sum + (item.px || 0), 0);
        // 未指定尺寸的item均分剩余空间
        const restItemSizes = distributeNumber(wrapperSize - pxSum, noSizeCount);

        sizes.forEach((item, index) => {
            if (!item.px) {
                item.px = restItemSizes.shift() || 0;
                item.percent = item.px / wrapperSize;
            }

            itemsSizeRef.current[index] = item;
            const style = isPercent(props.items[index].size || 0)
                ? `calc(${item.percent * 100}% - ${minusSizes[index]}px)`
                : `${item.px - minusSizes[index]}px`;
            itemsRef.current[index]?.setAttribute('style', `flex-basis: ${style}`);
        });
    }

    /** 计算每个面板设置的大小范围 */
    const calcItemInitSize = React.useCallback((item: SplitterItemProps, wrapperSize: number) => {
        const itemSize: ItemSizeProps = {
            px: 0,
            percent: 0,
            min: 0,
            minPercent: 0,
            max: 0,
            maxPercent: 0,
        };

        const calcFunc = (size: string | number, pxKey: keyof ItemSizeProps, percentKey: keyof ItemSizeProps) => {
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

        calcFunc(item.size || 0, 'px', 'percent');
        calcFunc(item.min || 0, 'min', 'minPercent');
        calcFunc(item.max || 0, 'max', 'maxPercent');

        return itemSize;
    }, [wrapperRef.current]);

    const distributeNumber = React.useCallback((total: number, parts: number) => {
        const base = Math.floor(total / parts);
        const remainder = total % parts;
        return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
    }, []);

    const isPercent = (size: number | string) => {
        return typeof size === 'number' && size >= 0 && size <= 1;
    };

    const getWrapperSize = () => {
        return direction === 'vertical' ? (wrapperRef.current?.offsetHeight || 0) : (wrapperRef.current?.offsetWidth || 0);
    };

    const getSplitbarCls = (index: number) => {
        let disabled = props.items.slice(0, index + 1).filter(item => item.resizable !== false).length === 0;
        disabled = disabled || props.items.slice(index + 1).filter(item => item.resizable !== false).length === 0;

        return cn('ihc-splitbar', {
            'ihc-splitbar-disabled': disabled
        });
    };

    const classes = React.useMemo(() => {
        return cn('ihc-splitter-wrapper', `ihc-splitter-${direction}`, {
            'ihc-splitter-resizing': isResizing,
        }, props.className);
    }, [direction, props.className, isResizing]);

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
                    {index < props.items.length - 1 && <div
                        className={getSplitbarCls(index)}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                    />}
                </React.Fragment>);
            })}
        </div>
    )
}

export default Splitter;