import ADB from 'appium-adb';
import { checkIfOn, togglePower } from './device-action.js';
import { DeviceMap } from './device-manager.js';

async function setPowerOne(client: ADB, on?: boolean) {
  const isOn = await checkIfOn(client);
  if (isOn !== on) {
    await togglePower(client);
    return !isOn;
  }
  return on;
}

/**
 * Turn all devices on or off.
 */
export async function setPower(
  device: ADB | DeviceMap,
  on: boolean | 'toggle',
): Promise<boolean> {
  if (device instanceof Map) {
    let allOn: boolean;
    if (on === 'toggle') {
      const powerStates = await Promise.all(
        Array.from(device.values()).map(async (client) => ({
          on: await checkIfOn(client),
          client,
        })),
      );
      const numOn = powerStates.filter((state) => state.on).length;
      const numOff = powerStates.length - numOn;
      allOn = numOn < numOff;
    } else {
      allOn = on;
    }

    await Promise.all(
      Array.from(device.values()).map((client) => setPowerOne(client, allOn)),
    );
    return allOn;
  } else {
    return await setPowerOne(device);
  }
}
