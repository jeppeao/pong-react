import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Vec2D } from "./pong";
import { Orientation } from "./constants";

const getOrientation = (height: number, width: number) => {
  return width > height ? Orientation.horizontal : Orientation.vertical;
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
  }, []);

  useEffect(() => {
    const handleKeyUp = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        setActiveKeys(cur => cur.filter(v => v !== e.key));
       }
     }
    node.addEventListener('keyup', handleKeyUp);
    return () => node.removeEventListener('keyup', handleKeyUp);
  }, []);

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
  },[]);
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
  },[]);
}
