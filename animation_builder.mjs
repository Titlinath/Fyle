/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { ANIMATION_MODULE_TYPE, Inject, inject, Injectable, RendererFactory2, ViewEncapsulation, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { sequence } from './animation_metadata';
import * as i0 from "@angular/core";
/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
 * // require the service as a dependency
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first define a reusable animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // use the returned factory object to create a player
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class AnimationBuilder {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AnimationBuilder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AnimationBuilder, providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }]
        }] });
/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 */
export class AnimationFactory {
}
export class BrowserAnimationBuilder extends AnimationBuilder {
    constructor(rootRenderer, doc) {
        super();
        this.animationModuleType = inject(ANIMATION_MODULE_TYPE, { optional: true });
        this._nextAnimationId = 0;
        const typeData = {
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] },
        };
        this._renderer = rootRenderer.createRenderer(doc.body, typeData);
        if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
            // We only support AnimationRenderer & DynamicDelegationRenderer for this AnimationBuilder
            throw new RuntimeError(3600 /* RuntimeErrorCode.BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' +
                    'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.');
        }
    }
    build(animation) {
        const id = this._nextAnimationId;
        this._nextAnimationId++;
        const entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BrowserAnimationBuilder, deps: [{ token: i0.RendererFactory2 }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BrowserAnimationBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BrowserAnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
class BrowserAnimationFactory extends AnimationFactory {
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
class RendererAnimationPlayer {
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    _command(command, ...args) {
        issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    onDone(fn) {
        this._listen('done', fn);
    }
    onStart(fn) {
        this._listen('start', fn);
    }
    onDestroy(fn) {
        this._listen('destroy', fn);
    }
    init() {
        this._command('init');
    }
    hasStarted() {
        return this._started;
    }
    play() {
        this._command('play');
        this._started = true;
    }
    pause() {
        this._command('pause');
    }
    restart() {
        this._command('restart');
    }
    finish() {
        this._command('finish');
    }
    destroy() {
        this._command('destroy');
    }
    reset() {
        this._command('reset');
        this._started = false;
    }
    setPosition(p) {
        this._command('setPosition', p);
    }
    getPosition() {
        return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
    }
}
function issueAnimationCommand(renderer, element, id, command, args) {
    renderer.setProperty(element, `@@${id}:${command}`, args);
}
/**
 * The following 2 methods cannot reference their correct types (AnimationRenderer &
 * DynamicDelegationRenderer) since this would introduce a import cycle.
 */
function unwrapAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    if (type === 0 /* AnimationRendererType.Regular */) {
        return renderer;
    }
    else if (type === 1 /* AnimationRendererType.Delegated */) {
        return renderer.animationRenderer;
    }
    return null;
}
function isAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    return type === 0 /* AnimationRendererType.Regular */ || type === 1 /* AnimationRendererType.Delegated */;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL3NyYy9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHFCQUFxQixFQUNyQixNQUFNLEVBQ04sTUFBTSxFQUNOLFVBQVUsRUFFVixnQkFBZ0IsRUFFaEIsaUJBQWlCLEVBRWpCLGFBQWEsSUFBSSxZQUFZLEdBQzlCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBc0MsUUFBUSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7O0FBSW5GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Q0c7QUFFSCxNQUFNLE9BQWdCLGdCQUFnQjt5SEFBaEIsZ0JBQWdCOzZIQUFoQixnQkFBZ0IsY0FEYixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDOztzR0FDNUQsZ0JBQWdCO2tCQURyQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQUM7O0FBV25GOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCO0NBV3JDO0FBR0QsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGdCQUFnQjtJQUszRCxZQUFZLFlBQThCLEVBQW9CLEdBQWE7UUFDekUsS0FBSyxFQUFFLENBQUM7UUFMRix3QkFBbUIsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUN0RSxxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFLM0IsTUFBTSxRQUFRLEdB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Q2xDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FHRjtBQUVELFNBQVMscUJBQXFCLENBQzVCLFFBQW1CLEVBQ25CLE9BQVksRUFDWixFQUFVLEVBQ1YsT0FBZSxFQUNmLElBQVc7SUFFWCxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7OztHQUdHO0FBRUgsU0FBUyx1QkFBdUIsQ0FDOUIsUUFBbUI7SUFFbkIsTUFBTSxJQUFJLEdBQUksUUFBc0QsQ0FBQyxLQUFLLENBQUM7SUFDM0UsSUFBSSxJQUFJLDBDQUFrQyxFQUFFLENBQUM7UUFDM0MsT0FBTyxRQUFlLENBQUM7SUFDekIsQ0FBQztTQUFNLElBQUksSUFBSSw0Q0FBb0MsRUFBRSxDQUFDO1FBQ3BELE9BQVEsUUFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQztJQUM3QyxDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxRQUFtQjtJQUM5QyxNQUFNLElBQUksR0FBSSxRQUFzRCxDQUFDLEtBQUssQ0FBQztJQUMzRSxPQUFPLElBQUksMENBQWtDLElBQUksSUFBSSw0Q0FBb0MsQ0FBQztBQUM1RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQU5JTUFUSU9OX01PRFVMRV9UWVBFLFxuICBJbmplY3QsXG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgUmVuZGVyZXIyLFxuICBSZW5kZXJlckZhY3RvcnkyLFxuICBSZW5kZXJlclR5cGUyLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgybVBbmltYXRpb25SZW5kZXJlclR5cGUgYXMgQW5pbWF0aW9uUmVuZGVyZXJUeXBlLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0FuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25PcHRpb25zLCBzZXF1ZW5jZX0gZnJvbSAnLi9hbmltYXRpb25fbWV0YWRhdGEnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnLi9wbGF5ZXJzL2FuaW1hdGlvbl9wbGF5ZXInO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgc2VydmljZSB0aGF0IHByb2R1Y2VzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZSBwcm9ncmFtbWF0aWNhbGx5IHdpdGhpbiBhblxuICogQW5ndWxhciBjb21wb25lbnQgb3IgZGlyZWN0aXZlLlxuICogUHJvdmlkZWQgYnkgdGhlIGBCcm93c2VyQW5pbWF0aW9uc01vZHVsZWAgb3IgYE5vb3BBbmltYXRpb25zTW9kdWxlYC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRvIHVzZSB0aGlzIHNlcnZpY2UsIGFkZCBpdCB0byB5b3VyIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgYXMgYSBkZXBlbmRlbmN5LlxuICogVGhlIHNlcnZpY2UgaXMgaW5zdGFudGlhdGVkIGFsb25nIHdpdGggeW91ciBjb21wb25lbnQuXG4gKlxuICogQXBwcyBkbyBub3QgdHlwaWNhbGx5IG5lZWQgdG8gY3JlYXRlIHRoZWlyIG93biBhbmltYXRpb24gcGxheWVycywgYnV0IGlmIHlvdVxuICogZG8gbmVlZCB0bywgZm9sbG93IHRoZXNlIHN0ZXBzOlxuICpcbiAqIDEuIFVzZSB0aGUgPGNvZGU+W0FuaW1hdGlvbkJ1aWxkZXIuYnVpbGRdKGFwaS9hbmltYXRpb25zL0FuaW1hdGlvbkJ1aWxkZXIjYnVpbGQpKCk8L2NvZGU+IG1ldGhvZFxuICogdG8gY3JlYXRlIGEgcHJvZ3JhbW1hdGljIGFuaW1hdGlvbi4gVGhlIG1ldGhvZCByZXR1cm5zIGFuIGBBbmltYXRpb25GYWN0b3J5YCBpbnN0YW5jZS5cbiAqXG4gKiAyLiBVc2UgdGhlIGZhY3Rvcnkgb2JqZWN0IHRvIGNyZWF0ZSBhbiBgQW5pbWF0aW9uUGxheWVyYCBhbmQgYXR0YWNoIGl0IHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogMy4gVXNlIHRoZSBwbGF5ZXIgb2JqZWN0IHRvIGNvbnRyb2wgdGhlIGFuaW1hdGlvbiBwcm9ncmFtbWF0aWNhbGx5LlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBpbXBvcnQgdGhlIHNlcnZpY2UgZnJvbSBCcm93c2VyQW5pbWF0aW9uc01vZHVsZVxuICogaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIC8vIHJlcXVpcmUgdGhlIHNlcnZpY2UgYXMgYSBkZXBlbmRlbmN5XG4gKiBjbGFzcyBNeUNtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2J1aWxkZXI6IEFuaW1hdGlvbkJ1aWxkZXIpIHt9XG4gKlxuICogICBtYWtlQW5pbWF0aW9uKGVsZW1lbnQ6IGFueSkge1xuICogICAgIC8vIGZpcnN0IGRlZmluZSBhIHJldXNhYmxlIGFuaW1hdGlvblxuICogICAgIGNvbnN0IG15QW5pbWF0aW9uID0gdGhpcy5fYnVpbGRlci5idWlsZChbXG4gKiAgICAgICBzdHlsZSh7IHdpZHRoOiAwIH0pLFxuICogICAgICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAnMTAwcHgnIH0pKVxuICogICAgIF0pO1xuICpcbiAqICAgICAvLyB1c2UgdGhlIHJldHVybmVkIGZhY3Rvcnkgb2JqZWN0IHRvIGNyZWF0ZSBhIHBsYXllclxuICogICAgIGNvbnN0IHBsYXllciA9IG15QW5pbWF0aW9uLmNyZWF0ZShlbGVtZW50KTtcbiAqXG4gKiAgICAgcGxheWVyLnBsYXkoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnLCB1c2VGYWN0b3J5OiAoKSA9PiBpbmplY3QoQnJvd3NlckFuaW1hdGlvbkJ1aWxkZXIpfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgLyoqXG4gICAqIEJ1aWxkcyBhIGZhY3RvcnkgZm9yIHByb2R1Y2luZyBhIGRlZmluZWQgYW5pbWF0aW9uLlxuICAgKiBAcGFyYW0gYW5pbWF0aW9uIEEgcmV1c2FibGUgYW5pbWF0aW9uIGRlZmluaXRpb24uXG4gICAqIEByZXR1cm5zIEEgZmFjdG9yeSBvYmplY3QgdGhhdCBjYW4gY3JlYXRlIGEgcGxheWVyIGZvciB0aGUgZGVmaW5lZCBhbmltYXRpb24uXG4gICAqIEBzZWUge0BsaW5rIGFuaW1hdGV9XG4gICAqL1xuICBhYnN0cmFjdCBidWlsZChhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvbkZhY3Rvcnk7XG59XG5cbi8qKlxuICogQSBmYWN0b3J5IG9iamVjdCByZXR1cm5lZCBmcm9tIHRoZVxuICogPGNvZGU+W0FuaW1hdGlvbkJ1aWxkZXIuYnVpbGRdKGFwaS9hbmltYXRpb25zL0FuaW1hdGlvbkJ1aWxkZXIjYnVpbGQpKCk8L2NvZGU+XG4gKiBtZXRob2QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGBBbmltYXRpb25QbGF5ZXJgIGluc3RhbmNlIGZvciB0aGUgcmV1c2FibGUgYW5pbWF0aW9uIGRlZmluZWQgYnlcbiAgICogdGhlIDxjb2RlPltBbmltYXRpb25CdWlsZGVyLmJ1aWxkXShhcGkvYW5pbWF0aW9ucy9BbmltYXRpb25CdWlsZGVyI2J1aWxkKSgpPC9jb2RlPlxuICAgKiBtZXRob2QgdGhhdCBjcmVhdGVkIHRoaXMgZmFjdG9yeSBhbmQgYXR0YWNoZXMgdGhlIG5ldyBwbGF5ZXIgYSBET00gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIERPTSBlbGVtZW50IHRvIHdoaWNoIHRvIGF0dGFjaCB0aGUgcGxheWVyLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBIHNldCBvZiBvcHRpb25zIHRoYXQgY2FuIGluY2x1ZGUgYSB0aW1lIGRlbGF5IGFuZFxuICAgKiBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGUoZWxlbWVudDogYW55LCBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvblBsYXllcjtcbn1cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQnJvd3NlckFuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgcHJpdmF0ZSBhbmltYXRpb25Nb2R1bGVUeXBlID0gaW5qZWN0KEFOSU1BVElPTl9NT0RVTEVfVFlQRSwge29wdGlvbmFsOiB0cnVlfSk7XG4gIHByaXZhdGUgX25leHRBbmltYXRpb25JZCA9IDA7XG4gIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjI7XG5cbiAgY29uc3RydWN0b3Iocm9vdFJlbmRlcmVyOiBSZW5kZXJlckZhY3RvcnkyLCBASW5qZWN0KERPQ1VNRU5UKSBkb2M6IERvY3VtZW50KSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCB0eXBlRGF0YTogUmVuZGVyZXJUeXBlMiA9IHtcbiAgICAgIGlkOiAnMCcsXG4gICAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAgICAgc3R5bGVzOiBbXSxcbiAgICAgIGRhdGE6IHthbmltYXRpb246IFtdfSxcbiAgICB9O1xuICAgIHRoaXMuX3JlbmRlcmVyID0gcm9vdFJlbmRlcmVyLmNyZWF0ZVJlbmRlcmVyKGRvYy5ib2R5LCB0eXBlRGF0YSk7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25Nb2R1bGVUeXBlID09PSBudWxsICYmICFpc0FuaW1hdGlvblJlbmRlcmVyKHRoaXMuX3JlbmRlcmVyKSkge1xuICAgICAgLy8gV2Ugb25seSBzdXBwb3J0IEFuaW1hdGlvblJlbmRlcmVyICYgRHluYW1pY0RlbGVnYXRpb25SZW5kZXJlciBmb3IgdGhpcyBBbmltYXRpb25CdWlsZGVyXG5cbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuQlJPV1NFUl9BTklNQVRJT05fQlVJTERFUl9JTkpFQ1RFRF9XSVRIT1VUX0FOSU1BVElPTlMsXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICAgICAgJ0FuZ3VsYXIgZGV0ZWN0ZWQgdGhhdCB0aGUgYEFuaW1hdGlvbkJ1aWxkZXJgIHdhcyBpbmplY3RlZCwgYnV0IGFuaW1hdGlvbiBzdXBwb3J0IHdhcyBub3QgZW5hYmxlZC4gJyArXG4gICAgICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdSBlbmFibGUgYW5pbWF0aW9ucyBpbiB5b3VyIGFwcGxpY2F0aW9uIGJ5IGNhbGxpbmcgYHByb3ZpZGVBbmltYXRpb25zKClgIG9yIGBwcm92aWRlQW5pbWF0aW9uc0FzeW5jKClgIGZ1bmN0aW9uLicsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGJ1aWxkKGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uRmFjdG9yeSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLl9uZXh0QW5pbWF0aW9uSWQ7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbklkKys7XG4gICAgY29uc3QgZW50cnkgPSBBcnJheS5pc0FycmF5KGFuaW1hdGlvbikgPyBzZXF1ZW5jZShhbmltYXRpb24pIDogYW5pbWF0aW9uO1xuICAgIGlzc3VlQW5pbWF0aW9uQ29tbWFuZCh0aGlzLl9yZW5kZXJlciwgbnVsbCwgaWQsICdyZWdpc3RlcicsIFtlbnRyeV0pO1xuICAgIHJldHVybiBuZXcgQnJvd3NlckFuaW1hdGlvbkZhY3RvcnkoaWQsIHRoaXMuX3JlbmRlcmVyKTtcbiAgfVxufVxuXG5jbGFzcyBCcm93c2VyQW5pbWF0aW9uRmFjdG9yeSBleHRlbmRzIEFuaW1hdGlvbkZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9pZDogbnVtYmVyLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSBjcmVhdGUoZWxlbWVudDogYW55LCBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgcmV0dXJuIG5ldyBSZW5kZXJlckFuaW1hdGlvblBsYXllcih0aGlzLl9pZCwgZWxlbWVudCwgb3B0aW9ucyB8fCB7fSwgdGhpcy5fcmVuZGVyZXIpO1xuICB9XG59XG5cbmNsYXNzIFJlbmRlcmVyQW5pbWF0aW9uUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3N0YXJ0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgaWQ6IG51bWJlcixcbiAgICBwdWJsaWMgZWxlbWVudDogYW55LFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgKSB7XG4gICAgdGhpcy5fY29tbWFuZCgnY3JlYXRlJywgb3B0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogKCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVyLmxpc3Rlbih0aGlzLmVsZW1lbnQsIGBAQCR7dGhpcy5pZH06JHtldmVudE5hbWV9YCwgY2FsbGJhY2spO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWFuZChjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaXNzdWVBbmltYXRpb25Db21tYW5kKHRoaXMuX3JlbmRlcmVyLCB0aGlzLmVsZW1lbnQsIHRoaXMuaWQsIGNvbW1hbmQsIGFyZ3MpO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuKCdkb25lJywgZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2xpc3Rlbignc3RhcnQnLCBmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW4oJ2Rlc3Ryb3knLCBmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ2luaXQnKTtcbiAgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7XG4gIH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3BsYXknKTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3BhdXNlJyk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3Jlc3RhcnQnKTtcbiAgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdmaW5pc2gnKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgnZGVzdHJveScpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgncmVzZXQnKTtcbiAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdzZXRQb3NpdGlvbicsIHApO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdW53cmFwQW5pbWF0aW9uUmVuZGVyZXIodGhpcy5fcmVuZGVyZXIpPy5lbmdpbmU/LnBsYXllcnNbdGhpcy5pZF0/LmdldFBvc2l0aW9uKCkgPz8gMDtcbiAgfVxuXG4gIHB1YmxpYyB0b3RhbFRpbWUgPSAwO1xufVxuXG5mdW5jdGlvbiBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQoXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gIGVsZW1lbnQ6IGFueSxcbiAgaWQ6IG51bWJlcixcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzOiBhbnlbXSxcbik6IHZvaWQge1xuICByZW5kZXJlci5zZXRQcm9wZXJ0eShlbGVtZW50LCBgQEAke2lkfToke2NvbW1hbmR9YCwgYXJncyk7XG59XG5cbi8qKlxuICogVGhlIGZvbGxvd2luZyAyIG1ldGhvZHMgY2Fubm90IHJlZmVyZW5jZSB0aGVpciBjb3JyZWN0IHR5cGVzIChBbmltYXRpb25SZW5kZXJlciAmXG4gKiBEeW5hbWljRGVsZWdhdGlvblJlbmRlcmVyKSBzaW5jZSB0aGlzIHdvdWxkIGludHJvZHVjZSBhIGltcG9ydCBjeWNsZS5cbiAqL1xuXG5mdW5jdGlvbiB1bndyYXBBbmltYXRpb25SZW5kZXJlcihcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbik6IHtlbmdpbmU6IHtwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXX19IHwgbnVsbCB7XG4gIGNvbnN0IHR5cGUgPSAocmVuZGVyZXIgYXMgdW5rbm93biBhcyB7ybV0eXBlOiBBbmltYXRpb25SZW5kZXJlclR5cGV9KS7JtXR5cGU7XG4gIGlmICh0eXBlID09PSBBbmltYXRpb25SZW5kZXJlclR5cGUuUmVndWxhcikge1xuICAgIHJldHVybiByZW5kZXJlciBhcyBhbnk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gQW5pbWF0aW9uUmVuZGVyZXJUeXBlLkRlbGVnYXRlZCkge1xuICAgIHJldHVybiAocmVuZGVyZXIgYXMgYW55KS5hbmltYXRpb25SZW5kZXJlcjtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0FuaW1hdGlvblJlbmRlcmVyKHJlbmRlcmVyOiBSZW5kZXJlcjIpOiBib29sZWFuIHtcbiAgY29uc3QgdHlwZSA9IChyZW5kZXJlciBhcyB1bmtub3duIGFzIHvJtXR5cGU6IEFuaW1hdGlvblJlbmRlcmVyVHlwZX0pLsm1dHlwZTtcbiAgcmV0dXJuIHR5cGUgPT09IEFuaW1hdGlvblJlbmRlcmVyVHlwZS5SZWd1bGFyIHx8IHR5cGUgPT09IEFuaW1hdGlvblJlbmRlcmVyVHlwZS5EZWxlZ2F0ZWQ7XG59XG4iXX0=