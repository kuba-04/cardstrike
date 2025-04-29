Quick start
I have created a component that includes a button with onContextMenu props as below.

Copy

Copy
function App(props) {

    function handleOnRightClick(e) {
        console.log("right click is triggered");
    }

    return (
      <div>
        <button onContextMenu={handleOnRightClick}>Right Click Here</button>
      </div>
    );

}
Right-clicking on the button will result in the following two actions

This will print in the console with right click is triggered,

This will still show the default behavior of right-clicking (usual browser right-click)

To prevent the second point, we have to call preventDefault of that event on the event handler. And we need to show our menu instead of the system default one. So here

Maintain the state of the menu visibility (Show/Hide context menu)
const [showContextMenu, setShowContextMenu] = React.useState(false);

Track where the click has happened (currently we are using a button, what if we want to enable the context menu inside a section?). We can always capture the click event locations using the event handler as below

Copy

Copy
const [showContextMenu, setShowContextMenu] = React.useState(false);
const [positions, setPositions] = React.useState({});

    function handleOnRightClick(e) {
      e.preventDefault();

      setPositions({ xPosition: `${e.pageX}px`, yPosition: `${e.pageY}px` });

      setShowContextMenu(true);
    }

Now, let's add some content to be visible on right-click, component will look as below.

Copy

Copy
function App(props) {

    const [showContextMenu, setShowContextMenu] = React.useState(false);
    const [positions, setPositions] = React.useState({});

    function handleOnRightClick(e) {
      e.preventDefault();

      setPositions({ xPosition: `${e.pageX}px`, yPosition: `${e.pageY}px` });

      setShowContextMenu(true);
    }

    return (
      <div>
        <button onContextMenu={handleOnRightClick}>Right Click Here</button>
        {showContextMenu ? <div>
            <div className="right-click-option">Do some action</div>
            <div className="right-click-option">Do another action</div>
            <div className="right-click-option">What about third?</div>
        </div>: null}
      </div>
    );

}
Now let's do some refactoring and create a reusable component. Also we want to add a feature to close the menu for any clicks that happen on the page. So add listener for the clicks and toggle the context menu.

Copy

Copy
function App(props) {
const [showContextMenu, setShowContextMenu] = React.useState(false);
const [positions, setPositions] = React.useState({});

function handleOnRightClick(e) {
e.preventDefault();

    setPositions({ xPosition: `${e.pageX}px`, yPosition: `${e.pageY}px` });

    setShowContextMenu(true);

}

return (
<div>
<button onContextMenu={handleOnRightClick}>Right Click Here</button>
<ContextMenu
showContextMenu={showContextMenu}
toggle={() => setShowContextMenu(false)}
yPosition={positions.yPosition}
xPosition={positions.xPosition} >
<div className={"right-click-option"}>Do some action</div>
<div className="right-click-option">Do another action</div>
<div className="right-click-option">What about third?</div>
</ContextMenu>
</div>
);
}

function ContextMenu({
children,
showContextMenu,
toggle,
yPosition,
xPosition,
}) {
React.useEffect(() => {
if (showContextMenu) {
document.addEventListener("click", toggle);
}
return () => {
document.removeEventListener("click", toggle);
};
});

if (showContextMenu) {
return (
<div
className="right-click"
style={{
          top: yPosition,
          left: xPosition,
        }} >
{children}
</div>
);
}

return null;
}
Add pour some CSS too :)

Copy

Copy
button {
padding: 5px 10px;
}

.right-click {
position: absolute;
background: #fff;
border: 1px solid gray;
}
.right-click-option {
padding: 5px 10px;
cursor: default;
}
.right-click-option:hover {
background: skyblue;
color: white;
}
