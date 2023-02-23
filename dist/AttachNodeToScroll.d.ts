import { Behavior } from '@babylonjs/core/Behaviors/behavior';
import { Node } from '@babylonjs/core/node';
export interface AttachNodeToScrollOptions {
    readonly scrollDirection?: 'vertical' | 'horizontal';
    readonly scrollElement?: HTMLElement | Document;
    readonly onBeforeUpdate?: (progress: number) => number;
}
export declare class AttachNodeToScroll implements Behavior<Node> {
    readonly name = "AttachNodeToScroll";
    private target;
    private readonly scrollElement;
    private readonly scrollDirection;
    private readonly onBeforeUpdate;
    private animationGroups?;
    private currentProgress?;
    constructor(options?: AttachNodeToScrollOptions);
    init(): void;
    attach(target: Node): void;
    detach(): void;
    private updateTargetPosition;
}
