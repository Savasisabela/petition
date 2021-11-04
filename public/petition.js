// write client-side JS logic, that allows users to draw their signature on the canvas:

// - you can use vanilla JS or jQuery, this is your decision

// - You will need 3 events for the logic to work out:
// 1. mousedown: → start drawing
// 2. mousemove: → if the mouseis down draw the line based on the position of the user's cursor. You will need to figure out where the user's cursor is within the canvas element. This will require some calculation, you will need to look at some property on the canvas and some property on the event object.
// 3. mouseup: → finish drawing This will involve converting your canvas content into a DataURL - to get the image you have drawn on your canvas utilise canvas' toDataURL method - and set the value of your hidden input field to be equal to the DataURL you retrieved from your canvas.
