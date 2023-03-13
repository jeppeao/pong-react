import { useRef, useState } from 'react';
import './App.css';
import { AppOld } from './script';
import { useInitialOrientation, useOrientationOnResize } from './hooks';
import { Orientation } from './constants';


export const App = () => {
  console.log('starting App')

  const ref = useRef<HTMLDivElement | null>(null);
  const [orientation, setOrientation] = useState(Orientation.vertical);
  
  useInitialOrientation(ref, setOrientation);
  useOrientationOnResize(ref, setOrientation);

  return (
    <div ref={ref}>
      <AppOld />
    </div>
  )
}

export default App;