import { useState, useEffect, useLayoutEffect } from "react";
import { Orientation } from "./constants";

const getOrientation = (height: number, width: number) => {
  return width > height ? Orientation.horizontal : Orientation.vertical;
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
