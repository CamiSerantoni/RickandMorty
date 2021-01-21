
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Card.svelte generated by Svelte v3.31.2 */

    const file = "src\\components\\Card.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h2;
    	let t1;
    	let t2;
    	let p0;
    	let span0;
    	let t3;
    	let span0_style_value;
    	let t4;
    	let t5;
    	let t6;
    	let span1;
    	let t8;
    	let p1;
    	let t9_value = /*origin*/ ctx[2].name + "";
    	let t9;
    	let t10;
    	let span2;
    	let t12;
    	let p2;
    	let t13_value = /*location*/ ctx[5].name + "";
    	let t13;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			p0 = element("p");
    			span0 = element("span");
    			t3 = text(/*status*/ ctx[4]);
    			t4 = text(" - ");
    			t5 = text(/*species*/ ctx[3]);
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Origin:";
    			t8 = space();
    			p1 = element("p");
    			t9 = text(t9_value);
    			t10 = space();
    			span2 = element("span");
    			span2.textContent = "Location:";
    			t12 = space();
    			p2 = element("p");
    			t13 = text(t13_value);
    			attr_dev(img, "class", "Card-img svelte-11pto6b");
    			if (img.src !== (img_src_value = /*image*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 74, 8, 1607);
    			attr_dev(h2, "class", "svelte-11pto6b");
    			add_location(h2, file, 76, 10, 1704);

    			attr_dev(span0, "style", span0_style_value = /*status*/ ctx[4] === "Alive"
    			? "color: lightgreen"
    			: /*status*/ ctx[4] === "Dead"
    				? "color: red"
    				: "color:gray");

    			attr_dev(span0, "class", "svelte-11pto6b");
    			add_location(span0, file, 77, 14, 1738);
    			attr_dev(p0, "class", "svelte-11pto6b");
    			add_location(p0, file, 77, 10, 1734);
    			attr_dev(span1, "class", "svelte-11pto6b");
    			add_location(span1, file, 78, 10, 1888);
    			attr_dev(p1, "class", "svelte-11pto6b");
    			add_location(p1, file, 79, 10, 1922);
    			attr_dev(span2, "class", "svelte-11pto6b");
    			add_location(span2, file, 80, 10, 1954);
    			attr_dev(p2, "class", "svelte-11pto6b");
    			add_location(p2, file, 81, 11, 1991);
    			attr_dev(div0, "class", "Card-description svelte-11pto6b");
    			add_location(div0, file, 75, 8, 1662);
    			attr_dev(div1, "class", "card-body svelte-11pto6b");
    			add_location(div1, file, 73, 6, 1574);
    			attr_dev(div2, "class", "Card svelte-11pto6b");
    			add_location(div2, file, 72, 0, 1547);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, span0);
    			append_dev(span0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, span1);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(p1, t9);
    			append_dev(div0, t10);
    			append_dev(div0, span2);
    			append_dev(div0, t12);
    			append_dev(div0, p2);
    			append_dev(p2, t13);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = /*image*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);
    			if (dirty & /*status*/ 16) set_data_dev(t3, /*status*/ ctx[4]);

    			if (dirty & /*status*/ 16 && span0_style_value !== (span0_style_value = /*status*/ ctx[4] === "Alive"
    			? "color: lightgreen"
    			: /*status*/ ctx[4] === "Dead"
    				? "color: red"
    				: "color:gray")) {
    				attr_dev(span0, "style", span0_style_value);
    			}

    			if (dirty & /*species*/ 8) set_data_dev(t5, /*species*/ ctx[3]);
    			if (dirty & /*origin*/ 4 && t9_value !== (t9_value = /*origin*/ ctx[2].name + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*location*/ 32 && t13_value !== (t13_value = /*location*/ ctx[5].name + "")) set_data_dev(t13, t13_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { image } = $$props;
    	let { name } = $$props;
    	let { origin } = $$props;
    	let { species } = $$props;
    	let { status } = $$props;
    	let { location } = $$props;
    	const writable_props = ["image", "name", "origin", "species", "status", "location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("origin" in $$props) $$invalidate(2, origin = $$props.origin);
    		if ("species" in $$props) $$invalidate(3, species = $$props.species);
    		if ("status" in $$props) $$invalidate(4, status = $$props.status);
    		if ("location" in $$props) $$invalidate(5, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		image,
    		name,
    		origin,
    		species,
    		status,
    		location
    	});

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("origin" in $$props) $$invalidate(2, origin = $$props.origin);
    		if ("species" in $$props) $$invalidate(3, species = $$props.species);
    		if ("status" in $$props) $$invalidate(4, status = $$props.status);
    		if ("location" in $$props) $$invalidate(5, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, name, origin, species, status, location];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			image: 0,
    			name: 1,
    			origin: 2,
    			species: 3,
    			status: 4,
    			location: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !("image" in props)) {
    			console.warn("<Card> was created without expected prop 'image'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Card> was created without expected prop 'name'");
    		}

    		if (/*origin*/ ctx[2] === undefined && !("origin" in props)) {
    			console.warn("<Card> was created without expected prop 'origin'");
    		}

    		if (/*species*/ ctx[3] === undefined && !("species" in props)) {
    			console.warn("<Card> was created without expected prop 'species'");
    		}

    		if (/*status*/ ctx[4] === undefined && !("status" in props)) {
    			console.warn("<Card> was created without expected prop 'status'");
    		}

    		if (/*location*/ ctx[5] === undefined && !("location" in props)) {
    			console.warn("<Card> was created without expected prop 'location'");
    		}
    	}

    	get image() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get origin() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set origin(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get species() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set species(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.31.2 */

    const file$1 = "src\\components\\Header.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Rick and Morty";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Characters";
    			t3 = space();
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(h1, "class", "hero__Title svelte-vhwgch");
    			add_location(h1, file$1, 65, 5, 1400);
    			attr_dev(p, "class", "hero__Titleb svelte-vhwgch");
    			add_location(p, file$1, 66, 5, 1452);
    			attr_dev(path0, "d", "M92.2871 10.1699C90.3999 25.8964 84.8432 45.0828 82.1173 45.0828C81.3834 45.0828 76.3509 42.986 71.0038 40.4697C62.4067 36.4856 49.3012 32.5016 44.4784 32.5016C43.2202 32.5016 43.8493 34.3888 46.8898 40.5746C51.5029 49.9057 55.6966 64.4789 55.1724 69.5114L54.8579 72.8664L45.422 73.6004C17.9529 75.6972 5.05709 76.9554 5.05709 77.4796C5.05709 77.899 9.67022 82.8266 15.3318 88.593C25.921 99.2871 33.6795 110.715 33.1552 114.699C32.9455 116.167 27.5985 120.57 16.5899 128.224C7.67819 134.41 0.234278 139.966 0.0245907 140.491C-0.185097 141.015 0.968185 141.749 2.64569 142.168C13.864 144.58 18.6868 146.152 22.6709 148.459C28.1227 151.709 33.7843 156.532 36.6151 160.516L38.712 163.451L26.9694 175.089C17.1141 184.944 15.4366 186.937 16.6948 188.09C17.5335 188.824 23.8241 191.235 30.7438 193.332C37.6635 195.429 43.7445 197.631 44.2687 198.155C44.7929 198.679 43.9541 204.026 41.9621 211.365C40.1798 218.18 39.0265 224.156 39.341 224.68C39.8652 225.624 57.1645 224.785 59.9952 223.737C62.6163 222.793 63.6648 225.309 64.3987 233.592C64.8181 238.415 65.4471 242.504 65.8665 242.713C66.7052 243.238 78.4478 238.205 78.4478 237.366C78.4478 237.052 77.0848 234.85 75.4073 232.439C70.5845 225.414 67.3343 218.18 64.2938 208.115C62.826 202.873 60.6243 195.848 59.5759 192.388C58.4226 188.929 57.2693 184.211 57.0596 181.904C55.5918 170.791 55.3821 166.702 56.4306 166.702C56.9548 166.702 57.479 168.484 57.479 170.581C57.5838 175.299 59.8904 187.88 61.4631 192.388C62.0921 194.066 64.0842 200.252 65.8665 206.018C70.1651 219.543 76.3509 231.705 81.6979 237.052C84.2142 239.568 89.666 243.133 94.9082 245.544L103.715 249.633L103.401 253.512L103.086 257.392L79.7059 265.15L56.3257 273.013L53.2852 282.973C51.6077 288.53 46.8898 304.991 42.696 319.669C38.5023 334.242 34.5182 346.823 33.8891 347.452C33.2601 348.081 31.3729 353.743 29.8002 360.138C28.2276 366.429 26.7598 372.51 26.4452 373.454C25.921 375.236 30.1148 375.341 104.554 375.341C179.098 375.341 183.292 375.236 183.292 373.454C183.292 372.51 178.364 367.058 172.283 361.397C166.202 355.735 161.274 350.493 161.274 349.654C161.274 348.92 165.049 345.041 169.557 341.057C181.09 331.202 181.195 330.573 176.477 318.515C168.509 298.281 151.419 267.037 145.128 261.166C143.136 259.279 142.402 257.496 142.402 254.666C142.402 250.367 143.346 249.319 148.693 247.536C154.145 245.754 159.492 241.665 163.162 236.528C166.097 232.439 167.355 231.705 175.428 229.189C180.356 227.616 184.34 225.938 184.34 225.519C184.34 224.995 182.453 222.269 180.146 219.543C175.638 214.091 174.799 210.212 177.84 209.268C178.783 208.954 182.453 208.429 185.913 208.01C189.372 207.696 192.518 207.171 192.937 206.857C193.881 206.437 188.534 191.55 187.276 191.025C186.856 190.816 186.437 189.872 186.437 188.824C186.437 187.566 187.905 186.622 191.679 185.678C198.179 184.001 213.696 176.557 213.696 175.194C213.696 174.565 211.704 173.097 209.293 171.839C195.873 165.024 184.969 157.161 187.171 155.903C187.59 155.693 191.469 154.435 195.663 153.177C199.857 151.919 206.672 149.298 210.865 147.41C218.1 144.16 232.988 135.353 232.358 134.724C231.939 134.41 203.526 122.248 200.8 121.304C199.542 120.78 199.228 120.151 199.752 119.207C200.171 118.369 207.091 111.659 215.059 104.32C222.923 96.8757 229.423 90.4802 229.423 90.0608C229.423 89.2221 222.922 88.0688 203.736 85.3429C196.816 84.2944 190.735 83.246 190.316 82.8266C189.792 82.4072 194.615 73.181 201.01 62.3821C211.39 44.6635 213.382 40.8891 212.333 40.8891C212.124 40.8891 203.526 43.9296 193.252 47.7039C178.259 53.1558 174.17 54.2043 173.122 53.1558C170.815 50.8493 168.613 33.55 168.613 18.0331V3.04048L160.121 7.54876C150.161 12.8958 136.846 23.2753 130.66 30.5096C128.353 33.3403 125.942 35.6469 125.523 35.6469C124.998 35.6469 121.014 30.8241 116.506 24.848C108.748 14.5733 95.6421 6.4671e-06 94.1743 6.4671e-06C93.7549 6.4671e-06 92.9162 4.61313 92.2871 10.1699ZM95.2228 272.908C91.3435 275.949 71.5281 328.266 73.1007 330.992C73.6249 331.935 78.1332 336.234 83.1657 340.638C88.3031 345.041 92.6017 349.13 92.8114 349.759C93.021 350.388 91.7629 352.695 89.9806 354.896C88.3031 357.098 86.8353 358.251 86.8353 357.517C86.8353 356.888 87.7788 355.001 89.037 353.533L91.2387 350.703L81.1737 341.267C74.1492 334.661 71.1087 331.097 71.1087 329.419C71.1087 326.064 83.0609 293.982 90.3999 277.522C92.1823 273.537 93.6501 271.545 94.9082 271.545C96.5857 271.65 96.5857 271.755 95.2228 272.908Z");
    			add_location(path0, file$1, 68, 96, 1621);
    			attr_dev(path1, "d", "M270.733 147.306C241.272 152.653 225.021 164.29 203.948 195.429C199.335 202.139 199.02 202.978 199.02 209.478C199.02 214.51 197.972 219.438 195.246 227.93C190.633 242.294 190.842 245.649 197.447 256.867C200.068 261.271 202.165 265.465 202.165 265.989C202.165 266.618 200.802 268.61 199.02 270.497C193.463 276.473 193.568 285.699 199.335 291.885C202.69 295.345 210.553 298.595 212.65 297.232C213.174 296.918 212.44 294.506 211.077 291.78C209.609 289.159 208.456 286.224 208.561 285.28C208.561 284.232 209.085 284.546 209.714 286.224C211.496 290.103 219.779 302.894 223.868 307.926C231.941 317.991 249.345 328.161 265.596 332.46C270.524 333.718 279.226 334.871 286.565 335.186C293.484 335.5 298.202 336.129 297.049 336.549C290.758 338.75 261.821 334.661 248.506 329.629L241.587 327.008L239.804 329.419C233.199 338.121 225.65 357.937 223.763 371.357L223.239 375.341H288.242C349.681 375.341 353.245 375.236 352.721 373.454C352.407 372.51 350.729 366.219 349.052 359.509C345.382 345.041 342.446 337.807 337.728 331.621C335.841 329.105 334.269 326.484 334.269 325.75C334.373 325.121 336.994 322.604 340.245 320.298C346.116 316.104 354.189 307.612 358.592 300.902C360.06 298.7 362.367 296.918 364.464 296.289C366.246 295.764 369.601 293.563 371.907 291.466C379.142 284.546 379.876 275.11 373.48 269.553C371.278 267.666 370.964 266.723 371.593 263.368C372.012 261.271 372.641 259.279 373.061 258.964C373.48 258.65 374.424 255.609 375.158 252.149C376.206 247.117 376.206 243.238 375.158 232.439C374.424 225.1 373.375 219.124 372.851 219.124C372.327 219.124 372.012 216.188 372.117 212.518C372.327 206.752 371.803 204.97 368.028 197.631C362.996 187.67 355.552 176.767 348.003 168.589C343.39 163.556 340.349 161.564 328.502 155.693C320.115 151.604 311.517 148.144 307.324 147.306C298.622 145.418 280.798 145.418 270.733 147.306Z");
    			add_location(path1, file$1, 68, 4497, 6022);
    			attr_dev(path2, "d", "M147.646 261.69C147.646 262.005 149.638 264.94 152.154 268.19C154.67 271.441 158.13 276.578 160.017 279.409C164.945 287.272 176.373 311.805 179.728 321.556C183.397 331.935 183.083 332.669 172.074 342C167.88 345.565 164.421 349.34 164.421 350.178C164.421 351.122 169.138 356.154 174.905 361.606C181.196 367.373 185.389 372.091 185.389 373.349C185.389 375.236 186.228 375.341 200.067 375.341C211.076 375.341 214.746 375.026 214.746 373.978C214.746 369.574 189.059 277.207 186.647 272.804C186.228 271.965 179.518 269.763 171.76 267.771C164.001 265.884 155.928 263.577 153.726 262.634C149.428 260.956 147.646 260.642 147.646 261.69Z");
    			add_location(path2, file$1, 68, 6332, 7857);
    			attr_dev(svg, "width", "378");
    			attr_dev(svg, "height", "376");
    			attr_dev(svg, "viewBox", "0 0 378 376");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "box-sizing", "inherit");
    			attr_dev(svg, "class", "svelte-vhwgch");
    			add_location(svg, file$1, 68, 8, 1533);
    			attr_dev(div, "class", "hero-image svelte-vhwgch");
    			add_location(div, file$1, 67, 6, 1499);
    			attr_dev(section, "class", "hero__Wrapper  svelte-vhwgch");
    			add_location(section, file$1, 64, 4, 1361);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, p);
    			append_dev(section, t3);
    			append_dev(section, div);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.31.2 */

    const file$2 = "src\\components\\Footer.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "©  2021 RICK AND MORTY EGT CHALLANGE";
    			attr_dev(div0, "class", "Footer-copy");
    			add_location(div0, file$2, 21, 4, 313);
    			attr_dev(div1, "class", "Footer-container");
    			add_location(div1, file$2, 20, 2, 277);
    			attr_dev(div2, "class", "Footer svelte-lt2mi9");
    			add_location(div2, file$2, 19, 0, 253);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Main.svelte generated by Svelte v3.31.2 */
    const file$3 = "src\\components\\Main.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let footer;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "Main-container svelte-127rpa3");
    			add_location(div0, file$3, 21, 0, 422);
    			attr_dev(div1, "class", "Main svelte-127rpa3");
    			add_location(div1, file$3, 20, 0, 402);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div0, t);
    			mount_component(footer, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Footer });
    	return [$$scope, slots];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\TimeLine.svelte generated by Svelte v3.31.2 */
    const file$4 = "src\\components\\TimeLine.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (11:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 11, 4, 161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(11:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:4) {#each posts as post }
    function create_each_block(ctx) {
    	let card;
    	let current;
    	const card_spread_levels = [/*post*/ ctx[1]];
    	let card_props = {};

    	for (let i = 0; i < card_spread_levels.length; i += 1) {
    		card_props = assign(card_props, card_spread_levels[i]);
    	}

    	card = new Card({ props: card_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = (dirty & /*posts*/ 1)
    			? get_spread_update(card_spread_levels, [get_spread_object(/*post*/ ctx[1])])
    			: {};

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:4) {#each posts as post }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*posts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*posts*/ 1) {
    				each_value = /*posts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TimeLine", slots, []);
    	let { posts = [] } = $$props;
    	const writable_props = ["posts"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeLine> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("posts" in $$props) $$invalidate(0, posts = $$props.posts);
    	};

    	$$self.$capture_state = () => ({ Card, posts });

    	$$self.$inject_state = $$props => {
    		if ("posts" in $$props) $$invalidate(0, posts = $$props.posts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [posts];
    }

    class TimeLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { posts: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeLine",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get posts() {
    		throw new Error("<TimeLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posts(value) {
    		throw new Error("<TimeLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;

    // (46:0) <Main>
    function create_default_slot(ctx) {
    	let timeline;
    	let current;

    	timeline = new TimeLine({
    			props: { posts: /*data*/ ctx[0].results },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(timeline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timeline, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const timeline_changes = {};
    			if (dirty & /*data*/ 1) timeline_changes.posts = /*data*/ ctx[0].results;
    			timeline.$set(timeline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timeline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(46:0) <Main>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let header;
    	let t;
    	let main;
    	let current;
    	header = new Header({ $$inline: true });

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const main_changes = {};

    			if (dirty & /*$$scope, data*/ 3) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API = "https://rickandmortyapi.com/api/character";

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let data = {};

    	onMount(async () => {
    		const response = await fetch(API);
    		$$invalidate(0, data = await response.json());

    		//  data.results.map((person)=> console.log(person));
    		console.log(data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Card,
    		Header,
    		Main,
    		TimeLine,
    		data,
    		API
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Cami',
    		lastName: 'Rojas'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
