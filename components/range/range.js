var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ChangeDetectorRef, Component, ElementRef, Input, Optional, Renderer, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { clamp, isTrueProperty } from '../../util/util';
import { Config } from '../../config/config';
import { DomController } from '../../platform/dom-controller';
import { Form } from '../../util/form';
import { Haptic } from '../../tap-click/haptic';
import { BaseInput } from '../../util/base-input';
import { Item } from '../item/item';
import { Platform } from '../../platform/platform';
import { pointerCoord } from '../../util/dom';
import { UIEventManager } from '../../gestures/ui-event-manager';
/**
 * @name Range
 * @description
 * The Range slider lets users select from a range of values by moving
 * the slider knob. It can accept dual knobs, but by default one knob
 * controls the value of the range.
 *
 * ### Range Labels
 * Labels can be placed on either side of the range by adding the
 * `range-left` or `range-right` property to the element. The element
 * doesn't have to be an `ion-label`, it can be added to any element
 * to place it to the left or right of the range. See [usage](#usage)
 * below for examples.
 *
 *
 * ### Minimum and Maximum Values
 * Minimum and maximum values can be passed to the range through the `min`
 * and `max` properties, respectively. By default, the range sets the `min`
 * to `0` and the `max` to `100`.
 *
 *
 * ### Steps and Snaps
 * The `step` property specifies the value granularity of the range's value.
 * It can be useful to set the `step` when the value isn't in increments of `1`.
 * Setting the `step` property will show tick marks on the range for each step.
 * The `snaps` property can be set to automatically move the knob to the nearest
 * tick mark based on the step property value.
 *
 *
 * ### Dual Knobs
 * Setting the `dualKnobs` property to `true` on the range component will
 * enable two knobs on the range. If the range has two knobs, the value will
 * be an object containing two properties: `lower` and `upper`.
 *
 *
 * @usage
 * ```html
 * <ion-list>
 *   <ion-item>
 *     <ion-range [(ngModel)]="singleValue" color="danger" pin="true"></ion-range>
 *   </ion-item>
 *
 *   <ion-item>
 *     <ion-range min="-200" max="200" [(ngModel)]="saturation" color="secondary">
 *       <ion-label range-left>-200</ion-label>
 *       <ion-label range-right>200</ion-label>
 *     </ion-range>
 *   </ion-item>
 *
 *  <ion-item>
 *    <ion-range min="20" max="80" step="2" [(ngModel)]="brightness">
 *      <ion-icon small range-left name="sunny"></ion-icon>
 *      <ion-icon range-right name="sunny"></ion-icon>
 *    </ion-range>
 *  </ion-item>
 *
 *   <ion-item>
 *     <ion-label>step=100, snaps, {{singleValue4}}</ion-label>
 *     <ion-range min="1000" max="2000" step="100" snaps="true" color="secondary" [(ngModel)]="singleValue4"></ion-range>
 *   </ion-item>
 *
 *   <ion-item>
 *     <ion-label>dual, step=3, snaps, {{dualValue2 | json}}</ion-label>
 *     <ion-range dualKnobs="true" [(ngModel)]="dualValue2" min="21" max="72" step="3" snaps="true"></ion-range>
 *   </ion-item>
 * </ion-list>
 * ```
 *
 *
 * @demo /docs/demos/src/range/
 */
var Range = (function (_super) {
    __extends(Range, _super);
    function Range(form, _haptic, item, config, _plt, elementRef, renderer, _dom, _cd) {
        var _this = _super.call(this, config, elementRef, renderer, 'range', 0, form, item, null) || this;
        _this._haptic = _haptic;
        _this._plt = _plt;
        _this._dom = _dom;
        _this._cd = _cd;
        _this._min = 0;
        _this._max = 100;
        _this._step = 1;
        _this._valA = 0;
        _this._valB = 0;
        _this._ratioA = 0;
        _this._ratioB = 0;
        _this._events = new UIEventManager(_plt);
        return _this;
    }
    Object.defineProperty(Range.prototype, "min", {
        /**
         * @input {number} Minimum integer value of the range. Defaults to `0`.
         */
        get: function () {
            return this._min;
        },
        set: function (val) {
            val = Math.round(val);
            if (!isNaN(val)) {
                this._min = val;
                this._inputUpdated();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "max", {
        /**
         * @input {number} Maximum integer value of the range. Defaults to `100`.
         */
        get: function () {
            return this._max;
        },
        set: function (val) {
            val = Math.round(val);
            if (!isNaN(val)) {
                this._max = val;
                this._inputUpdated();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "step", {
        /**
         * @input {number} Specifies the value granularity. Defaults to `1`.
         */
        get: function () {
            return this._step;
        },
        set: function (val) {
            val = Math.round(val);
            if (!isNaN(val) && val > 0) {
                this._step = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "snaps", {
        /**
         * @input {boolean} If true, the knob snaps to tick marks evenly spaced based
         * on the step property value. Defaults to `false`.
         */
        get: function () {
            return this._snaps;
        },
        set: function (val) {
            this._snaps = isTrueProperty(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "pin", {
        /**
         * @input {boolean} If true, a pin with integer value is shown when the knob
         * is pressed. Defaults to `false`.
         */
        get: function () {
            return this._pin;
        },
        set: function (val) {
            this._pin = isTrueProperty(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "debounce", {
        /**
         * @input {number} How long, in milliseconds, to wait to trigger the
         * `ionChange` event after each change in the range value. Default `0`.
         */
        get: function () {
            return this._debouncer.wait;
        },
        set: function (val) {
            this._debouncer.wait = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "dualKnobs", {
        /**
         * @input {boolean} Show two knobs. Defaults to `false`.
         */
        get: function () {
            return this._dual;
        },
        set: function (val) {
            this._dual = isTrueProperty(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "ratio", {
        /**
         * Returns the ratio of the knob's is current location, which is a number
         * between `0` and `1`. If two knobs are used, this property represents
         * the lower value.
         */
        get: function () {
            if (this._dual) {
                return Math.min(this._ratioA, this._ratioB);
            }
            return this._ratioA;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "ratioUpper", {
        /**
         * Returns the ratio of the upper value's is current location, which is
         * a number between `0` and `1`. If there is only one knob, then this
         * will return `null`.
         */
        get: function () {
            if (this._dual) {
                return Math.max(this._ratioA, this._ratioB);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @hidden
     */
    Range.prototype.ngAfterContentInit = function () {
        this._initialize();
        // add touchstart/mousedown listeners
        this._events.pointerEvents({
            element: this._slider.nativeElement,
            pointerDown: this._pointerDown.bind(this),
            pointerMove: this._pointerMove.bind(this),
            pointerUp: this._pointerUp.bind(this),
            zone: true
        });
        // build all the ticks if there are any to show
        this._createTicks();
    };
    /** @internal */
    Range.prototype._pointerDown = function (ev) {
        // TODO: we could stop listening for events instead of checking this._disabled.
        // since there are a lot of events involved, this solution is
        // enough for the moment
        if (this._disabled) {
            return false;
        }
        // trigger ionFocus event
        this._fireFocus();
        // prevent default so scrolling does not happen
        ev.preventDefault();
        ev.stopPropagation();
        // get the start coordinates
        var current = pointerCoord(ev);
        // get the full dimensions of the slider element
        var rect = this._rect = this._plt.getElementBoundingClientRect(this._slider.nativeElement);
        // figure out which knob they started closer to
        var ratio = clamp(0, (current.x - rect.left) / (rect.width), 1);
        this._activeB = this._dual && (Math.abs(ratio - this._ratioA) > Math.abs(ratio - this._ratioB));
        // update the active knob's position
        this._update(current, rect, true);
        // trigger a haptic start
        this._haptic.gestureSelectionStart();
        // return true so the pointer events
        // know everything's still valid
        return true;
    };
    /** @internal */
    Range.prototype._pointerMove = function (ev) {
        if (this._disabled) {
            return;
        }
        // prevent default so scrolling does not happen
        ev.preventDefault();
        ev.stopPropagation();
        // update the active knob's position
        var hasChanged = this._update(pointerCoord(ev), this._rect, true);
        if (hasChanged && this._snaps) {
            // trigger a haptic selection changed event
            // if this is a snap range
            this._haptic.gestureSelectionChanged();
        }
    };
    /** @internal */
    Range.prototype._pointerUp = function (ev) {
        if (this._disabled) {
            return;
        }
        // prevent default so scrolling does not happen
        ev.preventDefault();
        ev.stopPropagation();
        // update the active knob's position
        this._update(pointerCoord(ev), this._rect, false);
        // trigger a haptic end
        this._haptic.gestureSelectionEnd();
        // trigger ionBlur event
        this._fireBlur();
    };
    /** @internal */
    Range.prototype._update = function (current, rect, isPressed) {
        // figure out where the pointer is currently at
        // update the knob being interacted with
        var ratio = clamp(0, (current.x - rect.left) / (rect.width), 1);
        var val = this._ratioToValue(ratio);
        if (this._snaps) {
            // snaps the ratio to the current value
            ratio = this._valueToRatio(val);
        }
        // update which knob is pressed
        this._pressed = isPressed;
        var valChanged = false;
        if (this._activeB) {
            // when the pointer down started it was determined
            // that knob B was the one they were interacting with
            this._pressedB = isPressed;
            this._pressedA = false;
            this._ratioB = ratio;
            valChanged = val === this._valB;
            this._valB = val;
        }
        else {
            // interacting with knob A
            this._pressedA = isPressed;
            this._pressedB = false;
            this._ratioA = ratio;
            valChanged = val === this._valA;
            this._valA = val;
        }
        this._updateBar();
        if (valChanged) {
            return false;
        }
        // value has been updated
        var value;
        if (this._dual) {
            // dual knobs have an lower and upper value
            value = {
                lower: Math.min(this._valA, this._valB),
                upper: Math.max(this._valA, this._valB)
            };
            (void 0) /* console.debug */;
        }
        else {
            // single knob only has one value
            value = this._valA;
            (void 0) /* console.debug */;
        }
        // Update input value
        this.value = value;
        return true;
    };
    /** @internal */
    Range.prototype._updateBar = function () {
        var ratioA = this._ratioA;
        var ratioB = this._ratioB;
        if (this._dual) {
            this._barL = (Math.min(ratioA, ratioB) * 100) + "%";
            this._barR = 100 - (Math.max(ratioA, ratioB) * 100) + "%";
        }
        else {
            this._barL = '';
            this._barR = 100 - (ratioA * 100) + "%";
        }
        this._updateTicks();
    };
    /** @internal */
    Range.prototype._createTicks = function () {
        var _this = this;
        if (this._snaps) {
            this._dom.write(function () {
                // TODO: Fix to not use RAF
                _this._ticks = [];
                for (var value = _this._min; value <= _this._max; value += _this._step) {
                    var ratio = _this._valueToRatio(value);
                    _this._ticks.push({
                        ratio: ratio,
                        left: ratio * 100 + "%",
                    });
                }
                _this._updateTicks();
            });
        }
    };
    /** @internal */
    Range.prototype._updateTicks = function () {
        var ticks = this._ticks;
        var ratio = this.ratio;
        if (this._snaps && ticks) {
            if (this._dual) {
                var upperRatio = this.ratioUpper;
                ticks.forEach(function (t) {
                    t.active = (t.ratio >= ratio && t.ratio <= upperRatio);
                });
            }
            else {
                ticks.forEach(function (t) {
                    t.active = (t.ratio <= ratio);
                });
            }
        }
    };
    /** @hidden */
    Range.prototype._keyChg = function (isIncrease, isKnobB) {
        var step = this._step;
        if (isKnobB) {
            if (isIncrease) {
                this._valB += step;
            }
            else {
                this._valB -= step;
            }
            this._valB = clamp(this._min, this._valB, this._max);
            this._ratioB = this._valueToRatio(this._valB);
        }
        else {
            if (isIncrease) {
                this._valA += step;
            }
            else {
                this._valA -= step;
            }
            this._valA = clamp(this._min, this._valA, this._max);
            this._ratioA = this._valueToRatio(this._valA);
        }
        this._updateBar();
    };
    /** @internal */
    Range.prototype._ratioToValue = function (ratio) {
        ratio = Math.round(((this._max - this._min) * ratio));
        ratio = Math.round(ratio / this._step) * this._step + this._min;
        return clamp(this._min, ratio, this._max);
    };
    /** @internal */
    Range.prototype._valueToRatio = function (value) {
        value = Math.round((value - this._min) / this._step) * this._step;
        value = value / (this._max - this._min);
        return clamp(0, value, 1);
    };
    Range.prototype._inputNormalize = function (val) {
        if (this._dual) {
            return val;
        }
        else {
            val = parseFloat(val);
            return isNaN(val) ? undefined : val;
        }
    };
    /**
     * @hidden
     */
    Range.prototype._inputUpdated = function () {
        var val = this.value;
        if (this._dual) {
            this._valA = val.lower;
            this._valB = val.upper;
            this._ratioA = this._valueToRatio(val.lower);
            this._ratioB = this._valueToRatio(val.upper);
        }
        else {
            this._valA = val;
            this._ratioA = this._valueToRatio(val);
        }
        this._updateBar();
        this._cd.detectChanges();
    };
    /**
     * @hidden
     */
    Range.prototype.ngOnDestroy = function () {
        _super.prototype.ngOnDestroy.call(this);
        this._events.destroy();
    };
    Range.decorators = [
        { type: Component, args: [{
                    selector: 'ion-range',
                    template: '<ng-content select="[range-left]"></ng-content>' +
                        '<div class="range-slider" #slider>' +
                        '<div class="range-tick" *ngFor="let t of _ticks" [style.left]="t.left" [class.range-tick-active]="t.active" role="presentation"></div>' +
                        '<div class="range-bar" role="presentation"></div>' +
                        '<div class="range-bar range-bar-active" [style.left]="_barL" [style.right]="_barR" #bar role="presentation"></div>' +
                        '<div class="range-knob-handle" (ionIncrease)="_keyChg(true, false)" (ionDecrease)="_keyChg(false, false)" [ratio]="_ratioA" [val]="_valA" [pin]="_pin" [pressed]="_pressedA" [min]="_min" [max]="_max" [disabled]="_disabled" [labelId]="_labelId"></div>' +
                        '<div class="range-knob-handle" (ionIncrease)="_keyChg(true, true)" (ionDecrease)="_keyChg(false, true)" [ratio]="_ratioB" [val]="_valB" [pin]="_pin" [pressed]="_pressedB" [min]="_min" [max]="_max" [disabled]="_disabled" [labelId]="_labelId" *ngIf="_dual"></div>' +
                        '</div>' +
                        '<ng-content select="[range-right]"></ng-content>',
                    host: {
                        '[class.range-disabled]': '_disabled',
                        '[class.range-pressed]': '_pressed',
                        '[class.range-has-pin]': '_pin'
                    },
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: Range, multi: true }],
                    encapsulation: ViewEncapsulation.None,
                },] },
    ];
    /** @nocollapse */
    Range.ctorParameters = function () { return [
        { type: Form, },
        { type: Haptic, },
        { type: Item, decorators: [{ type: Optional },] },
        { type: Config, },
        { type: Platform, },
        { type: ElementRef, },
        { type: Renderer, },
        { type: DomController, },
        { type: ChangeDetectorRef, },
    ]; };
    Range.propDecorators = {
        '_slider': [{ type: ViewChild, args: ['slider',] },],
        'min': [{ type: Input },],
        'max': [{ type: Input },],
        'step': [{ type: Input },],
        'snaps': [{ type: Input },],
        'pin': [{ type: Input },],
        'debounce': [{ type: Input },],
        'dualKnobs': [{ type: Input },],
    };
    return Range;
}(BaseInput));
export { Range };
//# sourceMappingURL=range.js.map