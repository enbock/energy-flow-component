# Energy flow web component

<center>
    <img src="public/images/efc_logo.png" alt="EFC Logo" width="300"/>
</center>

This component simulates the flow of energy (or water? or air? or particles?)

The idea is so visualize how much energy goes from and to the energy connections inside my home power grid in a style of
a "medium" instead visualize cables or arrows.

## AI generated content

Of course, I don't have fun to write down all the code. So the first POC I let create by OpenAI GPT o1 ;)

Over the time I used Clause Sonnet and Opus via Copilot CLI to write test, update environment and code my ideas down.

## Usage of component

```html

<html>
<head>
    <script type="module" src="@enbock/energy-flow-component/index.js"></script>
</head>
<body>
<div title="Position the component by setup this container">
    <energy-flow>
        <energy-connection value="1800" x="0" y="-.8"></energy-connection>
        <energy-connection value="200" x="-0.80" y="-.60"></energy-connection>
        <energy-connection value="-200" x="-0.7" y=".1"></energy-connection>
        <energy-connection value="-1100" x="-0.3" y=".7"></energy-connection>
        <energy-connection value="-600" x=".8" y="0"></energy-connection>
    </energy-flow>
</div>
</body>
</html>

```

### Coordinate system

The `x` and `y` is relative to the container of the `energy-flow` component. The values are between -1 and 1.
The position `0,0` is the center of the container.

### Positioning energy connections

You can use the energy-connection element to position element as overlay to the energy-flow component.

To do so, add something's inside the energy-connection element.

```html

<energy-flow>
    <energy-connection color="rgba(0, 0, 255, 0.5)" value="1000" x="0" y="-.8">
        SOURCE
    </energy-connection>
    <energy-connection color="rgba(255, 0, 0, 0.5)" value="-1000" x=".2" y=".8">
        TARGET
    </energy-connection>
</energy-flow>
```

Position the connection just absolute and move the anker point in the center of the element:

````css
energy-connection {
    display: block;
    position: absolute;

    transform: translate(-50%, -50%);
}
````

The component will calculate the position of the energy connection and set the `top` and `left` style attribute.

## Optional attributes

The `<energy-flow>` element accepts a few optional attributes to control its behaviour at runtime.

### `max-at`

`max-at` scales the rendered particle activity with the total positive power on the connections. The value is the power
(in the same unit you feed into `<energy-connection value="…">`) at which the visualisation runs at full intensity —
the configured per-source spawn rate is reached. Below that, the spawn rate per tick is reduced proportionally: at 50%
of `max-at` half as many particles spawn per tick (fractional rates are accumulated, so a rate of 0.5 produces one
particle every other tick). At zero power no particles spawn. When the attribute is omitted (or set to `0`) no scaling
is applied and the component always runs at full intensity.

```html
<energy-flow max-at="20000">
    <energy-connection value="12000" x="0" y="-.7"></energy-connection>
    <energy-connection value="-12000" x="0" y=".8"></energy-connection>
</energy-flow>
```

You can update the value at any time; the new scale takes effect on the next tick.

### `spawn-per-source`

`spawn-per-source` overrides the configured number of particles that are emitted per source on each spawn tick. Higher
values produce a denser stream; lower values thin it out. The value must be a positive integer; invalid or missing
attributes leave the configured default in place.

```html
<energy-flow spawn-per-source="3">
    <energy-connection value="12000" x="0" y="-.7"></energy-connection>
    <energy-connection value="-12000" x="0" y=".8"></energy-connection>
</energy-flow>
```

### `debug-trajectories`

Setting `debug-trajectories` renders every particle's precomputed flight path on the canvas in the particle's source
colour. This is useful while tuning trajectories or debugging routing behaviour.

```html
<energy-flow debug-trajectories>
    <energy-connection value="1000" x="0" y="-.8"></energy-connection>
    <energy-connection value="-1000" x="0" y=".8"></energy-connection>
</energy-flow>
```

Toggle it at runtime the same way:

```html
<label><input id="debug-toggle" type="checkbox">Show trajectories</label>
<script>
    document.getElementById('debug-toggle').addEventListener('change', function (event) {
        document.querySelectorAll('energy-flow').forEach(function (element) {
            if (event.target.checked) element.setAttribute('debug-trajectories', '');
            else element.removeAttribute('debug-trajectories');
        });
    });
</script>
```
