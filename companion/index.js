import { settingsStorage } from "settings";
import { me } from "companion";
import * as messaging from "messaging";

let CLOCK_TEXT_COLOR = "clockTextColor";

settingsStorage.onchange = function(evt) {
    sendValue(evt.key, evt.newValue);
}

// Settings were changed while the companion was not running
if (me.launchReasons.settingsChanged) {
    sendValue(CLOCK_TEXT_COLOR, settingsStorage.getItem(CLOCK_TEXT_COLOR));
}

function sendValue(key, val) {
if (val) {
    sendSettingData({
    key: key,
    value: JSON.parse(val)
    });
}
}
function sendSettingData(data) {
// If we have a MessageSocket, send the data to the device
if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
} else {
    console.log("No peerSocket connection");
}
}