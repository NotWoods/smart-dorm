import { startIntent, DeviceManager } from '@cell-wall/android-bridge';
import { toUri, CellManager, CellData } from '@cell-wall/cells';

export function cellBridge(deviceManager: DeviceManager, cells: CellManager) {
  cells.on('state', async (data: CellData) => {
    const device = deviceManager.devices.get(data.serial);
    if (!device) return;

    console.log(data);
    const base = data.info?.server || process.env.SERVER_ADDRESS;

    await startIntent(device, {
      action: 'com.tigeroakes.cellwallclient.DISPLAY',
      dataUri: toUri(data.state, base).replace(/&/g, '\\&'),
    });
  });
}
