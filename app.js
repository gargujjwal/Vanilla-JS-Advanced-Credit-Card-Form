"use strict";

// give current year + 10 years to expiration-year element in
const expirationYear = document.querySelector("#expiration-year");
const currYear = new Date().getFullYear();
for (let i = 0; i < 10; i++) {
    const option = document.createElement("option");
    option.textContent = option.value = `${currYear + i}`;
    expirationYear.appendChild(option);
}

function isConnectedInput(input) {
    return input.parentElement.hasAttribute("data-connected-inputs");
}


document.addEventListener("keydown", (evt) => {
    // if the element that fired this event is not connected input don't do anything
    if (!isConnectedInput(evt.target)) return;

    switch (evt.key.toLowerCase()) {
        case "arrowleft":
            if (evt.target.selectionStart === 0 && evt.target.selectionEnd === 0) {
                const prev = evt.target.previousElementSibling;
                // only go to prev input tag if prev exists
                if (prev) {
                    prev.focus();
                    prev.setSelectionRange(prev.value.length, prev.value.length);
                    evt.preventDefault()
                }
            }
            break;

        case "arrowright":
            const len = evt.target.value.length;
            if (evt.target.selectionStart === len && evt.target.selectionEnd === len) {
                const next = evt.target.nextElementSibling;
                if (next) {
                    next.focus();
                    evt.target.setSelectionRange(0, 0); // to move cursor in the current input field to starting of the field
                    evt.preventDefault()
                }
            }
            break;

        case "delete":
            const length = evt.target.value.length
            // if cursor is at an end of 1 text box and delete is pressed then next
            // input box should handle it
            if (evt.target.selectionStart === length && evt.target.selectionEnd === length) {
                const next = evt.target.nextElementSibling;
                if (next) {
                    next.focus();
                    next.setSelectionRange(0, 0);
                }
            }
            break;
        case "backspace":
            if (evt.target.selectionStart === 0 && evt.target.selectionEnd === 0) {
                const prev = evt.target.previousElementSibling;
                if (prev) {
                    prev.focus();
                    prev.setSelectionRange(prev.value.length, prev.value.length)
                }
            }
            break;
        default:
            // if ctrl or alt key is pressed, that means user is trying to use
            // some shortcut so let them
            if (evt.key.length > 1) return;

            // don't let input anything besides number
            if (!evt.key.match(/^\d$/))
                return evt.preventDefault();

            evt.preventDefault();
            changeInput(evt.target, evt.key)
    }
});

function onInputChange(input, val, selectionStart = 0, selectionEnd = 0) {
    // have to add the value at selection start and push all the text to other input
    const newVal = `${input.value.substring(0, selectionStart)}${val}${input.value.substring(selectionEnd, 4)}`;
    input.value = newVal.substring(0, 4);
    if (newVal.length > 4) {
        const next = input.nextElementSibling;
        if (next == null)
            return;
        onInputChange(next, newVal.substring(4), next.value.length, next.value.length);
    }
}

function changeFocus(input, length) {
    // iterate to next input until right location is found
    while (length > 4 && input.nextElementSibling) {
        length -= 4;
        input = input.nextElementSibling;
    }

    if (length > 4) length = 4;
    input.focus();
    input.setSelectionRange(length, length)
}

function changeInput(input, text) {

    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    onInputChange(input, text, selectionStart, selectionEnd);
    changeFocus(input, text.length + selectionStart);

    // change card logo according to first 4 digits of card
    const firstFour = document.querySelector("#cc-1").value;
    // assuming if credit card starts with 4 then vis otherwise master card
    const img = document.querySelector(".logo");
    if (firstFour.startsWith("4"))
        img.setAttribute("src", "./images/cards/mastercard.svg");
    else if (firstFour.startsWith("5"))
        img.setAttribute("src", "./images/cards/discover.svg");
    else if (firstFour.startsWith("6"))
        img.setAttribute("src", "./images/cards/americanexpress.svg");
    else
        img.setAttribute("src", "./images/cards/visa.svg");


}

document.querySelectorAll("div[data-connected-inputs]")
    .forEach(e => {
        e.addEventListener("paste", evt => {
            const text = evt.clipboardData.getData("text");
            // return if text is not a credit card number
            if (!text.match(/^\d+$/)) return evt.preventDefault();

            changeInput(evt.target, text);
        });
    });

