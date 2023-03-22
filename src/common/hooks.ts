import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { Orientation, Player } from "./constants";
import { vec2D } from "./pong";

const getOrientation = (height: number, width: number) => {
  return width > height ? Orientation.horizontal : Orientation.vertical;
}

const throttle = <Args extends unknown[]>(
  fn: (...args: Args) => void, 
  cooldown: number
) => {
  let lastArgs: Args | undefined;

  const run = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = undefined;
    }
  };
  
  const throttled = (...args: Args) => {
    const isOnCooldown = !!lastArgs;
    lastArgs = args;
    if (isOnCooldown) {
      return;
    }
    
    window.setTimeout(run, cooldown);
  }

  return throttled;
} 

export const useFrameTime = () => {
  const [frameTime, setFrameTime] = useState(0);
  useEffect(() => {
    let frameId: number;
    const frame = (time: number) => {
      setFrameTime(time);
      frameId = requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
  
  return frameTime;
}

export const useActiveKeys = (node = document) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      if (e instanceof KeyboardEvent && !activeKeys.includes(e.key)) {
        setActiveKeys(cur => [...cur, e.key] );
      }
    }
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [node, activeKeys]);

  useEffect(() => {
    const handleKeyUp = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        setActiveKeys(cur => cur.filter(v => v !== e.key));
       }
     }
    node.addEventListener('keyup', handleKeyUp);
    return () => node.removeEventListener('keyup', handleKeyUp);
  }, [node, activeKeys]);

  return activeKeys;
}

export const usePointerEventNavigation = (node = window) => {
  const activePointers = useRef({[Player.P1]: 0.5, [Player.P2]: 0.5})
  const updatePointers = (x: number, y: number) => {
    const [height, width] = [window.innerHeight, window.innerWidth];
    const xG = x / width;
    const yG = y / height;
    const coord = width > height ? vec2D(xG, yG) : vec2D(yG, xG);
    let newP = {};
    if (coord.x < 0.4) newP = {[Player.P1]: coord.y};
    if (coord.x > 0.6) newP = {[Player.P2]: coord.y};
    activePointers.current = {...activePointers.current, ...newP};
  }

  const handleDrag = useMemo(() => 
    throttle((e: Event) => {
        if (e instanceof PointerEvent) {
          updatePointers(e.clientX, e.clientY);
        }
      }, 100),
  []);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      updatePointers(e.clientX, e.clientY);
      window.addEventListener('pointermove', handleDrag);
      window.addEventListener('pointerup', handlePointerUp);
    } 

    const handlePointerUp = (e: Event) => {
      window.removeEventListener('pointermove', handleDrag);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [handleDrag]);

  return activePointers.current;
}

export const useInitialOrientation = (
  node: React.MutableRefObject<HTMLDivElement | null>,
  setOrientation: React.Dispatch<React.SetStateAction<Orientation>>
) => {
  useLayoutEffect(() => {
    if (node.current !== null) {
      let rect = node.current.getBoundingClientRect();
      setOrientation(() => {
        return getOrientation(rect.height, rect.width); 
      });
    }
  },[node, setOrientation]);
}

export const useOrientationOnResize = (
  node: React.MutableRefObject<HTMLDivElement | null>,
  setOrientation: React.Dispatch<React.SetStateAction<Orientation>>
) => {
  useEffect(() => {
    const onResize = () => {
      if (node.current !== null) {
        let rect = node.current.getBoundingClientRect();
        setOrientation(() => {
          return getOrientation(rect.height, rect.width); 
        });
      }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  },[node, setOrientation]);
}
