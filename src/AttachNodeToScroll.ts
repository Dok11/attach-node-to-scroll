import { AnimationGroup } from '@babylonjs/core';
import { Behavior } from '@babylonjs/core/Behaviors/behavior';
import { Node } from '@babylonjs/core/node';
import { Nullable } from '@babylonjs/core/types';


export interface AttachNodeToScrollOptions {
  readonly scrollDirection?: 'vertical' | 'horizontal';
  readonly scrollElement?: HTMLElement | Document;
  readonly onBeforeUpdate?: (progress: number) => number;
}

const defaultAttachNodeToScrollOptions: AttachNodeToScrollOptions = {
  scrollDirection: 'vertical',
  scrollElement: document,
}

export class AttachNodeToScroll implements Behavior<Node> {
  public readonly name = 'AttachNodeToScroll';
  private target: Nullable<Node> = null;
  private readonly scrollElement: HTMLElement | Document;
  private readonly scrollDirection: 'vertical' | 'horizontal';
  private readonly onBeforeUpdate: (progress: number) => number;
  private animationGroups?: AnimationGroup[];
  private currentProgress?: number;

  constructor(options: AttachNodeToScrollOptions = defaultAttachNodeToScrollOptions) {
    this.scrollDirection = options.scrollDirection || defaultAttachNodeToScrollOptions.scrollDirection!;
    this.scrollElement = options.scrollElement || defaultAttachNodeToScrollOptions.scrollElement!;
    this.onBeforeUpdate = options.onBeforeUpdate || ((progress) => progress);
  }

  public init(): void {}

  public attach(target: Node): void {
    this.target = target;
    const scene = this.target.getScene();

    this.animationGroups = scene.animationGroups.filter((animationGroup) => {
      return animationGroup.targetedAnimations.some((animation) => {
        return animation.target === this.target;
      });
    });

    this.scrollElement.addEventListener('scroll', () => this.updateTargetPosition());
    scene.onBeforeCameraRenderObservable.addOnce(() => this.updateTargetPosition());
  }

  public detach(): void {
    if (this.target) {
      this.scrollElement.removeEventListener('scroll', () => this.updateTargetPosition());
      this.target.getScene().onBeforeCameraRenderObservable.removeCallback(() => this.updateTargetPosition());
      this.target = null;
    }
  }

  private updateTargetPosition(): void {
    if (!this.animationGroups) { return; }

    const el = this.scrollElement instanceof HTMLElement ? this.scrollElement : this.scrollElement.documentElement;

    if (this.scrollDirection === 'vertical') {
      const scrollMax = el.scrollHeight - el.clientHeight;
      const scrollPos = el.scrollTop;
      this.currentProgress = this.onBeforeUpdate(scrollPos / scrollMax);
    } else {
      const scrollMax = el.scrollWidth - el.clientWidth;
      const scrollPos = el.scrollLeft;
      this.currentProgress = this.onBeforeUpdate(scrollPos / scrollMax);
    }

    if (isNaN(this.currentProgress)) { return; }

    for (const animationGroup of this.animationGroups) {
      const targetFrame = animationGroup.from + (animationGroup.to - animationGroup.from) * this.currentProgress;

      animationGroup.play();
      animationGroup.goToFrame(targetFrame);
      animationGroup.pause();
    }
  }

}
