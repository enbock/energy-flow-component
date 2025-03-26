# Energy flow web component

<center>
    <img src="public/efc_logo.png" alt="EFC Logo" width="300"/>
</center>

This component simulates the flow of energy (or water? or air? or particles?)

The idea is so visualize how much energy goes from and to the energy connections inside my home power grid in a style of
a "medium" instead visualize cables or arrows.

## AI generated content

Of course, I don't have fun to write down all the code. So the first POC I let create by OpenAI GPT o1 ;)

[See more here](AI-First-Draft.md)

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
