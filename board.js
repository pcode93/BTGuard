var jf = require('johnny-five'),
    board = new jf.Board();

board.on('ready', () => {
    var pin = new jf.Pin(2),
        gyro = new jf.Gyro({
            controller: "MPU6050"
        }),
        initialPosition = {},
        pinState = 0,
        loop;

    board.serialConfig({
        portId: board.io.SERIAL_PORT_IDs.SW_SERIAL0,
        baud: 9600,
        rxPin: 10,
        txPin: 9
    });

    board.io.serialRead(board.io.SERIAL_PORT_IDs.SW_SERIAL0, function(bytes) {
         if(+Buffer.from(bytes).toString()) {
            gyro.once('data', (data) => {
                initialPosition.x = data.x;
                initialPosition.y = data.y;
                initialPosition.z = data.z;
            })

            gyro.on('change', (data) => {
                if((data.x > initialPosition.x + 2)
                    || (data.y > initialPosition.y + 2)
                    || (data.z > initialPosition.z + 2)) {
                    gyro.removeAllListeners('change');

                    loop = setInterval(() => pin.write(pinState ^= 1), 500);
                }
            })
         } else {
            clearInterval(loop);
            pin.low();
            gyro.removeAllListeners('change');
         }
    });
});
