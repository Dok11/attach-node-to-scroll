"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachNodeToScroll = void 0;
const defaultAttachNodeToScrollOptions = {
    scrollDirection: 'vertical',
    scrollElement: document,
};
class AttachNodeToScroll {
    constructor(options = defaultAttachNodeToScrollOptions) {
        this.name = 'AttachNodeToScroll';
        this.target = null;
        this.scrollDirection = options.scrollDirection || defaultAttachNodeToScrollOptions.scrollDirection;
        this.scrollElement = options.scrollElement || defaultAttachNodeToScrollOptions.scrollElement;
        this.onBeforeUpdate = options.onBeforeUpdate || ((progress) => progress);
    }
    init() { }
    attach(target) {
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
    detach() {
        if (this.target) {
            this.scrollElement.removeEventListener('scroll', () => this.updateTargetPosition());
            this.target.getScene().onBeforeCameraRenderObservable.removeCallback(() => this.updateTargetPosition());
            this.target = null;
        }
    }
    updateTargetPosition() {
        if (!this.animationGroups) {
            return;
        }
        const el = this.scrollElement instanceof HTMLElement ? this.scrollElement : this.scrollElement.documentElement;
        if (this.scrollDirection === 'vertical') {
            const scrollMax = el.scrollHeight - el.clientHeight;
            const scrollPos = el.scrollTop;
            this.currentProgress = this.onBeforeUpdate(scrollPos / scrollMax);
        }
        else {
            const scrollMax = el.scrollWidth - el.clientWidth;
            const scrollPos = el.scrollLeft;
            this.currentProgress = this.onBeforeUpdate(scrollPos / scrollMax);
        }
        if (isNaN(this.currentProgress)) {
            return;
        }
        for (const animationGroup of this.animationGroups) {
            const targetFrame = animationGroup.from + (animationGroup.to - animationGroup.from) * this.currentProgress;
            animationGroup.play();
            animationGroup.goToFrame(targetFrame);
            animationGroup.pause();
        }
    }
}
exports.AttachNodeToScroll = AttachNodeToScroll;
//# sourceMappingURL=AttachNodeToScroll.js.map