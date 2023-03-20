import { useActiveKeys } from "./common/hooks";


//========================
//    HELPER FUNCTIONS    
//========================    



// const usePointerEvent = (eventType: string, callback: (e: Event) => void, node = document) => {
//   const callbackRef = useRef(callback);
//   useLayoutEffect(() => {
//     callbackRef.current = callback;
//   });

//   const handleEvent = useCallback((e: Event) => {
//     if (e.type === eventType) {
//       callbackRef.current(e);
//     }
//   }, [eventType]);
  
//   useEffect(() => {
//     node.addEventListener(eventType, handleEvent);
//     return () => node.removeEventListener(eventType, handleEvent);
//   }, [handleEvent, node, eventType]);
// }


// const usePointerControls = (dimensions: Vec2D, orientation: string) => {
//   const coor = useRef(vec2D(0.5, 0.5));

//   const handleDrag = (e: Event) => {
//     if (e instanceof MouseEvent) {
//       const x = e.clientX / dimensions.x;
//       const y = e.clientY / dimensions.y;
//       coor.current = orientation === "horz" ? vec2D(x, y) : vec2D(y, x);
//     }
//   }

//   const handlePointerUp = () => {
//     document.removeEventListener("pointermove", handleDrag);
//   }
//   const handlePointerDown = (e:Event) => {
//     if (e instanceof MouseEvent) {
//       const x = e.clientX / dimensions.x;
//       const y = e.clientY / dimensions.y;
//       coor.current = orientation === "horz" ? vec2D(x, y) : vec2D(y, x);
//       document.addEventListener("pointermove", handleDrag);
//       document.addEventListener("pointerup", handlePointerUp, {once: true});
//     }
//   }
//   usePointerEvent("pointerdown", handlePointerDown);
//   return coor.current;
// }



