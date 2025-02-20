import * as React from 'react';
import cn from 'classnames';

export interface SplitterItemProps {
    key?: React.Key;
    min?: number | string;
    max?: number | string;
    size?: number | string;
    resizable?: boolean;
    content: React.ReactNode;
}

export interface SplitterProps {
    className?: string;
    style?: React.CSSProperties;
    resizable?: boolean;
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

/** 防抖函数 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number = 100): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null;
    return function (...args: Parameters<T>): void {
        clearTimeout(timeout as ReturnType<typeof setTimeout>);
        //@ts-ignore
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/** 分配数字
 * @param total 总数
 * @param parts 分成几份
 */
function distributeNumber(total: number, parts: number): number[] {
    const base = Math.floor(total / parts);
    const remainder = total % parts;
    return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}

function isPX(value?: string | number): boolean {
    if (!value) return false;
    if (typeof value === 'number') return value >= 0;
    const reg = new RegExp('^\\d+(\\.\\d+)?px$', 'i');
    return reg.test(value);
};

function isPercent(value?: string | number): boolean {
    if (!value) return false;
    if (typeof value === 'number') return false;
    const reg = new RegExp('^\\d+(\\.\\d+)?%$', 'i');
    return reg.test(value);
};

function getNumber(value?: string | number): number {
    const reg = new RegExp('\\d+(\\.\\d+)?', 'g');
    return typeof value === 'number' ? value : parseFloat(value?.toString().match(reg)?.[0] || '0');
}

const Splitter: React.FC<SplitterProps> = (props) => {
    const rafId = React.useRef<number | null>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const lastWrapperSize = React.useRef({ width: 0, height: 0 });
    const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
    const itemsSizeRef = React.useRef<ItemSizeProps[]>([]);
    const direction = props.direction === 'vertical' ? 'vertical' : 'horizontal';
    const [isResizing, setIsResizing] = React.useState(false);

    React.useEffect(() => {
        initSplitbar();
    }, [])

    React.useEffect(() => {
        if (!wrapperRef.current) return;
        initItemsSize();
        lastWrapperSize.current = { width: wrapperRef.current.offsetWidth, height: wrapperRef.current.offsetHeight };

        const observer = new ResizeObserver(debounce((entries) => {
            if (!entries.length) return;

            if (lastWrapperSize.current.width === 0 || lastWrapperSize.current.height === 0) {
                initItemsSize();
                return;
            }
            const { offsetWidth, offsetHeight } = entries[0].target;
            const widthChanged = direction === 'horizontal' && offsetWidth !== lastWrapperSize.current.width;
            const heightChanged = direction === 'vertical' && offsetHeight !== lastWrapperSize.current.height;

            if (widthChanged || heightChanged) {
                onWrapperResize();
            }

            lastWrapperSize.current = { width: offsetWidth, height: offsetHeight };
        }));

        observer.observe(wrapperRef.current);

        return () => {
            observer.disconnect();
        }
    }, [direction, props.items.length, wrapperRef.current])

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.persist();
        if (props.resizable === false) return;
        const prevIdx = props.items.findLastIndex((item, idx) => idx <= index && item.resizable !== false);
        const nextIdx = props.items.findIndex((item, idx) => idx > index && item.resizable !== false);
        if (prevIdx === -1 || nextIdx === -1) return;

        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
        }

        const minusSizes = getMinusSizes();
        const wrapperSize = getWrapperSize();
        const prevItemSize = itemsSizeRef.current[prevIdx].px;
        const nextItemSize = itemsSizeRef.current[nextIdx].px;

        const updateItem = (size: number, idx: number) => {
            const item = itemsSizeRef.current[idx];
            item.px = size;
            item.percent = size / wrapperSize;
            const style = isPX(props.items[idx].size || '')
                ? `${item.px - minusSizes[idx]}px`
                : `calc(${item.percent * 100}% - ${minusSizes[idx]}px)`;
            itemsRef.current[idx]?.setAttribute('style', `flex-basis:${style}`);
        };

        const isCoverage = (size: number, idx: number) => {
            const item = itemsSizeRef.current[idx];
            const outMin = item.min > 0 && size <= item.min;
            const outMax = item.max > 0 && size >= item.max;
            return !outMin && !outMax && size >= minusSizes[idx];
        }

        const calcFunc = (offset: number) => {
            const prevSize = prevItemSize + offset;
            const nextSize = nextItemSize - offset;

            // 在限制范围内可以改变
            if (isCoverage(prevSize, prevIdx) && isCoverage(nextSize, nextIdx)) {
                updateItem(prevSize, prevIdx);
                updateItem(nextSize, nextIdx);
                props.onResize?.(itemsSizeRef.current.map(({ px, percent }) => ({ px, percent })));
            }
        };

        const onMouseMove = (mEvent: MouseEvent) => {
            mEvent.preventDefault();
            mEvent.stopPropagation();

            rafId.current = requestAnimationFrame(() => {
                if (direction === 'horizontal') {
                    const offsetX = mEvent.clientX - e.clientX;
                    calcFunc(offsetX);
                }

                if (direction === 'vertical') {
                    const offsetY = mEvent.clientY - e.clientY;
                    calcFunc(offsetY);
                }
            });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window?.removeEventListener('mouseup', onMouseUp, false);
            window?.removeEventListener('mousemove', onMouseMove, false);
        };

        setIsResizing(true);
        window?.addEventListener('mouseup', onMouseUp, false);
        window?.addEventListener('mousemove', onMouseMove, false);
    }

    const onWrapperResize = () => {
        const minusSizes = getMinusSizes();
        const wrapperSize = getWrapperSize();
        const percentItem = props.items.map((item, index) => ({ ...item, index })).filter(item => !isPX(item.size));
        const percentItemIndexs = percentItem.map((item) => item.index);
        const pxSum = itemsSizeRef.current.filter((_, index) => !percentItemIndexs.includes(index)).reduce((sum, item) => sum + item.px, 0);
        const percentSum = itemsSizeRef.current.filter((_, index) => percentItemIndexs.includes(index)).reduce((sum, item) => sum + item.percent, 0);
        const restWrapperSize = wrapperSize - pxSum;

        itemsSizeRef.current.forEach((size, index) => {
            const item = props.items[index];

            if (!isPX(item.size)) {
                size.percent = (size.percent / percentSum) * (restWrapperSize / wrapperSize);
                size.px = Math.round(size.percent * wrapperSize);
                const style = `calc(${size.percent * 100}% - ${minusSizes[index]}px)`;
                itemsRef.current[index]?.setAttribute('style', `flex-basis: ${style}`);
            }
        });

        props.onResize?.(itemsSizeRef.current.map(({ px, percent }) => ({ px, percent })));
    }

    const initSplitbar = () => {
        if ((props.splitbar?.size || 0) > 0) {
            wrapperRef.current?.style.setProperty('--ihc-splitter-size', `${props.splitbar?.size}px`);
        }

        if (props.splitbar?.color) {
            wrapperRef.current?.style.setProperty('--ihc-splitter-color', `${props.splitbar.color}`);
        }
    }

    const initItemsSize = () => {
        const minusSizes = getMinusSizes();
        const wrapperSize = getWrapperSize();

        if (!wrapperSize) return;

        const sizes = props.items.map((item) => {
            return calcItemInitSize(item, wrapperSize);
        });
        const unsetCount = sizes.filter(item => !item.px).length;
        const pxSum = sizes.reduce((sum, item) => sum + item.px, 0);
        // 未指定尺寸的item均分剩余空间
        const restItemSizes = distributeNumber(wrapperSize - pxSum, unsetCount);

        sizes.forEach((item, index) => {
            if (!item.px) {
                item.px = restItemSizes.shift() || 0;
                item.percent = item.px / wrapperSize;
            }

            itemsSizeRef.current[index] = item;
            const style = isPX(props.items[index].size)
                ? `${item.px - minusSizes[index]}px`
                : `calc(${item.percent * 100}% - ${minusSizes[index]}px)`;
            itemsRef.current[index]?.setAttribute('style', `flex-basis: ${style}`);
        });

        props.onResize?.(sizes.map(({ px, percent }) => ({ px, percent })));
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

        const calcFunc = (pxKey: keyof ItemSizeProps, percentKey: keyof ItemSizeProps, size?: string | number) => {
            if (isPercent(size)) {
                itemSize[percentKey] = getNumber(size) / 100;
                itemSize[pxKey] = Math.round(itemSize[percentKey] * wrapperSize);
            }

            if (isPX(size)) {
                const px = getNumber(size);

                if (px > 0) {
                    itemSize[pxKey] = Math.round(px);
                    itemSize[percentKey] = itemSize[pxKey] / wrapperSize;
                }
            }
        };

        calcFunc('px', 'percent', item.size);
        calcFunc('min', 'minPercent', item.min);
        calcFunc('max', 'maxPercent', item.max);

        return itemSize;
    }, [wrapperRef.current])

    const getWrapperSize = () => {
        return direction === 'vertical' ? (wrapperRef.current?.offsetHeight || 0) : (wrapperRef.current?.offsetWidth || 0);
    }

    const getMinusSizes = () => {
        const barSizeSum = (props.splitbar?.size || 1) * (props.items.length - 1);
        return distributeNumber(barSizeSum, props.items.length);
    }

    const getSplitbarCls = (index: number) => {
        let disabled = props.items.slice(0, index + 1).filter(item => item.resizable !== false).length === 0;
        disabled = disabled || props.items.slice(index + 1).filter(item => item.resizable !== false).length === 0;

        return cn('ihc-splitbar', {
            'ihc-splitbar-disabled': disabled
        });
    }

    const classes = React.useMemo(() => {
        return cn('ihc-splitter-wrapper', `ihc-splitter-${direction}`, {
            'ihc-splitter-resizing': isResizing,
            'ihc-splitter-nonresizable': props.resizable === false,
        }, props.className);
    }, [direction, props.className, props.resizable, isResizing])

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
                        key={`splitbar_${index}`}
                        className={getSplitbarCls(index)}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                    />}
                </React.Fragment>);
            })}
        </div>
    )
}

export default Splitter;