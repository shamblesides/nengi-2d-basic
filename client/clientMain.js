
import GameClient from './GameClient';

import { pxcan, fill, pointer, pad } from 'pxcan';

const updateClient = GameClient()

let previous = performance.now();

pxcan({ height: 144, width: 144 }, [pointer(), pad({ up: 'w', left: 'a', down: 's', right: 'd' })], function({ touches, buttons }) {
    const now = performance.now()
    const delta = (now - previous) / 1000
    previous = now

    const guySprites = updateClient(delta, { touches, buttons });

    return {
        sprites: [
            fill('gray'),
            ...guySprites,
        ]
    }
}).fullscreen();
