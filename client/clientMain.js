
import GameClient from './GameClient';

import { pxcan, pointer, pad } from 'pxcan';

const binds = { up: 'w', left: 'a', down: 's', right: 'd' };

const view = GameClient()

pxcan({ height: 144, width: 144 }, [pointer(), pad(binds)], view).fullscreen();
