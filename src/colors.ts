interface RGB {
    r: Number;
    g: Number;
    b: Number;
}

const RGBWhite = {r: 1, g: 1, b: 1};

function unimplemented(msg? : string) {
    let error_msg = "ERROR: An unimplemented function is being called"
    if (msg) {
        console.error(error_msg + " in a " + msg)
    } else {
        console.error(error_msg)
    }
    throw Error;
}