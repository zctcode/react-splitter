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
}

export interface SplitbarProps {
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
            // 未指定尺寸的item均分剩余空间
            const restItemSizes = distributeNumber(wrapperSize - pxSum, noSizeCount);
            const minusNums = getMinusSizes();

            sizes.forEach((item, index) => {
                if (!item.px) {
                    item.px = restItemSizes.pop() || 0;
                    item.percent = item.px / wrapperSize;
                }

                itemsSizeRef.current[index] = item;
                const style = isPercent(props.items[index].size || 0) ? `calc(${item.percent * 100}% - ${minusNums[index]}px)` : `${item.px - minusNums[index]}px`;
                itemsRef.current[index]?.setAttribute('style', `flex-basis: ${style}`);
            });

            if ((props.splitbar?.size || 0) > 0) {
                wrapperRef.current?.style.setProperty('--ihc-splitter-size', `${props.splitbar?.size}px`);
            }

            if (props.splitbar?.color) {
                wrapperRef.current?.style.setProperty('--ihc-splitter-color', `${props.splitbar.color}`);
            }
        }
    }, [props.direction, props.items.length, wrapperRef.current, itemsRef.current.length]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.persist();
        const prevIdx = props.items.findLastIndex((item, idx) => idx <= index && item.resizable !== false);
        const nextIdx = props.items.findIndex((item, idx) => idx > index && item.resizable !== false);
        if (prevIdx === -1 || nextIdx === -1) return;

        const minusNums = getMinusSizes();
        const wrapperSize = getWrapperSize();
        const prevSize = itemsSizeRef.current[prevIdx].px;
        const nextSize = itemsSizeRef.current[nextIdx].px;

        const updateItem = (item: ItemSizeProps, size: number, percent: number, idx: number) => {
            item.px = size;
            item.percent = percent;
            const style = isPercent(props.items[idx].size || 0) ? `calc(${percent * 100}% - ${minusNums[idx]}px)` : `${size - minusNums[idx]}px`;
            itemsRef.current[idx]?.setAttribute('style', `flex-basis:${style}`);
        };

        const calcFunc = (offset: number) => {
            const prevItem = itemsSizeRef.current[prevIdx];
            const nextItem = itemsSizeRef.current[nextIdx];
            const _prevSize = prevSize + offset;
            const _nextSize = nextSize - offset;
            const isPrevMin = _prevSize <= prevItem.min && prevItem.min > 0;
            const isNextMin = _nextSize <= nextItem.min && nextItem.min > 0;
            const isPrevMax = _prevSize >= prevItem.max && prevItem.max > 0;
            const isNextMax = _nextSize >= nextItem.max && nextItem.max > 0;

            // 在限制范围内可以改变
            if (_prevSize >= minusNums[prevIdx] && _nextSize >= minusNums[nextIdx] && !isPrevMin && !isNextMin && !isPrevMax && !isNextMax) {
                updateItem(prevItem, _prevSize, _prevSize / wrapperSize, prevIdx);
                updateItem(nextItem, _nextSize, _nextSize / wrapperSize, nextIdx);
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

    /** 计算每个面板设置的大小范围 */
    const calcItemSize = React.useCallback((item: SplitterItemProps, wrapperSize: number) => {
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

    const getMinusSizes = React.useCallback(() => {
        // 分割条占用的空间
        const barSizeSum = (props.splitbar?.size || 1) * (props.items.length - 1);
        // 分割条占用的空间平均分配到每个面板的空间上
        const nums = distributeNumber(barSizeSum, props.items.length);
        return nums;
    }, [props.splitbar?.size, props.items.length]);

    const distributeNumber = React.useCallback((total: number, parts: number) => {
        const base = Math.floor(total / parts);
        const remainder = total % parts;
        return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
    }, []);

    const isPercent = React.useCallback((size: number | string) => {
        return typeof size === 'number' && size >= 0 && size <= 1;
    }, []);

    const getWrapperSize = React.useCallback(() => {
        return props.direction === 'vertical' ? (wrapperRef.current?.offsetHeight || 0) : (wrapperRef.current?.offsetWidth || 0);
    }, [props.direction, wrapperRef.current]);

    const getSplitbarCls = (index: number) => {
        let disabled = props.items.slice(0, index + 1).filter(item => item.resizable !== false).length === 0;
        disabled = disabled || props.items.slice(index + 1).filter(item => item.resizable !== false).length === 0;

        return cn('ihc-splitbar', {
            'ihc-splitbar-horizontal': props.direction !== 'vertical',
            'ihc-splitbar-vertical': props.direction === 'vertical',
            'ihc-splitbar-disabled': disabled
        });
    };

    const classes = React.useMemo(() => {
        return cn(`ihc-splitter-wrapper`, {
            'ihc-splitter-vertical': props.direction === 'vertical',
            'ihc-splitter-horizontal': props.direction !== 'vertical',
            'ihc-splitter-resizing': isResizing,
        }, props.className);
    }, [props.direction, props.className, isResizing]);

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